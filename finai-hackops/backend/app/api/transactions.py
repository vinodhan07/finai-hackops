from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from datetime import date
from ..db.database import Database

router = APIRouter()
db = Database()

class TransactionCreate(BaseModel):
    user_id: int
    transaction_type: str
    amount: float
    category: str
    description: Optional[str] = None
    transaction_date: date

@router.get("/{user_id}", response_model=List[dict])
async def get_transactions(user_id: int):
    return db.fetch_all("SELECT * FROM transactions WHERE user_id = ? ORDER BY transaction_date DESC", (user_id,))

@router.post("/")
async def create_transaction(transaction: TransactionCreate):
    transaction_id = db.execute_query(
        """INSERT INTO transactions (user_id, transaction_type, amount, category, description, transaction_date) 
           VALUES (?, ?, ?, ?, ?, ?)""",
        (transaction.user_id, transaction.transaction_type, transaction.amount, 
         transaction.category, transaction.description, transaction.transaction_date)
    )
    return {"id": transaction_id, "message": "Transaction created successfully"}
