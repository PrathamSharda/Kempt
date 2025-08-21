import os
import sys
import asyncio
import argparse
import subprocess
from pathlib import Path
from google.cloud import storage
import tempfile
import time
import shutil
from dotenv import load_dotenv
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain.schema.document import Document
from langchain_google_genai import GoogleGenerativeAIEmbeddings, ChatGoogleGenerativeAI
try:
    from langchain_chroma import Chroma
except ImportError:
    from langchain_community.vectorstores import Chroma
import warnings

warnings.filterwarnings("ignore", category=DeprecationWarning)
warnings.filterwarnings("ignore", category=UserWarning)

load_dotenv()

def cleanup_old_databases(base_path, max_age_hours=24):
    if not os.path.exists(base_path):
        return
    
    current_time = time.time()
    max_age_seconds = max_age_hours * 3600
    
    for item in os.listdir(base_path):
        item_path = os.path.join(base_path, item)
        if os.path.isdir(item_path):
            item_age = current_time - os.path.getctime(item_path)
            if item_age > max_age_seconds:
                try:
                    shutil.rmtree(item_path)
                except Exception:
                    pass

def get_persistent_db_path(user_id=None):
    base_dir = "./rag_db"
    os.makedirs(base_dir, exist_ok=True)
    
    cleanup_old_databases(base_dir)
    
    if user_id:
        db_path = os.path.join(base_dir, f"user_{user_id}")
    else:
        db_path = os.path.join(base_dir, "default")
    
    os.makedirs(db_path, exist_ok=True)
    return db_path

def init_gcs_client():
    try:
        client = storage.Client()
        return client
    except Exception as e:
        return None

def list_pdf_files_in_gcs(bucket_name, user_id, prefix=""):
    try:
        client = init_gcs_client()
        if not client:
            return []
        bucket = client.bucket(bucket_name)
        blobs = list(bucket.list_blobs(prefix=f"{user_id}/{prefix}"))
        
        pdf_files = []
        for blob in blobs:
            if blob.name.lower().endswith('.pdf') and not blob.name.endswith('/'):
                pdf_files.append(f"gs://{bucket_name}/{blob.name}")
        
        return pdf_files
    except Exception as e:
        return []

def download_from_gcs(gcs_path, user_id):
    try:
        if not gcs_path.startswith('gs://'):
            raise ValueError("Invalid GCS path format. Must start with 'gs://'")
        
        path_parts = gcs_path[5:].split('/', 1)
        bucket_name = path_parts[0]
        blob_name = path_parts[1] if len(path_parts) > 1 else ''
        
        if not blob_name or blob_name.endswith('/'):
            prefixes_to_try = [""]
            pdf_files = []
            for prefix in prefixes_to_try:
                pdf_files = list_pdf_files_in_gcs(bucket_name, user_id, prefix)
                if pdf_files:
                    break
            
            if pdf_files:
                selected_file = pdf_files[0]
                path_parts = selected_file[5:].split('/', 1)
                bucket_name = path_parts[0]
                blob_name = path_parts[1] if len(path_parts) > 1 else ''
            else:
                return None, None
        
        client = init_gcs_client()
        if not client:
            raise Exception("Failed to initialize GCS client")
        
        bucket = client.bucket(bucket_name)
        blob = bucket.blob(blob_name)
        
        if not blob.exists():
            raise FileNotFoundError(f"File not found in GCS: {gcs_path}")
        
        file_size = blob.size
        if file_size == 0:
            raise ValueError(f"File is empty: {gcs_path}")
        
        
        temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=".pdf")
        temp_file_path = temp_file.name
        temp_file.close()
        
        blob.download_to_filename(temp_file_path)
        
        downloaded_size = os.path.getsize(temp_file_path)
        if downloaded_size == 0:
            raise ValueError(f"Downloaded file is empty: {temp_file_path}")
        
        def cleanup():
            try:
                if os.path.exists(temp_file_path):
                    os.remove(temp_file_path)
            except Exception:
                pass
        
        return temp_file_path, cleanup
    except Exception as e:
        return None, None

