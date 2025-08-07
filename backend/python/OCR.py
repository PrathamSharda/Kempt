import asyncio
import base64
import aiohttp
import re
import sys
import os
from google.cloud import storage
import tempfile
from dotenv import load_dotenv
from datetime import datetime, timedelta
from reportlab.lib.pagesizes import letter, A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib.enums import TA_LEFT, TA_JUSTIFY, TA_CENTER
from reportlab.lib import colors
from io import BytesIO
import pdf2image as pf
import markdown
from html.parser import HTMLParser
import shutil
load_dotenv()

def init_gcs_client():
    try:
        # print("Attempting to initialize GCS client...")
        
        # Check if credentials are available
        creds_path = os.getenv('GOOGLE_APPLICATION_CREDENTIALS')
        if creds_path:
            # print(f"Using credentials from: {creds_path}")
            if not os.path.exists(creds_path):
                print(f"Credentials file not found: {creds_path}")
                return None
        else:
             count=1
            # print("GOOGLE_APPLICATION_CREDENTIALS not set, trying default credentials")
        
        client = storage.Client()
        # print("GCS client initialized successfully")
        return client
    except Exception as e:
        # print(f"Error initializing GCS client: {str(e)}")
        return None

def upload_to_gcs(local_file_path, bucket_name, destination_blob_name):
    try:
        # print(f"Initializing GCS client...")
        client = init_gcs_client()
        if not client:
            # print("Failed to initialize GCS client - check credentials")
            raise Exception("Failed to initialize GCS client")
        
        # print(f"Getting bucket: {bucket_name}")
        bucket = client.bucket(bucket_name)
        
        # print(f"Creating blob: {destination_blob_name}")
        blob = bucket.blob(destination_blob_name)
        
        # print(f"Uploading file: {local_file_path}")
        # Check if local file exists
        if not os.path.exists(local_file_path):
            raise Exception(f"Local file does not exist: {local_file_path}")
        
        file_size = os.path.getsize(local_file_path)
        # print(f"File size: {file_size} bytes")
        
        # Upload the file first
        blob.upload_from_filename(local_file_path)
        # print("File uploaded successfully")
        
        # Set metadata for expiry (this is just metadata, actual deletion needs lifecycle policy)
        expiry_time = datetime.utcnow() + timedelta(days=1)
        blob.metadata = {'expires_at': expiry_time.isoformat()}
        blob.patch()
        # print("Metadata set successfully")
        
        gcs_path = f"gs://{bucket_name}/{destination_blob_name}"
        # print(f"Final GCS path: {gcs_path}")
        return gcs_path
    except Exception as e:
        # print(f"Upload error: {str(e)}")
        return None

def cleanup_temp_file(file_path):
    try:
        if file_path and os.path.exists(file_path):
            os.unlink(file_path)
    except Exception as e:
        pass

def cleanup_images_folder(images_folder):
    try:
        if images_folder and os.path.exists(images_folder):
            shutil.rmtree(images_folder)
    except Exception as e:
        pass

async def run_ocr(file_content):
    try:
        OLLAMA_API = os.getenv('OLLAMA_API')
        # print(f"OLLAMA_API endpoint: {OLLAMA_API}")
        
        if not OLLAMA_API:
            return "Error: OLLAMA_API environment variable not set"
        
        image_base64 = base64.b64encode(file_content).decode('utf-8')
        # print(f"Image encoded. Base64 length: {len(image_base64)}")

        payload = {
            "model": 'qwen2.5vl:7b',
            "prompt": '''extract the content of this image in markdown format''',
            "images": [image_base64],
            "stream": False
        }
        
        # print("Sending request to Ollama API...")
        async with aiohttp.ClientSession(timeout=aiohttp.ClientTimeout(total=300)) as session:
            async with session.post(OLLAMA_API, 
            json=payload,
            ) as response:
                # print(f"Response status: {response.status}")
                if response.status != 200:
                    error_text = await response.text()
                    # print(f"API Error: {error_text}")
                    return f"API Error: {response.status} - {error_text}"
                
                result = await response.json()
                # print(f"API response received, processing...")
                return result.get('response', '')
    except asyncio.TimeoutError:
        # print("OCR request timed out")
        return "Error: OCR request timed out"
    except Exception as error:
        # print(f"OCR Error: {str(error)}")
        return f"Error: {error}"

class MarkdownHTMLParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.elements = []
        self.current_element = None
        self.current_data = []
        self.in_table = False
        self.current_table = []
        self.current_row = []
        self.in_code_block = False
        self.code_content = []
        self.list_stack = []

    def handle_starttag(self, tag, attrs):
        if tag in ['h1', 'h2', 'h3', 'h4', 'h5', 'h6']:
            self.current_element = {'type': 'heading', 'level': int(tag[1]), 'content': []}
        elif tag == 'p':
            self.current_element = {'type': 'paragraph', 'content': []}
        elif tag == 'ul':
            self.list_stack.append({'type': 'ul', 'items': []})
        elif tag == 'ol':
            self.list_stack.append({'type': 'ol', 'items': []})
        elif tag == 'li':
            self.current_element = {'type': 'list_item', 'content': []}
        elif tag == 'table':
            self.in_table = True
            self.current_table = []
        elif tag == 'tr' and self.in_table:
            self.current_row = []
        elif tag in ['td', 'th'] and self.in_table:
            self.current_element = {'type': 'table_cell', 'content': [], 'is_header': tag == 'th'}
        elif tag == 'pre':
            self.in_code_block = True
            self.code_content = []
        elif tag == 'code' and not self.in_code_block:
            self.current_element = {'type': 'inline_code', 'content': []}
        elif tag in ['strong', 'b']:
            self.current_data.append('<b>')
        elif tag in ['em', 'i']:
            self.current_data.append('<i>')
        elif tag == 'br':
            self.current_data.append('<br/>')

    def handle_endtag(self, tag):
        if tag in ['h1', 'h2', 'h3', 'h4', 'h5', 'h6']:
            if self.current_element:
                self.current_element['content'] = ''.join(self.current_data).strip()
                self.elements.append(self.current_element)
                self.current_element = None
                self.current_data = []
        elif tag == 'p':
            if self.current_element:
                self.current_element['content'] = ''.join(self.current_data).strip()
                if self.current_element['content']:
                    self.elements.append(self.current_element)
                self.current_element = None
                self.current_data = []
        elif tag == 'li':
            if self.current_element and self.list_stack:
                self.current_element['content'] = ''.join(self.current_data).strip()
                self.list_stack[-1]['items'].append(self.current_element)
                self.current_element = None
                self.current_data = []
        elif tag in ['ul', 'ol']:
            if self.list_stack:
                list_element = self.list_stack.pop()
                self.elements.append(list_element)
        elif tag in ['td', 'th'] and self.in_table:
            if self.current_element:
                self.current_element['content'] = ''.join(self.current_data).strip()
                self.current_row.append(self.current_element)
                self.current_element = None
                self.current_data = []
        elif tag == 'tr' and self.in_table:
            if self.current_row:
                self.current_table.append(self.current_row)
                self.current_row = []
        elif tag == 'table':
            if self.current_table:
                self.elements.append({'type': 'table', 'rows': self.current_table})
                self.current_table = []
                self.in_table = False
        elif tag == 'pre':
            if self.code_content:
                self.elements.append({'type': 'code_block', 'content': '\n'.join(self.code_content)})
                self.code_content = []
                self.in_code_block = False
        elif tag == 'code' and not self.in_code_block:
            if self.current_element:
                self.current_element['content'] = ''.join(self.current_data).strip()
                self.elements.append(self.current_element)
                self.current_element = None
                self.current_data = []
        elif tag in ['strong', 'b']:
            self.current_data.append('</b>')
        elif tag in ['em', 'i']:
            self.current_data.append('</i>')

    def handle_data(self, data):
        if self.in_code_block:
            self.code_content.append(data)
        else:
            self.current_data.append(data)

