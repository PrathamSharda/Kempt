# Kempt

A document processing app that lets you chat with PDFs, extract text from scanned documents, and generate summaries.

## What it does

**Chat with documents:** Upload a PDF and ask questions about it. The app finds relevant sections and gives you answers based on the actual content.

**Fix broken PDFs:** Got a scanned PDF where you can't select text? Upload it and get back a proper PDF with searchable text.

**Summarize documents:** Generate concise summaries of long documents.

## Demo

<img width="584" height="798" alt="image" src="https://github.com/user-attachments/assets/723e5c0a-d865-4f7f-8afe-c98d56b0c1ab" />

<img width="649" height="873" alt="image" src="https://github.com/user-attachments/assets/00b48b07-79c4-4906-b9b2-19b8a85ad075" />



## Quick Start

### With Docker (easiest)

```bash
git clone https://github.com/yourusername/kempt.git
cd kempt/backend

# Add your environment variables to .env file
cp .env.example .env

docker build -t kempt .
docker run -p 8080:8080 --env-file .env kempt
```

Frontend runs separately:
```bash
cd frontend
npm install
npm start
```

### Manual setup

You'll need:
- Node.js 16+
- Python 3.8+
- MongoDB
- Redis
- [Ollama](https://ollama.ai/) with qwen2.5vl model

```bash
# Backend
cd backend
npm install
cd python && pip install -r requirements.txt

# Frontend  
cd frontend
npm install

# Start Ollama
ollama serve
ollama pull qwen2.5vl:7b

# Run everything
npm start # in backend
npm start # in frontend
```

## How it works

**Document chat:** Uses ChromaDB to store document embeddings, then searches for relevant chunks when you ask questions. Google Gemini generates the final answer.

**OCR:** Converts PDF pages to images, runs them through the Qwen2.5VL vision model to extract text, then creates a new searchable PDF.

**Storage:** Files go to Google Cloud Storage, user data in MongoDB, sessions in Redis.

## Environment setup

Create `.env` in the backend directory:

```env
# Database
mongoID=mongodb://localhost:27017/kempt
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Auth
jwt_secret=your-secret-key
CLIENT_ID=google-oauth-client-id
CLIENT_SECRET=google-oauth-client-secret

# Google Cloud
GCS_BUCKET_NAME=your-bucket
GOOGLE_APPLICATION_CREDENTIALS=path/to/service-account.json
GOOGLE_API_KEY=your-gemini-api-key

# AI
OLLAMA_API=http://localhost:11434/api/generate

PORT=8080
```

## API

```bash
# Auth
POST /auth/signup
POST /auth/signin
GET /auth/LoginWithGoogle

# Document processing
POST /user/qa          # Chat with documents
POST /user/fix         # OCR processing  
POST /user/summarize   # Generate summary
```

## Tech stack

- **Backend:** Node.js, Express
- **Frontend:** React
- **Databases:** MongoDB (users), Redis (state storage using oauth), ChromaDB (document vectors)
- **AI:** Ollama (OCR), Google Gemini (chat), LangChain (document processing)
- **Storage:** Google Cloud Storage

## Limitations

- Free users get 5 requests which when over are renewed every *8hours
- OCR works best with clear, high-quality scans, 
- Document chat quality depends on how well the text chunks are created and how clean the question is
- Requires Google Cloud account for file storage (of the OCR file)

## Development

```bash
# Run tests
npm test

# Format code
npm run format

# Type checking
npm run type-check
```

## Deployment

Works on any platform that supports Docker. Tested on:
- Google Cloud Run (backend + OLLAMA)
- Vercel (frontend)

## Contributing

Open an issue first to discuss what you'd like to change. Pull requests welcome.

## License

MIT
