from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
from dotenv import load_dotenv
from .agents.coordinator import Coordinator

# Robust .env loading
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ENV_PATH = os.path.join(BASE_DIR, '.env')
load_dotenv(ENV_PATH)

app = FastAPI(title="NYAYA-VAANI Backend")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Coordinator (Singleton-ish)
coordinator = Coordinator()

class AnalyzeRequest(BaseModel):
    text: str

@app.get("/")
def read_root():
    return {"message": "NYAYA-VAANI Backend is running"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}

@app.post("/analyze")
async def analyze_case(request: AnalyzeRequest):
    if not request.text:
        raise HTTPException(status_code=400, detail="Text is required")
    
    try:
        result = coordinator.run_debate(request.text)
        return result
    except Exception as e:
        print(f"Error processing request: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/reset")
def reset_session():
    coordinator.reset()
    return {"status": "Session Reset"}
