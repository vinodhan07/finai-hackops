from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional
from ..services.gemini_service import GeminiFinancialAssistant
from ..db.database import Database

router = APIRouter()
gemini = GeminiFinancialAssistant()
db = Database()

class AnalysisRequest(BaseModel):
    user_id: int
    analysis_type: str

@router.post("/analyze-spending")
async def analyze_spending(request: AnalysisRequest):
    # Fetch transactions for user
    transactions = db.fetch_all(
        "SELECT category, SUM(amount) as total FROM transactions WHERE user_id = ? GROUP BY category",
        (request.user_id,)
    )
    
    if not transactions:
        return {"analysis": "No transaction data found for analysis."}
    
    transactions_text = "\n".join([f"- {t['category']}: ${t['total']}" for t in transactions])
    
    analysis = gemini.analyze_spending(transactions_text)
    
    # Save analysis
    db.execute_query(
        "INSERT INTO ai_analysis (user_id, analysis_type, prompt, ai_response) VALUES (?, ?, ?, ?)",
        (request.user_id, request.analysis_type, transactions_text, analysis)
    )
    
    return {"analysis": analysis}

class ChatRequest(BaseModel):
    user_id: int
    message: str
    session_id: str

@router.post("/chat")
async def chat(request: ChatRequest):
    # Save user message
    db.execute_query(
        "INSERT INTO chat_history (user_id, message, sender, session_id) VALUES (?, ?, 'user', ?)",
        (request.user_id, request.message, request.session_id)
    )
    
    ai_response = gemini.chat_assistant(request.message)
    
    # Save AI response
    db.execute_query(
        "INSERT INTO chat_history (user_id, message, sender, session_id) VALUES (?, ?, 'ai', ?)",
        (request.user_id, ai_response, request.session_id)
    )
    
    return {"response": ai_response}
