import uuid
from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from core.database import Base


class Bot(Base):
    """Each bot represents a separate chatbot for a specific company."""
    __tablename__ = "bots"

    id = Column(Integer, primary_key=True, index=True)
    bot_id = Column(String, unique=True, index=True, default=lambda: str(uuid.uuid4()))
    company_name = Column(String, nullable=False)
    created_at = Column(DateTime, server_default=func.now())


class ChatbotConfig(Base):
    """Per-bot appearance and behavior configuration."""
    __tablename__ = "chatbot_configs"

    id = Column(Integer, primary_key=True, index=True)
    bot_id = Column(String, index=True, nullable=False)
    name = Column(String, default="NexaChat Assistant")
    primary_color = Column(String, default="#2563eb")
    welcome_message = Column(String, default="Hi there! How can I help you today?")
