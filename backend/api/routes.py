from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from pydantic import BaseModel
from services.ingestion import ingest_url, ingest_document, ingest_google_drive
from services.rag import chat_with_rag

router = APIRouter()

class URLIngestRequest(BaseModel):
    url: str

class ChatRequest(BaseModel):
    query: str
    session_id: str = "default"

@router.post("/ingest/url")
async def ingest_web_url(request: URLIngestRequest):
    try:
        result = await ingest_url(request.url)
        return {"status": "success", "message": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/ingest/document")
async def ingest_doc(file: UploadFile = File(...)):
    try:
        content = await file.read()
        result = await ingest_document(file.filename, content)
        return {"status": "success", "message": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/ingest/gdrive")
async def ingest_gdrive():
    try:
        result = await ingest_google_drive()
        return {"status": "success", "message": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/chat")
async def chat(request: ChatRequest):
    try:
        answer = await chat_with_rag(request.query, request.session_id)
        return {"answer": answer}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

from fastapi import Depends
from sqlalchemy.orm import Session
from core.database import get_db
from models.config import ChatbotConfig

class ConfigUpdateRequest(BaseModel):
    name: str
    primary_color: str
    welcome_message: str

@router.get("/config")
def get_config(db: Session = Depends(get_db)):
    config = db.query(ChatbotConfig).first()
    if not config:
        config = ChatbotConfig()
        db.add(config)
        db.commit()
        db.refresh(config)
    return {
        "name": config.name,
        "primary_color": config.primary_color,
        "welcome_message": config.welcome_message
    }

@router.post("/config")
def update_config(req: ConfigUpdateRequest, db: Session = Depends(get_db)):
    config = db.query(ChatbotConfig).first()
    if not config:
        config = ChatbotConfig()
        db.add(config)
        
    config.name = req.name
    config.primary_color = req.primary_color
    config.welcome_message = req.welcome_message
    
    db.commit()
    db.refresh(config)
    return {"status": "success"}
