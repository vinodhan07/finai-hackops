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

class SalaryPlanRequest(BaseModel):
    user_id: int
    income: float
    expenses: dict

@router.post("/salary-plan")
async def get_salary_plan_api(request: SalaryPlanRequest):
    advice = gemini.budget_assistant(request.income, request.expenses)
    
    # Save analysis
    db.execute_query(
        "INSERT INTO ai_analysis (user_id, analysis_type, prompt, ai_response) VALUES (?, ?, ?, ?)",
        (request.user_id, "salary_plan", str(request.expenses), advice)
    )
    
    return {"advice": advice}

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
    # 1. Fetch user financial context for intent routing
    transactions = db.fetch_all("SELECT transaction_type, category, amount FROM transactions WHERE user_id = ?", (request.user_id,))
    
    income = 0
    expenses_dict = {}
    
    for t in transactions:
        if t['transaction_type'] == 'income':
            income += t['amount']
        else:
            cat = t['category']
            expenses_dict[cat] = expenses_dict.get(cat, 0) + abs(t['amount'])
    
    financial_data = {
        "income": income,
        "expenses": expenses_dict
    }

    # 2. Save user message
    db.execute_query(
        "INSERT INTO chat_history (user_id, message, sender, session_id) VALUES (?, ?, 'user', ?)",
        (request.user_id, request.message, request.session_id)
    )
    
    # 3. Call AI assistant with context
    ai_response = gemini.chat_assistant(request.message, financial_data=financial_data)
    
    # 4. Save AI response
    db.execute_query(
        "INSERT INTO chat_history (user_id, message, sender, session_id) VALUES (?, ?, 'ai', ?)",
        (request.user_id, ai_response, request.session_id)
    )
    
    return {"response": ai_response}
