from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from typing import Optional
from google.oauth2 import id_token
from google.auth.transport import requests
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

class GoogleToken(BaseModel):
    token: str

@router.post("/google")
async def google_auth(data: GoogleToken):
    try:
        # Specify the CLIENT_ID of the app that accesses the backend:
        CLIENT_ID = "743696234738-4s6o73beo374rbc7polnpgk38hshfi77.apps.googleusercontent.com"
        idinfo = id_token.verify_oauth2_token(data.token, requests.Request(), CLIENT_ID)

        # ID token is valid. Get the user's Google Account ID from the decoded token.
        email = idinfo['email']
        name = idinfo.get('name', '')
        
        # Check if user exists
        db_user = db.fetch_one("SELECT * FROM users WHERE email = ?", (email,))
        
        if not db_user:
            # Create new user for Google Sign-In
            username = email.split('@')[0]
            # Check if username exists (could happen if different email has same prefix, though unlikely for Google)
            existing_username = db.fetch_one("SELECT * FROM users WHERE username = ?", (username,))
            if existing_username:
                import random
                username = f"{username}{random.randint(100, 999)}"
            
            # Using a placeholder hash for Google users
            password_hash = "google_oauth_user"
            
            user_id = db.execute_query(
                "INSERT INTO users (email, username, password_hash, full_name) VALUES (?, ?, ?, ?)",
                (email, username, password_hash, name)
            )
            db_user = {"id": user_id, "email": email, "username": username, "full_name": name}
        
        return {
            "message": "Google Login successful", 
            "user": {
                "id": db_user['id'], 
                "email": db_user['email'], 
                "username": db_user['username'],
                "full_name": db_user.get('full_name')
            }
        }
    except ValueError:
        # Invalid token
        raise HTTPException(status_code=400, detail="Invalid Google token")
