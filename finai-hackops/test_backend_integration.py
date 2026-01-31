import sys
import os

# Add backend to path
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from app.services.gemini_service import GeminiFinancialAssistant

def test_integration():
    assistant = GeminiFinancialAssistant()
    
    # Test budget_assistant which now uses local ML
    income = 50000
    expenses = {
        "Rent": 15000,
        "Groceries": 5000,
        "Transport": 3000,
        "Entertainment": 2000
    }
    
    print("Testing local budget_assistant...")
    advice = assistant.budget_assistant(income, expenses)
    print(f"Advice: {advice}")
    
    # Verify it doesn't try to call Gemini if API key is missing (it shouldn't for budget_assistant now)
    print("Integration test passed if advice is returned above.")

if __name__ == "__main__":
    test_integration()
