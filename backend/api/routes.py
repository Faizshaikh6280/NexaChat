import uuid
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional
from sqlalchemy.orm import Session
from services.ingestion import ingest_url, ingest_document, ingest_google_drive
from services.rag import chat_with_rag
from core.database import get_db
from models.config import Bot, ChatbotConfig

router = APIRouter()


# ─── Pydantic Schemas ───────────────────────────────────────────────────────

class CreateBotRequest(BaseModel):
    company_name: str

class URLIngestRequest(BaseModel):
    url: str
    bot_id: str

class ChatRequest(BaseModel):
    query: str
    bot_id: str
    session_id: str = "default"

class ConfigUpdateRequest(BaseModel):
    bot_id: str
    name: str
    primary_color: str
    welcome_message: str

class GDriveIngestRequest(BaseModel):
    bot_id: str
    folder_id: str = "root"


# ─── Bot CRUD Endpoints ─────────────────────────────────────────────────────

@router.post("/bots")
def create_bot(req: CreateBotRequest, db: Session = Depends(get_db)):
    """Create a new chatbot for a company."""
    new_bot = Bot(
        bot_id=str(uuid.uuid4()),
        company_name=req.company_name,
    )
    db.add(new_bot)
    db.commit()
    db.refresh(new_bot)

    # Also create a default config for this bot
    default_config = ChatbotConfig(
        bot_id=new_bot.bot_id,
        name=f"{req.company_name} Assistant",
        primary_color="#2563eb",
        welcome_message="Hi there! How can I help you today?",
    )
    db.add(default_config)
    db.commit()

    return {
        "status": "success",
        "bot_id": new_bot.bot_id,
        "company_name": new_bot.company_name,
    }


@router.get("/bots")
def list_bots(db: Session = Depends(get_db)):
    """List all created chatbots."""
    bots = db.query(Bot).order_by(Bot.created_at.desc()).all()
    return [
        {
            "bot_id": bot.bot_id,
            "company_name": bot.company_name,
            "created_at": str(bot.created_at) if bot.created_at else None,
        }
        for bot in bots
    ]


@router.delete("/bots/{bot_id}")
def delete_bot(bot_id: str, db: Session = Depends(get_db)):
    """Delete a chatbot and its config."""
    bot = db.query(Bot).filter(Bot.bot_id == bot_id).first()
    if not bot:
        raise HTTPException(status_code=404, detail="Bot not found")

    # Delete config
    db.query(ChatbotConfig).filter(ChatbotConfig.bot_id == bot_id).delete()
    db.delete(bot)
    db.commit()

    # Note: Qdrant documents with this bot_id remain but won't be queried
    return {"status": "success", "message": f"Bot '{bot.company_name}' deleted."}


# ─── Ingestion Endpoints ────────────────────────────────────────────────────

@router.post("/ingest/url")
async def ingest_web_url(request: URLIngestRequest):
    """Crawl a website and ingest it for a specific bot."""
    try:
        result = await ingest_url(request.url, request.bot_id)
        return {"status": "success", "message": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/ingest/document")
async def ingest_doc(file: UploadFile = File(...), bot_id: str = Form(...)):
    """Upload and ingest a document for a specific bot."""
    try:
        content = await file.read()
        result = await ingest_document(file.filename, content, bot_id)
        return {"status": "success", "message": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/ingest/gdrive")
async def ingest_gdrive(request: GDriveIngestRequest):
    """Ingest documents from Google Drive for a specific bot."""
    try:
        result = await ingest_google_drive(request.bot_id, request.folder_id)
        return {"status": "success", "message": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ─── Chat Endpoint ──────────────────────────────────────────────────────────

@router.post("/chat")
async def chat(request: ChatRequest):
    """Chat with a specific bot — only retrieves that bot's knowledge."""
    try:
        answer = await chat_with_rag(request.query, request.session_id, request.bot_id)
        return {"answer": answer}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ─── Config Endpoints ───────────────────────────────────────────────────────

@router.get("/config")
def get_config(bot_id: str = "", db: Session = Depends(get_db)):
    """Get the appearance config for a specific bot."""
    if not bot_id:
        # Fallback for legacy requests without bot_id
        config = db.query(ChatbotConfig).first()
    else:
        config = db.query(ChatbotConfig).filter(ChatbotConfig.bot_id == bot_id).first()

    if not config:
        return {
            "name": "NexaChat Assistant",
            "primary_color": "#2563eb",
            "welcome_message": "Hi there! How can I help you today?",
        }

    return {
        "name": config.name,
        "primary_color": config.primary_color,
        "welcome_message": config.welcome_message,
    }


@router.post("/config")
def update_config(req: ConfigUpdateRequest, db: Session = Depends(get_db)):
    """Update the appearance config for a specific bot."""
    config = db.query(ChatbotConfig).filter(ChatbotConfig.bot_id == req.bot_id).first()
    if not config:
        config = ChatbotConfig(bot_id=req.bot_id)
        db.add(config)

    config.name = req.name
    config.primary_color = req.primary_color
    config.welcome_message = req.welcome_message

    db.commit()
    db.refresh(config)
    return {"status": "success"}