def clean_markdown_text(text):
    text = re.sub(r'\n\s*\n\s*\n+', '\n\n', text)
    text = text.strip()
    text = re.sub(r'^\s*```markdown\s*\n?', '', text, flags=re.MULTILINE)
    text = re.sub(r'\n?\s*```\s*$', '', text, flags=re.MULTILINE)
    return text

def calculate_dynamic_column_widths(table_data, available_width, min_width=1*inch):
    if not table_data or not table_data[0]:
        return [available_width]
    
    col_count = len(table_data[0])
    col_lengths = [0] * col_count
    
    for row in table_data:
        for i, cell in enumerate(row):
            if i < len(col_lengths):
                cell_text = cell.get('content', '') if isinstance(cell, dict) else str(cell)
                clean_text = re.sub(r'<[^>]+>', '', str(cell_text))
                col_lengths[i] = max(col_lengths[i], len(clean_text))
    
    total_content_length = sum(col_lengths)
    if total_content_length == 0:
        return [available_width / col_count] * col_count
    
    col_widths = []
    for i, length in enumerate(col_lengths):
        if total_content_length > 0:
            proportion = length / total_content_length
            calculated_width = available_width * proportion
            final_width = max(calculated_width, min_width)
            col_widths.append(final_width)
        else:
            col_widths.append(min_width)
    
    total_width = sum(col_widths)
    if total_width > available_width:
        scale_factor = available_width / total_width
        col_widths = [width * scale_factor for width in col_widths]
    
    return col_widths

