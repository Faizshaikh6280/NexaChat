# NexaChat

NexaChat is a no-code RAG (Retrieval-Augmented Generation) SaaS platform that allows businesses to embed custom AI chatbots on their websites trained on their own data.

## Deployment

### Frontend (Next.js)
The frontend can be deployed easily on [Vercel](https://vercel.com/):
1. Sign in to Vercel with your GitHub account.
2. Click **Add New** -> **Project**.
3. Select your `NexaChat` repository.
4. Set the **Framework Preset** to Next.js.
5. In the **Environment Variables** section, add:
   - `NEXT_PUBLIC_API_URL`: The URL of your deployed backend (e.g., `https://nexachat-api.onrender.com`).
6. Click **Deploy**.

### Backend (FastAPI)
The backend can be deployed on [Render](https://render.com/) for free:
1. Sign in to Render with your GitHub account.
2. Click **New +** -> **Web Service**.
3. Select your `NexaChat` repository.
4. Set the following build settings:
   - **Root Directory**: `backend`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.1 --port 10000`
5. In the **Environment Variables** section, add:
   - `HUGGINGFACEHUB_API_TOKEN`: Your HuggingFace API key
   - `VECTOR_DB_API`: Your Qdrant API key
   - `CLUSTUR_ENDPOINT`: Your Qdrant endpoint URL
6. Click **Create Web Service**.
