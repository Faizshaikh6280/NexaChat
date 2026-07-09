import os
import tempfile
from urllib.parse import urljoin, urlparse
import requests as http_requests
from bs4 import BeautifulSoup
from langchain_community.document_loaders import WebBaseLoader, PyPDFLoader, TextLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.documents import Document
from services.rag import get_vector_store
from qdrant_client.models import Distance, VectorParams
from services.rag import get_qdrant_client, get_embeddings
from core.config import settings

def init_collection_if_not_exists():
    client = get_qdrant_client()
    collections = client.get_collections().collections
    if not any(c.name == settings.COLLECTION_NAME for c in collections):
        # BAAI/bge-small-en-v1.5 has embedding size 384
        client.create_collection(
            collection_name=settings.COLLECTION_NAME,
            vectors_config=VectorParams(size=384, distance=Distance.COSINE),
        )

def process_and_store_documents(documents):
    init_collection_if_not_exists()
    
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200
    )
    splits = text_splitter.split_documents(documents)
    
    if not splits:
        return "No content found to ingest."
    
    vector_store = get_vector_store()
    vector_store.add_documents(documents=splits)
    
    return f"Successfully ingested {len(splits)} chunks."


def discover_internal_links(base_url: str, max_pages: int = 50) -> list[str]:
    """
    Crawl a website starting from base_url and discover all internal pages.
    Returns a list of unique internal URLs (up to max_pages).
    """
    parsed_base = urlparse(base_url)
    base_domain = parsed_base.netloc
    
    visited = set()
    to_visit = [base_url]
    discovered = []
    
    headers = {
        "User-Agent": "SiteGPT-Crawler/1.0 (RAG Chatbot Builder)"
    }
    
    while to_visit and len(discovered) < max_pages:
        current_url = to_visit.pop(0)
        
        # Normalize URL (remove fragment, trailing slash inconsistency)
        parsed = urlparse(current_url)
        normalized = f"{parsed.scheme}://{parsed.netloc}{parsed.path}"
        if normalized.endswith('/') and len(parsed.path) > 1:
            normalized = normalized.rstrip('/')
        
        if normalized in visited:
            continue
        visited.add(normalized)
        
        try:
            response = http_requests.get(current_url, headers=headers, timeout=10, allow_redirects=True)
            content_type = response.headers.get('Content-Type', '')
            
            # Only process HTML pages
            if 'text/html' not in content_type:
                continue
                
            if response.status_code != 200:
                continue
            
            discovered.append(current_url)
            print(f"  [Crawler] Discovered: {current_url}")
            
            # Parse page for more links
            soup = BeautifulSoup(response.text, 'html.parser')
            
            for link in soup.find_all('a', href=True):
                href = link['href']
                
                # Skip non-page links
                if href.startswith(('#', 'mailto:', 'tel:', 'javascript:')):
                    continue
                
                # Resolve relative URLs
                full_url = urljoin(current_url, href)
                parsed_link = urlparse(full_url)
                
                # Only follow links on the same domain
                if parsed_link.netloc != base_domain:
                    continue
                
                # Skip non-HTML resources
                path_lower = parsed_link.path.lower()
                skip_extensions = ('.pdf', '.jpg', '.jpeg', '.png', '.gif', '.svg', 
                                   '.css', '.js', '.zip', '.mp4', '.mp3', '.ico')
                if any(path_lower.endswith(ext) for ext in skip_extensions):
                    continue
                
                # Normalize and add to queue
                clean_url = f"{parsed_link.scheme}://{parsed_link.netloc}{parsed_link.path}"
                if clean_url not in visited:
                    to_visit.append(full_url)
                    
        except Exception as e:
            print(f"  [Crawler] Error fetching {current_url}: {e}")
            continue
    
    return discovered


def scrape_page_content(url: str) -> str:
    """Fetch a page and extract clean text content (no nav, footer, scripts)."""
    headers = {
        "User-Agent": "SiteGPT-Crawler/1.0 (RAG Chatbot Builder)"
    }
    
    try:
        response = http_requests.get(url, headers=headers, timeout=10)
        if response.status_code != 200:
            return ""
        
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Remove unwanted elements
        for tag in soup.find_all(['script', 'style', 'nav', 'footer', 'header', 
                                   'noscript', 'iframe', 'form']):
            tag.decompose()
        
        # Try to get main content first, fall back to body
        main_content = soup.find('main') or soup.find('article') or soup.find('body')
        
        if main_content:
            text = main_content.get_text(separator='\n', strip=True)
        else:
            text = soup.get_text(separator='\n', strip=True)
        
        # Clean up excessive whitespace
        lines = [line.strip() for line in text.splitlines() if line.strip()]
        return '\n'.join(lines)
        
    except Exception as e:
        print(f"  [Scraper] Error scraping {url}: {e}")
        return ""


async def ingest_url(url: str):
    """Crawl an entire website and ingest all pages."""
    import asyncio
    
    loop = asyncio.get_event_loop()
    
    # Step 1: Discover all internal pages (run in thread pool to not block)
    print(f"[Ingestion] Starting crawl of: {url}")
    pages = await loop.run_in_executor(None, discover_internal_links, url)
    
    if not pages:
        return "No pages found to crawl."
    
    print(f"[Ingestion] Found {len(pages)} pages. Scraping content...")
    
    # Step 2: Scrape content from each page
    all_documents = []
    
    def scrape_all():
        docs = []
        for page_url in pages:
            content = scrape_page_content(page_url)
            if content and len(content) > 50:  # Skip near-empty pages
                docs.append(Document(
                    page_content=content,
                    metadata={"source": page_url}
                ))
                print(f"  [Scraper] Scraped {len(content)} chars from {page_url}")
        return docs
    
    all_documents = await loop.run_in_executor(None, scrape_all)
    
    if not all_documents:
        return "Pages were found but no meaningful content could be extracted."
    
    # Step 3: Chunk and store
    result = process_and_store_documents(all_documents)
    
    return f"Crawled {len(pages)} pages. {result}"


async def ingest_document(filename: str, content: bytes):
    # Save content to a temporary file
    ext = os.path.splitext(filename)[1].lower()
    
    with tempfile.NamedTemporaryFile(delete=False, suffix=ext) as temp_file:
        temp_file.write(content)
        temp_file_path = temp_file.name

    try:
        if ext == ".pdf":
            loader = PyPDFLoader(temp_file_path)
        elif ext in [".txt", ".md"]:
            loader = TextLoader(temp_file_path)
        else:
            raise ValueError(f"Unsupported file extension: {ext}")
            
        docs = loader.load()
        return process_and_store_documents(docs)
    finally:
        os.remove(temp_file_path)

async def ingest_google_drive():
    from langchain_google_community import GoogleDriveLoader
    
    credentials_path = os.path.join(os.getcwd(), "credentials.json")
    if not os.path.exists(credentials_path):
        raise ValueError("credentials.json not found in backend directory.")
        
    loader = GoogleDriveLoader(
        folder_id="root",
        credentials_path=credentials_path,
        token_path=os.path.join(os.getcwd(), "token.json"),
        recursive=False,
    )
    
    docs = loader.load()
    return process_and_store_documents(docs)