def create_pdf(markdown_text, filename="extracted_text.pdf"):
    try:
        cleaned_text = clean_markdown_text(markdown_text)
        html_content = markdown.markdown(
            cleaned_text,
            extensions=['tables', 'fenced_code', 'nl2br', 'codehilite']
        )
        
        parser = MarkdownHTMLParser()
        parser.feed(html_content)
        
        buffer = BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=A4,
            topMargin=0.75*inch,
            bottomMargin=0.75*inch,
            leftMargin=1*inch,
            rightMargin=1*inch
        )
        
        styles = getSampleStyleSheet()
        story = []
        
        custom_styles = {
            'CustomHeading1': ParagraphStyle(
                'CustomHeading1',
                parent=styles['Heading1'],
                fontSize=18,
                spaceAfter=12,
                spaceBefore=16,
                textColor=colors.black,
                alignment=TA_LEFT
            ),
            'CustomHeading2': ParagraphStyle(
                'CustomHeading2',
                parent=styles['Heading2'],
                fontSize=14,
                spaceAfter=10,
                spaceBefore=12,
                textColor=colors.black,
                alignment=TA_LEFT
            ),
            'CustomHeading3': ParagraphStyle(
                'CustomHeading3',
                parent=styles['Heading3'],
                fontSize=12,
                spaceAfter=8,
                spaceBefore=10,
                textColor=colors.black,
                alignment=TA_LEFT
            ),
            'CustomNormal': ParagraphStyle(
                'CustomNormal',
                parent=styles['Normal'],
                fontSize=10,
                spaceAfter=6,
                alignment=TA_JUSTIFY,
                textColor=colors.black,
                leading=12
            ),
            'TableCell': ParagraphStyle(
                'TableCell',
                parent=styles['Normal'],
                fontSize=9,
                alignment=TA_LEFT,
                textColor=colors.black,
                leading=11,
                leftIndent=0,
                rightIndent=0,
                wordWrap='LTR'
            ),
            'CodeBlock': ParagraphStyle(
                'CodeBlock',
                parent=styles['Code'],
                fontName='Courier',
                fontSize=8,
                leftIndent=20,
                backgroundColor=colors.lightgrey,
                borderColor=colors.grey,
                borderWidth=0.5,
                borderPadding=8,
                spaceAfter=12,
                spaceBefore=6,
                leading=10
            ),
            'ListItem': ParagraphStyle(
                'ListItem',
                parent=styles['Normal'],
                fontSize=10,
                leftIndent=20,
                bulletIndent=10,
                spaceAfter=3,
                textColor=colors.black,
                leading=12
            ),
            'InlineCode': ParagraphStyle(
                'InlineCode',
                parent=styles['Normal'],
                fontName='Courier',
                fontSize=9,
                backgroundColor=colors.lightgrey,
                textColor=colors.black
            )
        }
        
        for element in parser.elements:
            if element['type'] == 'heading':
                level = element['level']
                content = element['content']
                if level == 1:
                    story.append(Paragraph(content, custom_styles['CustomHeading1']))
                elif level == 2:
                    story.append(Paragraph(content, custom_styles['CustomHeading2']))
                else:
                    story.append(Paragraph(content, custom_styles['CustomHeading3']))
                story.append(Spacer(1, 0.1 * inch))
                
            elif element['type'] == 'paragraph':
                content = element['content']
                if content:
                    story.append(Paragraph(content, custom_styles['CustomNormal']))
                    story.append(Spacer(1, 0.05 * inch))
                    
            elif element['type'] == 'code_block':
                content = element['content']
                code_lines = content.split('\n')
                for line in code_lines:
                    if line.strip():
                        story.append(Paragraph(line, custom_styles['CodeBlock']))
                story.append(Spacer(1, 0.1 * inch))
                
            elif element['type'] == 'inline_code':
                content = element['content']
                story.append(Paragraph(content, custom_styles['InlineCode']))
                
            elif element['type'] in ['ul', 'ol']:
                list_type = element['type']
                for i, item in enumerate(element['items']):
                    content = item['content']
                    if list_type == 'ul':
                        bullet = "• "
                    else:
                        bullet = f"{i+1}. "
                    story.append(Paragraph(f"{bullet}{content}", custom_styles['ListItem']))
                story.append(Spacer(1, 0.1 * inch))
                
            elif element['type'] == 'table':
                table_data = []
                raw_data = []
                for row in element['rows']:
                    table_row = []
                    raw_row = []
                    for cell in row:
                        cell_content = cell['content']
                        raw_row.append(cell)
                        if cell['is_header']:
                            table_row.append(Paragraph(f"<b>{cell_content}</b>", custom_styles['TableCell']))
                        else:
                            table_row.append(Paragraph(cell_content, custom_styles['TableCell']))
                    table_data.append(table_row)
                    raw_data.append(raw_row)
                
                if table_data:
                    available_width = doc.width
                    col_widths = calculate_dynamic_column_widths(raw_data, available_width, min_width=0.8*inch)
                    table = Table(table_data, colWidths=col_widths)
                    table.setStyle(TableStyle([
                        ('BACKGROUND', (0, 0), (-1, 0), colors.lightgrey),
                        ('TEXTCOLOR', (0, 0), (-1, 0), colors.black),
                        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
                        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                        ('FONTSIZE', (0, 0), (-1, -1), 9),
                        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
                        ('TOPPADDING', (0, 0), (-1, -1), 8),
                        ('LEFTPADDING', (0, 0), (-1, -1), 6),
                        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
                        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
                        ('WORDWRAP', (0, 0), (-1, -1), 'LTR'),
                        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.lightgrey]),
                    ]))
                    story.append(table)
                    story.append(Spacer(1, 0.2 * inch))
        
        doc.build(story)
        buffer.seek(0)
        
        with open(filename, 'wb') as f:
            f.write(buffer.getvalue())
            
    except Exception as e:
        create_simple_pdf(markdown_text, filename)

