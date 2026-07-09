import os
import requests as http_requests
from langchain_huggingface import HuggingFaceEndpointEmbeddings
from langchain_qdrant import QdrantVectorStore
from qdrant_client import QdrantClient
from core.config import settings

def get_embeddings():
    if not settings.HUGGINGFACEHUB_API_TOKEN:
        raise ValueError("HUGGINGFACE_API_KEY is not set.")
    return HuggingFaceEndpointEmbeddings(
        model=settings.EMBEDDING_MODEL,
        huggingfacehub_api_token=settings.HUGGINGFACEHUB_API_TOKEN
    )

def get_qdrant_client():
    if not settings.CLUSTUR_ENDPOINT or not settings.VECTOR_DB_API:
        raise ValueError("Qdrant credentials are not set.")
    return QdrantClient(
        url=settings.CLUSTUR_ENDPOINT,
        api_key=settings.VECTOR_DB_API,
    )

def get_vector_store():
    embeddings = get_embeddings()
    client = get_qdrant_client()
    return QdrantVectorStore(
        client=client,
        collection_name=settings.COLLECTION_NAME,
        embedding=embeddings,
    )

async def chat_with_rag(query: str, session_id: str) -> str:
    import asyncio
    import time

    vector_store = get_vector_store()

    if not settings.HUGGINGFACEHUB_API_TOKEN:
        raise ValueError("HUGGINGFACE_API_KEY is not set.")

    # 1. Retrieve relevant documents from Qdrant
    docs = vector_store.similarity_search(query, k=4)
    context_str = "\n\n".join(doc.page_content for doc in docs)

    if not context_str.strip():
        return "I don't have any information about that yet. Please ingest some content first."

    # 2. Build the chat messages for the OpenAI-compatible API
    system_message = (
        "You are an AI assistant for a company. "
        "Use the following retrieved context to answer the user's question. "
        "If you don't know the answer based on the context, say so honestly. "
        "Do not make up information.\n\n"
        f"Context:\n{context_str}"
    )

    messages = [
        {"role": "system", "content": system_message},
        {"role": "user", "content": query},
    ]

    # 3. Models to try (primary + fallbacks)
    models_to_try = [
        settings.LLM_MODEL,
        "Qwen/Qwen2.5-7B-Instruct",
        "meta-llama/Llama-3.1-8B-Instruct",
    ]

    api_url = "https://router.huggingface.co/featherless-ai/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {settings.HUGGINGFACEHUB_API_TOKEN}",
        "Content-Type": "application/json",
    }

    def make_request(model_name):
        payload = {
            "model": model_name,
            "messages": messages,
            "max_tokens": 512,
            "temperature": 0.1,
        }
        res = http_requests.post(api_url, headers=headers, json=payload, timeout=60)
        res.raise_for_status()
        return res.json()

    loop = asyncio.get_event_loop()

    # Try each model with retries
    for model_idx, model_name in enumerate(models_to_try):
        max_retries = 3
        for attempt in range(max_retries):
            try:
                print(f"[Chat] Trying model: {model_name} (attempt {attempt + 1}/{max_retries})")
                data = await loop.run_in_executor(None, make_request, model_name)

                if "choices" in data and len(data["choices"]) > 0:
                    return data["choices"][0]["message"]["content"].strip()

                print(f"Unexpected HF API response format: {data}")
                break  # Don't retry on unexpected format, try next model

            except http_requests.exceptions.HTTPError as e:
                error_body = e.response.text if e.response else "No response body"
                print(f"[Chat] HTTP {e.response.status_code} for {model_name}: {error_body}")

                # If model is busy (400/429/503), retry with backoff or try next model
                if e.response.status_code in (400, 429, 503):
                    if attempt < max_retries - 1:
                        wait_time = 2 ** attempt  # 1s, 2s, 4s
                        print(f"[Chat] Retrying in {wait_time}s...")
                        await asyncio.sleep(wait_time)
                        continue
                    else:
                        print(f"[Chat] Model {model_name} exhausted retries, trying next model...")
                        break  # Try next model
                else:
                    # For other HTTP errors (401, 404, etc.), don't retry
                    return f"The AI model returned an error (HTTP {e.response.status_code}). Please try again later."

            except http_requests.exceptions.Timeout:
                print(f"[Chat] Timeout for {model_name}")
                if attempt < max_retries - 1:
                    continue
                break  # Try next model

            except Exception as e:
                print(f"[Chat] Unexpected error: {e}")
                return "Sorry, the AI model is currently unavailable. Please try again in 30 seconds."

    return "All AI models are currently busy. Please try again in a minute."

