from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List
from ..db.database import Database

router = APIRouter()
db = Database()

class BudgetCreate(BaseModel):
    user_id: int
    category: str
    budget_amount: float

class BudgetCategory(BaseModel):
    id: int
    user_id: int
    category: str
    budget_amount: float
    spent_amount: float

@router.get("/{user_id}", response_model=List[dict])
async def get_budgets(user_id: int):
    # Fetch budgets and also calculate spent amount from transactions
    budgets = db.fetch_all("SELECT * FROM budgets WHERE user_id = ?", (user_id,))
    
    # Update spent_amount based on transactions for each budget category
    for budget in budgets:
        spent = db.fetch_one(
            "SELECT SUM(ABS(amount)) as total FROM transactions WHERE user_id = ? AND category = ? AND transaction_type = 'expense'",
            (user_id, budget['category'])
        )
        budget['spent_amount'] = spent['total'] if spent and spent['total'] else 0
        
    return budgets

@router.post("/")
async def create_budget(budget: BudgetCreate):
    # Check if budget for this category already exists
    existing = db.fetch_one(
        "SELECT id FROM budgets WHERE user_id = ? AND category = ?",
        (budget.user_id, budget.category)
    )
    
    if existing:
        db.execute_query(
            "UPDATE budgets SET budget_amount = ? WHERE id = ?",
            (budget.budget_amount, existing['id'])
        )
        return {"id": existing['id'], "message": "Budget updated successfully"}
    else:
        budget_id = db.execute_query(
            "INSERT INTO budgets (user_id, category, budget_amount) VALUES (?, ?, ?)",
            (budget.user_id, budget.category, budget.budget_amount)
        )
        return {"id": budget_id, "message": "Budget created successfully"}
