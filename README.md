# Kempt - Intelligent Document Insight Platform

**Transform your documents into intelligent, searchable, and interactive content with AI-powered processing.**

## Features

### Chat with Your Documents
Upload any document (PDF, images, text files) and engage in natural conversations about the content. Ask specific questions and receive instant answers pulled directly from your documents. The system uses Retrieval Augmented Generation (RAG) with Google Gemini API to understand context and provide accurate responses based on your document content.

**How it works:**
- Upload documents to Google Cloud Storage
- Content is vectorized using LangChain and stored in ChromaDB vector database
- User sessions and OAuth states managed through Redis
- Questions are processed using semantic search against ChromaDB to find relevant passages
- Google Gemini API generates contextual answers based on retrieved content
- User authentication and document metadata stored in MongoDB
- No manual searching required - AI finds and synthesizes information from multiple sections

### Smart Document Summaries
Convert lengthy documents into concise, meaningful summaries that capture key insights and important points. The summarization feature goes beyond simple text extraction to provide intelligent content distillation that saves time and improves comprehension.

**Key capabilities:**
- Automatic keyword extraction from document content
- Intelligent summary generation that preserves context and meaning
- Customizable summary prompts for specific use cases
- Support for multiple document formats and languages
- Batch processing for multiple documents simultaneously

### PDF Text Extraction and OCR
Fix "broken" PDFs where text selection doesn't work by converting them into searchable, selectable documents. The system uses advanced Optical Character Recognition (OCR) powered by the Qwen2.5VL vision-language model to extract text from scanned documents, images, and non-selectable PDFs.

**Technical features:**
- Advanced OCR using Qwen2.5VL:7b vision model via Ollama API
- PDF to image conversion using pdf2image library
- Intelligent text extraction with markdown formatting preservation
- Clean PDF generation with proper formatting and tables
- Support for multiple languages and complex document layouts
- Automatic cleanup of temporary files and optimized processing
- Generated PDFs uploaded to Google Cloud Storage with auto-expiry

## Tech Stack

### Backend
- **Node.js & Express** - RESTful API server
- **Triple Database Architecture**:
  - **MongoDB** - User data, authentication, and application state
  - **Redis** - Session management, caching, and OAuth state storage
  - **ChromaDB** - Vector database for semantic document search and retrieval
- **Google Cloud Storage** - Secure file storage
- **Python Integration** - AI/ML processing pipeline

### AI & Machine Learning
- **Ollama API** - Local LLM inference
- **Qwen2.5VL:7b** - Vision-language model for OCR
- **Google Gemini API** - RAG (Retrieval Augmented Generation)
- **LangChain** - Document processing and vectorization
- **ChromaDB** - Vector database for semantic search

### Frontend
- **React** - Modern UI framework
- **React Router** - Client-side routing
- **Context API** - State management
- **Axios** - HTTP client
- **Responsive Design** - Mobile-friendly interface( coming soon.....)

### Infrastructure & Security
- **JWT Authentication** - Secure token-based auth
- **bcrypt** - Password hashing
- **CORS Protection** - Cross-origin security
- **Rate Limiting** - API abuse prevention
- **CSRF Protection** - Cross-site request forgery prevention
- **Docker** - Containerized deployment
- **Multi-runtime Container** - Python 3.9 + Node.js 20 in single container
- **Triple Database Architecture** - MongoDB, Redis, and ChromaDB for specialized data handling

## Prerequisites

### Local Development
- Node.js (v16 or higher)
- Python 3.8+
- MongoDB
- Redis
- ChromaDB (vector database)
- Google Cloud Platform account
- Ollama (for local LLM inference)

### Docker Deployment
- Docker 
- Google Cloud Platform account (for storage and APIs)
- Ollama server (can be containerized separately)

## Installation

### Option 1: Docker Deployment (Recommended)

1. **Clone the Repository**
```bash
git clone https://github.com/yourusername/kempt.git
cd kempt/backend
```

2. **Create Environment File**
Create `.env` file in the backend directory with all required environment variables (see configuration section below).

3. **Build and Run with Docker**
```bash
# Build the container
docker build -t kempt-backend .

# Run the application
docker run -p 8080:8080 --env-file .env kempt-backend
```

4. **Setup Frontend** (runs separately)
```bash
cd ../frontend
npm install
npm run dev
```