class RAGPipeline:
    def __init__(self, google_api_key, db_path=None, model_name="gemini-1.5-flash", verbose=False, user_id=None):
        self.google_api_key = google_api_key
        self.db_path = db_path or get_persistent_db_path(user_id)
        self.model_name = model_name
        self.pagesContent = True
        self.verbose = verbose
        os.environ['GOOGLE_API_KEY'] = self.google_api_key
    
    def _log(self, message):
        if self.verbose:
            print(message)
    
    async def document_loader(self, path):
        loader = PyPDFLoader(path)
        pages = await loader.aload()
        count = 0
        if any(page.page_content != "" for page in pages):
            count = count + 1
        if count == 0:
            self.pagesContent = False
        return pages
    
    def split_documents(self, documents):
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=900,
            chunk_overlap=80,
            length_function=len,
            is_separator_regex=False,
        )
        return text_splitter.split_documents(documents)
    
    def get_embedding_function(self):
        embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001")
        return embeddings
    
    def chunk_id_maker(self, chunks, user_id):
        page_id = None
        current_chunk = 0
        
        for chunk in chunks:
            source = chunk.metadata.get("source")
            page = chunk.metadata.get("page")
            
            if page_id == page:
                current_chunk += 1
            else:
                current_chunk = 0
                page_id = page
            
            current_page_id = f"{user_id}:{source}:{page}:{current_chunk}"
            chunk.metadata["cid"] = current_page_id
            chunk.metadata["user_id"] = user_id
        
        return chunks
    
    def add_to_chroma(self, chunks):
        batch_size = 5461
        
        db = Chroma(
            persist_directory=self.db_path,
            embedding_function=self.get_embedding_function()
        )
        for i in range(0, len(chunks), batch_size):
            batch = chunks[i : i + batch_size]
            chunk_ids = [chunk.metadata["cid"] for chunk in batch]
            db.add_documents(batch, ids=chunk_ids)
    
    async def process_document(self, file_path, user_id):
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"The file {file_path} doesn't exist")

        pages = await self.document_loader(file_path)

        if self.pagesContent == False:
            raise ValueError("The pages seems to have no text content in them trying FIX PDF OPTION") 
        chunks = self.split_documents(pages)

        chunks = self.chunk_id_maker(chunks, user_id)

        self.add_to_chroma(chunks)

        return True
    
    def query(self, question, user_id, k=6, max_tokens=500):
        embedding_function = self.get_embedding_function()
        db = Chroma(
            persist_directory=self.db_path, 
            embedding_function=embedding_function
        )

        retrieving_data = db.similarity_search_with_score(question, k=k, filter={"user_id": user_id})
        
        if not retrieving_data:
            return "No relevant documents found in the database."
        
        context = ""
        for doc, score in retrieving_data:
            context += f"---{doc.page_content}\n"
        
        prompt_template = f"""
Answer the question based on the following context. Do not make up information that is not in the context provided, make the answer nicely worded and completely answers the question according to the context:

Context:
{context}

Question: {question}

Answer:"""

        try:
            llm = ChatGoogleGenerativeAI(
                model=self.model_name,
                temperature=0.1,
                max_tokens=max_tokens
            )
            
            response = llm.invoke(prompt_template)
            return response.content
                
        except Exception as e:
            return f"Error generating response: {str(e)}"


def spawn_rag_process(file_path, question, google_api_key, user_id, **kwargs):
    cmd = [
        sys.executable,
        __file__,
        "process-and-query",
        "--file", file_path,
        "--question", question,
        "--google-api-key", google_api_key,
        "--user-id", user_id
    ]
    
    if 'model' in kwargs:
        cmd.extend(["--model", kwargs['model']])
    if 'db_path' in kwargs:
        cmd.extend(["--db-path", kwargs['db_path']])
    if 'max_tokens' in kwargs:
        cmd.extend(["--max-tokens", str(kwargs['max_tokens'])])
    if 'top_k' in kwargs:
        cmd.extend(["--top-k", str(kwargs['top_k'])])
    if kwargs.get('quiet', False):
        cmd.append("--quiet")
    
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, check=True)
        return result
    except subprocess.CalledProcessError as e:
        if not kwargs.get('quiet', False):
            print(f"Process failed with return code {e.returncode}")
            print(f"Error output: {e.stderr}")
        return e

