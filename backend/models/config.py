from sqlalchemy import Column, Integer, String
from core.database import Base

class ChatbotConfig(Base):
    __tablename__ = "chatbot_configs"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, default="SiteGPT Assistant")
    primary_color = Column(String, default="#4f46e5")  # Indigo-600
    welcome_message = Column(String, default="Hi there! How can I help you today?")
