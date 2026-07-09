from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from api.routes import router as api_router
from core.database import engine, Base
import os

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="SiteGPT Clone API",
    description="Backend API for RAG operations and Widget Delivery",
    version="1.0.0"
)

# Configure CORS for Next.js frontend and external widget embeds
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for the widget
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(api_router, prefix="/api")

# Serve the static widget.js file
static_dir = os.path.join(os.path.dirname(__file__), "static")
os.makedirs(static_dir, exist_ok=True)
app.mount("/static", StaticFiles(directory=static_dir), name="static")

@app.get("/")
def read_root():
    return {"message": "Welcome to the SiteGPT Clone API"}