async def process_and_query(file_path, question, google_api_key, user_id, model="gemini-2.5-flash",
                          db_path=None, max_tokens=1000, top_k=6, quiet=False):
    rag = RAGPipeline(google_api_key, db_path, model, verbose=not quiet, user_id=user_id)
    temp_file_path = None
    cleanup_func = None
    
    try:
        rag._log("Processing document...")
        
        if file_path.startswith('gs://'):
            temp_file_path, cleanup_func = download_from_gcs(file_path, user_id)
        else:
            temp_file_path = file_path
        
        if not temp_file_path:
            raise ValueError("Failed to download or locate the file")
        
        result = await rag.process_document(temp_file_path, user_id)
        
        if not result:
            return "The document has images where text is not extractable. Pass it through FIX PDF first."
        
        rag._log("Document processed successfully!")
        
        rag._log("Querying document...")
        answer = rag.query(question, user_id, k=top_k, max_tokens=max_tokens)
        
        return answer
        
    except Exception as e:
        return f"Error: {str(e)}"
    finally:
        if cleanup_func:
            cleanup_func()


def main():
    parser = argparse.ArgumentParser(description="RAG Pipeline - Process PDFs and answer questions using Gemini")
    parser.add_argument("command", choices=["process", "query", "process-and-query"], 
                       help="Command to execute")
    parser.add_argument("--file", "-f", help="Path to PDF file")
    parser.add_argument("--question", "-q", help="Question to ask")
    parser.add_argument("--google-api-key", help="Google API key (or set GOOGLE_API_KEY env var)")
    parser.add_argument("--user-id", required=True, help="User ID for document filtering")
    parser.add_argument("--model", default="gemini-1.5-flash", help="Gemini model to use (default: gemini-1.5-flash)")
    parser.add_argument("--db-path", default=None, help="Path to ChromaDB storage")
    parser.add_argument("--max-tokens", type=int, default=1000, help="Maximum tokens for response")
    parser.add_argument("--top-k", type=int, default=6, help="Number of documents to retrieve")
    parser.add_argument("--quiet", "-Q", action="store_true", help="Only print the final answer")
    
    args = parser.parse_args()
    
    google_api_key = args.google_api_key or os.getenv("GOOGLE_API_KEY")
    
    if not google_api_key:
        if not args.quiet:
            print("Error: Google API key not provided. Use --google-api-key or set GOOGLE_API_KEY environment variable.")
            print("You can get a free API key from: https://makersuite.google.com/app/apikey")
        sys.exit(1)
    
    if args.command == "process":
        if not args.file:
            if not args.quiet:
                print("Error: --file argument is required for process command")
            sys.exit(1)
        
        try:
            rag = RAGPipeline(google_api_key, args.db_path, args.model, verbose=not args.quiet, user_id=args.user_id)
            
            if args.file.startswith('gs://'):
                temp_file_path, cleanup_func = download_from_gcs(args.file, args.user_id)
            else:
                temp_file_path = args.file
                cleanup_func = None
            
            if not temp_file_path:
                if not args.quiet:
                    print("Error: Failed to download or locate the file")
                sys.exit(1)
            
            try:
                output = asyncio.run(rag.process_document(temp_file_path, args.user_id))
                if not output:
                    if not args.quiet:
                        print("The Documents has images where text is not extractable pass it through FIX PDF first")
                else:
                    if not args.quiet:
                        print("Document processing completed successfully!")
            finally:
                if cleanup_func:
                    cleanup_func()
                    
        except Exception as e:
            if not args.quiet:
                print(f"Error processing document: {str(e)}")
            sys.exit(1)
    
    elif args.command == "query":
        if not args.question:
            if not args.quiet:
                print("Error: --question argument is required for query command")
            sys.exit(1)
        
        try:
            rag = RAGPipeline(google_api_key, args.db_path, args.model, verbose=not args.quiet, user_id=args.user_id)
            answer = rag.query(args.question, args.user_id, k=args.top_k, max_tokens=args.max_tokens)
            
            if args.quiet:
                print(answer)
            else:
                print(f"\nQuestion: {args.question}")
                print(f"Answer: {answer}")
        except Exception as e:
            if not args.quiet:
                print(f"Error querying: {str(e)}")
            sys.exit(1)
    
    elif args.command == "process-and-query":
        if not args.file or not args.question:
            if not args.quiet:
                print("Error: Both --file and --question arguments are required for process-and-query command")
            sys.exit(1)
        
        try:
            answer = asyncio.run(process_and_query(
                args.file, args.question, google_api_key, args.user_id,
                args.model, args.db_path, args.max_tokens, args.top_k, args.quiet
            ))
            
            if args.quiet:
                print(answer)
            else:
                print(f"\nQuestion: {args.question}")
                print(f"Answer: {answer}")
        except Exception as e:
            if not args.quiet:
                print(f"Error in process-and-query: {str(e)}")
            sys.exit(1)

if __name__ == "__main__":
    main()