# FinAI Backend

This is the FastAPI-based backend for the FinAI platform, providing authentication, transaction management, and AI-driven financial insights.

## 🚀 Features
- **FastAPI Framework**: High-performance, asynchronous Python backend.
- **Google OAuth**: Token verification and automated user onboarding.
- **Gemini AI Integration**: Advanced financial analysis using Google's generative models.
- **SQLite Database**: Lightweight and portable storage for local development.
- **Modular API Architecture**: Clean separation of concerns across routes and services.

## 🛠️ Technology Stack
- **Python 3.9+**
- **FastAPI**
- **sqlite3**
- **Google Generative AI** (Gemini Pro)
- **google-auth** (OAuth verification)
- **Pydantic** (Data validation)

## 💻 Development Setup

Follow these steps to get the backend server running locally:

### 1. Prerequisites
- **Python 3.9+** installed.
- A **Gemini API Key** from [Google AI Studio](https://aistudio.google.com/).

### 2. Local Installation
1. **Navigate to the backend directory**:
   ```bash
   cd backend
   ```
2. **Create a virtual environment**:
   ```bash
   python -m venv venv
   ```
3. **Activate the environment**:
   - Windows: `venv\Scripts\activate`
   - Mac/Linux: `source venv/bin/activate`
4. **Install required packages**:
   ```bash
   pip install -r requirements.txt
   ```

### 3. Database Initialization
Run the initialization script to set up the SQLite database and create all necessary tables:
```bash
python init_database.py
```
*This will create a `finai_dev.db` file in the root backend directory.*

### 4. Configuration
Create a `.env` file in the `backend/` folder and add your configuration:
```env
GEMINI_API_KEY=your_key_here
```

### 5. Running the API
Start the server using Uvicorn with auto-reload enabled:
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
The interactive API documentation will be available at:
- **Swagger UI**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **Redoc**: [http://localhost:8000/redoc](http://localhost:8000/redoc)

## 🏗️ Project Structure
- `app/api`: Route handlers for auth, transactions, and analysis.
- `app/db`: Database connection and utility classes.
- `app/services`: External integrations (e.g., Gemini AI).
- `app/main.py`: Application entry point and middleware configuration.

For full project instructions, please refer to the [Root README](../README.md).
