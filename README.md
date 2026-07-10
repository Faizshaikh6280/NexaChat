# NexaChat 🤖

**NexaChat** is a powerful, no-code Retrieval-Augmented Generation (RAG) SaaS platform. It enables businesses to effortlessly create, train, and embed custom AI chatbots on their websites using their own proprietary data. 

Whether it's scraping your company website, uploading PDFs, or syncing Google Drive documents, NexaChat ingests your knowledge base and serves accurate, context-aware answers to your visitors.

![NexaChat Dashboard](https://img.shields.io/badge/Status-Active-success)
![License](https://img.shields.io/badge/License-MIT-blue)

---

## 🏗️ Architecture Overview

The platform is designed as a decoupled full-stack application, ensuring scalability and ease of deployment. It consists of three main components:

1. **Next.js Admin Dashboard**: A sleek, modern web interface where business owners can customize their chatbot's appearance, manage their knowledge base (ingest data), and generate the embed script.
2. **FastAPI Backend Core**: The brains of the operation. It handles data ingestion, document chunking, vector embedding generation, and orchestrates the RAG pipeline to answer user queries.
3. **Embeddable Chat Widget**: A lightweight, responsive chat interface that can be injected into any standard HTML website via a single `<script>` tag.

---

## 🛠️ Detailed Tech Stack

### Frontend (Admin Dashboard)
* **Framework**: [Next.js](https://nextjs.org/) (React 18)
* **Language**: TypeScript
* **Styling**: Tailwind CSS
* **Icons**: Lucide React
* **Hosting**: Vercel

### Backend (API & AI Orchestration)
* **Framework**: [FastAPI](https://fastapi.tiangolo.com/) (Python)
* **Server**: Uvicorn
* **AI Orchestration**: [LangChain](https://python.langchain.com/)
* **Hosting**: Render

### Artificial Intelligence & Data
* **LLM (Text Generation)**: `mistralai/Mistral-7B-Instruct-v0.2` (via HuggingFace Inference API)
* **Embedding Model**: `BAAI/bge-small-en-v1.5` (Dense vector embeddings)
* **Vector Database**: [Qdrant Cloud](https://qdrant.tech/) (For fast similarity search and context retrieval)
* **Relational Database**: SQLite & SQLAlchemy (For storing widget appearance configurations)

### Ingestion & Processing Tools
* **Web Scraping**: `BeautifulSoup4` and `requests`
* **Document Parsing**: `pypdf` (for PDF extraction)
* **Cloud Storage**: `langchain-google-community[drive]` (for Google Drive ingestion)
* **Text Chunking**: `RecursiveCharacterTextSplitter` (LangChain)

---

## 🧠 How the RAG Pipeline Works

1. **Ingestion**: When a user inputs a website URL or uploads a document, the backend extracts the raw text.
2. **Chunking**: The text is broken down into smaller, semantically meaningful chunks (e.g., 1000 characters with 200-character overlap).
3. **Embedding**: Each chunk is passed through the `BGE-Small` embedding model to generate a high-dimensional vector representation.
4. **Vector Storage**: These vectors are upserted into the Qdrant Vector Database alongside their original text metadata.
5. **Retrieval**: When a visitor asks a question in the chat widget, their query is embedded using the exact same model. Qdrant performs a cosine similarity search to find the most relevant chunks of knowledge.
6. **Generation**: The retrieved context and the user's question are injected into a strict prompt template and sent to `Mistral-7B`. The LLM generates a precise, conversational answer based *only* on the provided context.

---

## 🚀 Getting Started (Local Development)

### 1. Backend Setup
```bash
cd backend
python -m venv .venv
# Activate virtual environment (Windows: .venv\Scripts\activate | Mac/Linux: source .venv/bin/activate)
pip install -r requirements.txt

# Create a .env file and add your keys
# HUGGINGFACEHUB_API_TOKEN=your_token
# VECTOR_DB_API=your_qdrant_key
# CLUSTUR_ENDPOINT=your_qdrant_url

uvicorn main:app --reload --port 8000
```

### 2. Frontend Setup
```bash
cd frontend
npm install

# Create a .env.local file
# NEXT_PUBLIC_API_URL=http://localhost:8000

npm run dev
```

### 3. Embed the Widget
You can test the widget on any basic HTML page by adding:
```html
<script src="http://localhost:8000/static/widget.js"></script>
```

---

## 🌍 Live Deployment

This project is fully configured for cloud deployment:
* The **Frontend** can be deployed directly to [Vercel](https://vercel.com) by connecting this repository and setting the `NEXT_PUBLIC_API_URL` environment variable.
* The **Backend** can be deployed to [Render](https://render.com) as a Web Service using `pip install -r requirements.txt` as the build command and `uvicorn main:app --host 0.0.0.0 --port 10000` as the start command.
