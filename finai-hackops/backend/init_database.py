import sqlite3
import os
from datetime import datetime

def create_database(db_path='finai_dev.db'):
    """Create SQLite database with all necessary tables"""
    print(f"Initializing database at: {db_path}")
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Enable foreign keys
    cursor.execute('PRAGMA foreign_keys = ON;')
    
    # Create all tables
    tables = [
        """
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            username TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            full_name TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """,
        """
        CREATE TABLE IF NOT EXISTS transactions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            transaction_type TEXT CHECK(transaction_type IN ('income', 'expense', 'investment')) NOT NULL,
            amount DECIMAL(15, 2) NOT NULL,
            category TEXT NOT NULL,
            description TEXT,
            transaction_date DATE NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );
        """,
        """
        CREATE TABLE IF NOT EXISTS ai_analysis (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            analysis_type TEXT NOT NULL,
            prompt TEXT NOT NULL,
            ai_response TEXT NOT NULL,
            model_used TEXT DEFAULT 'gemini-pro',
            confidence_score DECIMAL(3, 2),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );
        """,
        """
        CREATE TABLE IF NOT EXISTS financial_goals (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            goal_name TEXT NOT NULL,
            target_amount DECIMAL(15, 2) NOT NULL,
            current_amount DECIMAL(15, 2) DEFAULT 0,
            deadline DATE,
            status TEXT CHECK(status IN ('active', 'completed', 'cancelled')) DEFAULT 'active',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );
        """,
        """
        CREATE TABLE IF NOT EXISTS budget_categories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            category_name TEXT NOT NULL,
            monthly_limit DECIMAL(15, 2) NOT NULL,
            current_spent DECIMAL(15, 2) DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );
        """,
        """
        CREATE TABLE IF NOT EXISTS investments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            asset_name TEXT NOT NULL,
            asset_type TEXT CHECK(asset_type IN ('stock', 'crypto', 'bond', 'mutual_fund', 'real_estate')) NOT NULL,
            quantity DECIMAL(15, 6) NOT NULL,
            purchase_price DECIMAL(15, 2) NOT NULL,
            current_price DECIMAL(15, 2),
            purchase_date DATE NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );
        """,
        """
        CREATE TABLE IF NOT EXISTS chat_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            message TEXT NOT NULL,
            sender TEXT CHECK(sender IN ('user', 'ai')) NOT NULL,
            session_id TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );
        """
    ]
    
    for table_sql in tables:
        cursor.execute(table_sql)
    
    # Create indexes for better performance
    indexes = [
        "CREATE INDEX IF NOT EXISTS idx_transactions_user ON transactions(user_id);",
        "CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(transaction_date);",
        "CREATE INDEX IF NOT EXISTS idx_ai_analysis_user ON ai_analysis(user_id);",
        "CREATE INDEX IF NOT EXISTS idx_chat_session ON chat_history(session_id);",
        "CREATE INDEX IF NOT EXISTS idx_investments_user ON investments(user_id);"
    ]
    
    for index_sql in indexes:
        cursor.execute(index_sql)
    
    conn.commit()
    conn.close()
    
    print(f"✅ Database created successfully: {db_path}")

if __name__ == "__main__":
    create_database(os.path.join(os.path.dirname(__file__), 'finai_dev.db'))