### Option 2: Manual Installation

1. **Clone the Repository**
```bash
git clone https://github.com/yourusername/kempt.git
cd kempt
```

2. **Backend Setup**
```bash
cd backend
npm install
```

3. **Python Dependencies**
```bash
cd backend/python
pip install -r requirements.txt
```

4. **Frontend Setup**
```bash
cd frontend
npm install
```

5. **Start Services**

**Start Ollama (for OCR)**
```bash
ollama serve
ollama pull qwen2.5vl:7b
```

**Start Backend**
```bash
cd backend
npm start
```

**Start Frontend**
```bash
cd frontend
npm run dev
```

## Configuration

Create a `.env` file in the backend directory with the following variables:

```env
# MongoDB
mongoID=your_mongodb_connection_string

# JWT
jwt_secret=your_jwt_secret_key

# Google OAuth
CLIENT_ID=your_google_oauth_client_id
CLIENT_SECRET=your_google_oauth_client_secret

# Redis
REDIS_PASSWORD=your_redis_password
REDIS_PORT=your_redis_port
REDIS_HOST=your_redis_host

# Google Cloud Storage
GCS_BUCKET_NAME=your_gcs_bucket_name
GOOGLE_APPLICATION_CREDENTIALS=path_to_your_service_account_key.json

# AI Services
OLLAMA_API=http://localhost:11434/api/generate
GOOGLE_API_KEY=your_gemini_api_key

# Server
PORT=8080
```

## API Endpoints

### Authentication
- `POST /auth/signup` - User registration
- `POST /auth/signin` - User login
- `GET /auth/LoginWithGoogle` - Google OAuth initiation
- `GET /auth/isValid` - Token validation

### Document Processing
- `POST /user/qa` - Question & Answer with documents
- `POST /user/fix` - PDF OCR and text extraction
- `POST /user/summarize` - Document summarization

## Usage Examples

### Document Q&A
```javascript
const formData = new FormData();
formData.append('files', pdfFile);
formData.append('prompt', 'What are the key findings in this report?');

const response = await axios.post('/user/qa', formData, {
    headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
    }
});
```

### PDF Text Extraction
```javascript
const formData = new FormData();
formData.append('files', scannedPDF);

const response = await axios.post('/user/fix', formData, {
    headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
    }
});
```

## Security Features

- **JWT Authentication** with 7-day expiry
- **Password Hashing** using bcrypt
- **Rate Limiting** - 40 requests per 3 minutes
- **CORS Protection** with specific origin allowlist
- **CSRF Protection** using state parameters for OAuth
- **Input Validation** using Zod schemas
- **Secure File Upload** with Google Cloud Storage

## Token System

- **Free Users**: 5 tokens per 8-hour period
- **Premium Users**: 30 tokens per 8-hour period
- **Token Usage**: 1 token per document processing request
- **Auto-Reset**: Tokens automatically refresh every 8 hours

## Deployment

### Docker Deployment (Recommended)

The application comes with a pre-configured Dockerfile for easy containerization:

```bash
# Build the Docker image
docker build -t kempt-backend .

# Run the container
docker run -p 8080:8080 --env-file .env kempt-backend
```

**Docker Features:**
- **Multi-runtime environment**: Python 3.9 + Node.js 20
- **System dependencies**: Poppler utils for PDF processing
- **Optimized layers**: Efficient caching and minimal image size
- **Production-ready**: Configured for cloud deployment


### Cloud Deployment Options

The application is designed for cloud deployment:

- **Backend**: Google Cloud Run (containerized)
- **Frontend**: Vercel
- **Databases**: 
  - MongoDB Atlas (user data and authentication)
  - Redis Cloud (session management and caching)
  - ChromaDB (vector database for document embeddings)
- **Storage**: Google Cloud Storage
- **AI Services**: Ollama on dedicated server + Google Gemini API

### Google Cloud Run Deployment

```bash
# Build and push to Google Container Registry
gcloud builds submit --tag gcr.io/PROJECT-ID/kempt-backend

# Deploy to Cloud Run
gcloud run deploy kempt-backend \
  --image gcr.io/PROJECT-ID/kempt-backend \
  --platform managed \
  --region europe-west1 \
  --allow-unauthenticated
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

