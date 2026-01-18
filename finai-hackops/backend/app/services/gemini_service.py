import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()

class GeminiFinancialAssistant:
    def __init__(self):
        api_key = os.getenv('GEMINI_API_KEY')
        if api_key:
            genai.configure(api_key=api_key)
            self.model = genai.GenerativeModel('gemini-pro')
        else:
            self.model = None
            print("WARNING: GEMINI_API_KEY not found in environment variables.")
        
    def analyze_spending(self, transactions_data):
        """Analyze spending patterns using Gemini"""
        if not self.model: return "Gemini API key not configured."
        
        prompt = f"""
        As a financial advisor, analyze the following transaction data and provide insights:
        
        {transactions_data}
        
        Please provide:
        1. Spending pattern analysis
        2. Top spending categories
        3. Budget recommendations
        4. Potential savings opportunities
        
        Keep the response concise and actionable.
        """
        
        response = self.model.generate_content(prompt)
        return response.text
    
    def investment_advice(self, portfolio_data, risk_tolerance):
        """Get investment recommendations"""
        if not self.model: return "Gemini API key not configured."
        
        prompt = f"""
        As an investment advisor, review this portfolio:
        
        {portfolio_data}
        
        Risk Tolerance: {risk_tolerance}
        
        Provide:
        1. Portfolio diversification analysis
        2. Risk assessment
        3. Rebalancing suggestions
        4. Investment opportunities
        """
        
        response = self.model.generate_content(prompt)
        return response.text
    
    def budget_assistant(self, income, expenses, goals):
        """Create budget recommendations"""
        if not self.model: return "Gemini API key not configured."
        
        prompt = f"""
        Create a personalized budget plan:
        
        Monthly Income: ${income}
        Current Expenses: {expenses}
        Financial Goals: {goals}
        
        Provide:
        1. 50/30/20 budget breakdown
        2. Category-wise allocation
        3. Saving strategies
        4. Timeline to achieve goals
        """
        
        response = self.model.generate_content(prompt)
        return response.text
    
    def chat_assistant(self, user_message, context=""):
        """General financial chat assistant"""
        if not self.model: return "Gemini API key not configured."
        
        system_prompt = """You are a helpful financial AI assistant. 
        Provide accurate, helpful financial advice while being clear that 
        you're an AI and users should consult professionals for major decisions."""
        
        full_prompt = f"{system_prompt}\n\nContext: {context}\n\nUser: {user_message}"
        
        response = self.model.generate_content(full_prompt)
        return response.text