def create_simple_pdf(text, filename="extracted_text_simple.pdf"):
    try:
        buffer = BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=A4)
        styles = getSampleStyleSheet()
        story = []
        
        paragraphs = text.split('\n\n')
        for para in paragraphs:
            para = para.strip()
            if not para:
                continue
                
            if para.startswith('#'):
                level = 0
                for char in para:
                    if char == '#':
                        level += 1
                    else:
                        break
                text_content = para[level:].strip()
                if level == 1:
                    story.append(Paragraph(text_content, styles['Heading1']))
                elif level == 2:
                    story.append(Paragraph(text_content, styles['Heading2']))
                else:
                    story.append(Paragraph(text_content, styles['Heading3']))
            else:
                formatted_para = para
                formatted_para = re.sub(r'\*\*(.*?)\*\*', r'<b>\1</b>', formatted_para)
                formatted_para = re.sub(r'\*(.*?)\*', r'<i>\1</i>', formatted_para)
                formatted_para = re.sub(r'`(.*?)`', r'<font name="Courier">\1</font>', formatted_para)
                story.append(Paragraph(formatted_para, styles['Normal']))
                
            story.append(Spacer(1, 0.1*inch))
        
        doc.build(story)
        buffer.seek(0)
        
        with open(filename, 'wb') as f:
            f.write(buffer.getvalue())
            
    except Exception as e:
        pass

def is_valid_pdf(file_path):
    try:
        if not os.path.exists(file_path):
            return False, "File does not exist"
        
        file_size = os.path.getsize(file_path)
        if file_size == 0:
            return False, "File is empty"
        
        with open(file_path, 'rb') as f:
            header = f.read(4)
            if header != b'%PDF':
                return False, "File is not a valid PDF (missing PDF header)"
        
        return True, "Valid PDF"
    except Exception as e:
        return False, f"Error validating PDF: {e}"

async def pdf_to_image(file_path, images_folder):
    ans = {}
    # print(f"Validating PDF: {file_path}")
    is_valid, validation_msg = is_valid_pdf(file_path)
    # print(f"PDF validation: {validation_msg}")
    
    if not is_valid:
        # print(f"PDF validation failed: {validation_msg}")
        return ans
    
    if not file_path.lower().endswith('.pdf'):
        # print("File does not have .pdf extension")
        return ans
    
    try:
        # Create images folder if it doesn't exist
        os.makedirs(images_folder, exist_ok=True)
        # print(f"Created/verified images folder: {images_folder}")
        
        # print("Converting PDF to images...")
        # Reduce DPI for faster processing (200-300 is usually sufficient for OCR)
        pages = pf.convert_from_path(file_path, 200)
        # print(f"PDF converted to {len(pages)} pages")
        
        for i, page in enumerate(pages):
            pdf_name = os.path.splitext(os.path.basename(file_path))[0]
            name_image = os.path.join(images_folder, f'{pdf_name}_page_{i+1}.jpg')
            # Reduce quality for faster processing and smaller files
            page.save(name_image, 'JPEG', quality=85, optimize=True)
            # print(f"Saved page {i+1} as: {name_image}")
            
            with open(name_image, 'rb') as f:
                image_content = f.read()
            ans[name_image] = image_content
        
        # print(f"Successfully processed {len(ans)} images")
        
    except Exception as e:
        # print(f"Error in pdf_to_image: {str(e)}")
        return {}
    
    return ans

def get_unique_pdf_filename_gcs(original_file_path, bucket_name):
    try:
        base_name = os.path.splitext(os.path.basename(original_file_path))[0]
        base_output_path = f"FileStorage/output/{base_name}_extracted.pdf"
        
        client = init_gcs_client()
        if not client:
            return base_output_path
            
        bucket = client.bucket(bucket_name)
        
        counter = 1
        output_path = base_output_path
        while bucket.blob(output_path).exists():
            output_path = f"FileStorage/output/{base_name}_extracted_{counter}.pdf"
            counter += 1
        
        return output_path
    except Exception as e:
        timestamp = int(asyncio.get_event_loop().time()) if asyncio.get_event_loop() else int(datetime.now().timestamp())
        return f"FileStorage/output/extracted_{timestamp}.pdf"

