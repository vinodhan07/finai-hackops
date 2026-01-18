from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from typing import Optional
from ..db.database import Database

router = APIRouter()
db = Database()

class UserCreate(BaseModel):
    email: EmailStr
    username: str
    password: str
    full_name: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

@router.post("/signup")
async def signup(user: UserCreate):
    # Check if user exists
    existing_user = db.fetch_one("SELECT * FROM users WHERE email = ? OR username = ?", (user.email, user.username))
    if existing_user:
        raise HTTPException(status_code=400, detail="User already exists")
    
    # Simple hash for now (should use passlib)
    password_hash = f"hashed_{user.password}"
    
    user_id = db.execute_query(
        "INSERT INTO users (email, username, password_hash, full_name) VALUES (?, ?, ?, ?)",
        (user.email, user.username, password_hash, user.full_name)
    )
    
    return {"id": user_id, "email": user.email, "message": "User created successfully"}

@router.post("/login")
async def login(user: UserLogin):
    db_user = db.fetch_one("SELECT * FROM users WHERE email = ?", (user.email,))
    if not db_user:
        raise HTTPException(status_code=400, detail="Invalid credentials")
    
    # Check "hashed" password
    if db_user['password_hash'] != f"hashed_{user.password}":
        raise HTTPException(status_code=400, detail="Invalid credentials")
    
    return {"message": "Login successful", "user": {"id": db_user['id'], "email": db_user['email'], "username": db_user['username']}}
