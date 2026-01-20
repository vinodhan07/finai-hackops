# FinAI - Intelligent Financial Management Platform

FinAI is a modern, AI-powered financial management application designed to help users track transactions, manage budgets, set financial goals, and get intelligent insights into their spending habits.

## 🚀 Features

- **Multi-method Authentication**: Secure Sign-In/Sign-Up and seamless **Google OAuth 2.0 Integration**.
- **Transaction Tracking**: Manage income, expenses, and investments with detailed categorization.
- **AI Analysis**: Get smart financial advice and analysis powered by **Google Gemini AI**.
- **Budget Management**: Set monthly limits and track spending in real-time.
- **Financial Goals**: Set, track, and achieve your financial milestones.
- **Interactive Dashboard**: Visualize your financial health with dynamic charts and metrics.
- **QR Payments**: Integrated QR-based payment tracking system.
- **Smart Alerts**: Stay on top of your finances with automated reminders and alerts.

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18 with Vite
- **Styling**: Tailwind CSS & Vanilla CSS
- **UI Components**: shadcn/ui & Radix UI
- **State Management**: React Context API
- **Authentication**: Custom Auth + `@react-oauth/google`
- **Charts**: Recharts

### Backend
- **Framework**: FastAPI (Python)
- **Database**: SQLite (SQLAlchemy ready)
- **AI Integration**: Google Generative AI (Gemini)
- **Authentication**: JWT & `google-auth`
- **Utility**: Pydantic, Uvicorn, Dotenv

## 📋 Prerequisites

- **Node.js** (v18 or higher)
- **Python** (v3.9 or higher)
- **Google Cloud Console Project** (for Google Sign-In)

## 🔧 Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd finai-hackops
```

### 2. Backend Setup
Follow these steps to set up the FastAPI server:

1. **Navigate to the Backend Folder**:
   ```bash
   cd backend
   ```

2. **Create a Virtual Environment**:
   It is recommended to use a virtual environment to manage dependencies:
   ```bash
   python -m venv venv
   ```

3. **Activate the Virtual Environment**:
   - **Windows**: `venv\Scripts\activate`
   - **Mac/Linux**: `source venv/bin/activate`

4. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

5. **Set Up Environment Variables**:
   Create a `.env` file in the `backend` folder and add your Gemini API Key:
   ```env
   GEMINI_API_KEY=your_actual_gemini_api_key
   ```

6. **Initialize the Database**:
   Run the initialization script to create the SQLite database and tables:
   ```bash
   python init_database.py
   ```

7. **Run the Development Server**:
   ```bash
   uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
   ```
   The API will be available at [http://localhost:8000](http://localhost:8000).

### 3. Frontend Setup
1. **Navigate to Frontend Folder**:
   ```bash
   cd ../frontend
   ```

2. **Install Dependencies**:
   Ensure you have Node.js installed, then run:
   ```bash
   npm install
   ```

3. **Configure Google Client ID**:
   Open `src/main.tsx` and update `GOOGLE_CLIENT_ID` with your own ID from Google Cloud Console.

4. **Start Development Server**:
   ```bash
   npm run dev
   ```

5. **Access the Application**:
   Open your browser to [http://localhost:5173](http://localhost:5173).

## 🔐 Google Sign-In Configuration

To enable Google Sign-In, update the `GOOGLE_CLIENT_ID` in the following files:
- `backend/app/api/auth.py`
- `frontend/src/main.tsx`

Ensure `http://localhost:5173` is added to your Authorized JavaScript origins in the Google Cloud Console.

## 📄 License

This project is developed for the HackOps competition. All rights reserved.