async def call():
    if len(sys.argv) < 2:
        return "No file path provided."
    
    local_file_path = sys.argv[1]
    # print(f"Processing file: {local_file_path}")
    
    # Check if file exists locally
    if not os.path.exists(local_file_path):
        return f"File not found: {local_file_path}"
    
    # print(f"File exists. Size: {os.path.getsize(local_file_path)} bytes")
    
    # Create images folder next to the original file
    file_dir = os.path.dirname(local_file_path)
    images_folder = os.path.join(file_dir, "images")
    # print(f"Images will be saved to: {images_folder}")
    
    try:
        # print("Starting PDF to image conversion...")
        uploaded = await pdf_to_image(local_file_path, images_folder)
        # print(f"PDF conversion complete. Generated {len(uploaded)} images")
        
        if not uploaded:
            return "File not processed or the format is not correct."
        
        # print("Starting OCR processing...")
        results = []
        
        # Process images in parallel instead of sequentially
        async def process_single_image(file_name, file_content):
            # print(f"Processing OCR for: {os.path.basename(file_name)}")
            ans = await run_ocr(file_content)
            # print(f"OCR completed for: {os.path.basename(file_name)}, Response length: {len(ans)}")
            
            if '```markdown' in ans:
                start = ans.find('```markdown') + len('```markdown')
                end = ans.find('```', start)
                if end != -1:
                    extracted_text = ans[start:end].strip()
                else:
                    extracted_text = ans
            elif '```' in ans:
                start = ans.find('```') + 3
                end = ans.find('```', start)
                if end != -1:
                    extracted_text = ans[start:end].strip()
                else:
                    extracted_text = ans
            else:
                extracted_text = ans
            return extracted_text
        
        # Create tasks for parallel processing
        tasks = []
        for file_name, file_content in uploaded.items():
            task = process_single_image(file_name, file_content)
            tasks.append(task)
        
        # Process all images in parallel
        results = await asyncio.gather(*tasks)
        # print(f"All OCR processing complete. Results: {len(results)}")
        
        all_extracted_text = "\n\n".join(results)
        # print(f"Combined text length: {len(all_extracted_text)}")
        
        # print("Creating PDF...")
        # Store output PDF in same directory as original file
        file_dir = os.path.dirname(local_file_path)
        base_name = os.path.splitext(os.path.basename(local_file_path))[0]
        output_pdf_path = os.path.join(file_dir, f"{base_name}_extracted.pdf")
        
        create_pdf(all_extracted_text, output_pdf_path)
        # print(f"PDF created: {output_pdf_path}")
        
        # Upload to GCS
        # print("Uploading to GCS...")
        bucket_name = os.getenv('GCS_BUCKET_NAME', 'default-bucket')
        # print(f"Using bucket: {bucket_name}")
        
        if bucket_name == 'default-bucket':
            count=1
            # print("WARNING: GCS_BUCKET_NAME environment variable not set, using default-bucket")
        
        output_blob_name = get_unique_pdf_filename_gcs(local_file_path, bucket_name)
        # print(f"Target blob name: {output_blob_name}")
        
        output_gcs_path = upload_to_gcs(output_pdf_path, bucket_name, output_blob_name)
        # print(f"Upload result: {output_gcs_path}")
        
        if output_gcs_path:
            # print("Upload successful, deleting local output file...")
            cleanup_temp_file(output_pdf_path)
            # print("Local output file deleted")
        else:
            count=1
            # print("Upload failed, keeping local output file")
        
        # Clean up images folder and all its contents
        cleanup_images_folder(images_folder)
        # print("Cleanup complete")
        
        if output_gcs_path:
            return output_gcs_path
        else:
            return "Processing completed but failed to upload result to GCS."
            
    except Exception as e:
        # print(f"Error occurred: {str(e)}")
        # Clean up images folder in case of error
        cleanup_images_folder(images_folder)
        return f"Error during processing: {e}"

if __name__ == "__main__":
    result = asyncio.run(call())
    print(result)