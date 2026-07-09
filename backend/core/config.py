from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    HUGGINGFACEHUB_API_TOKEN: Optional[str] = None
    CLUSTUR_ENDPOINT: Optional[str] = None
    VECTOR_DB_API: Optional[str] = None
    
    # Model configuration
    EMBEDDING_MODEL: str = "BAAI/bge-small-en-v1.5"
    LLM_MODEL: str = "mistralai/Mistral-7B-Instruct-v0.2"
    
    # Database (PostgreSQL / SQLite)
    DATABASE_URL: str = "sqlite:///./sitegpt.db"
    
    # Qdrant collection name
    COLLECTION_NAME: str = "sitegpt_collection"

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
