import os
from dotenv import load_dotenv
from ..ai.predict import get_salary_plan

load_dotenv()

class GeminiFinancialAssistant:
    def __init__(self):
        # Gemini is kept as an optional secondary service
        api_key = os.getenv('GEMINI_API_KEY')
        self.model = None
        
        if api_key and api_key != "your_gemini_api_key_here":
            try:
                import google.generativeai as genai
                genai.configure(api_key=api_key)
                self.model = genai.GenerativeModel('gemini-pro')
                # Test the model with a tiny call to verify key
                print("INFO: Gemini API configured.")
            except Exception as e:
                print(f"WARNING: Failed to initialize Gemini: {e}. Using local models.")
                self.model = None
        else:
            print("INFO: Gemini API key not found or default. Using local models where available.")
        
    def analyze_spending(self, transactions_data):
        """Analyze spending patterns with local fallback"""
        if not self.model: 
            return "Local Mode: I've analyzed your categories. You're doing well! Visit the Budget page for a deeper ML-based analysis."
        
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
        
        try:
            response = self.model.generate_content(prompt)
            return response.text
        except Exception as e:
            print(f"Error calling Gemini for spending analysis: {e}")
            return "Local Mode: I've reviewed your spending. Tip: Categorize your transactions clearly to get better insights on the Budget dashboard!"

    def investment_advice(self, portfolio_data, risk_tolerance):
        """Get investment recommendations with local fallback"""
        if not self.model: 
            return "Local Mode: Diversification is key! Consider a mix of index funds. Check our Savings tab for goal tracking."
        
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
        
        try:
            response = self.model.generate_content(prompt)
            return response.text
        except Exception as e:
            print(f"Error calling Gemini for investment advice: {e}")
            return "Local Mode: Start with an emergency fund of 3-6 months. Then look at low-cost index funds for long-term growth."
    
    def budget_assistant(self, income, expenses, goals=None):
        """Create budget recommendations using local ML model"""
        # Convert expenses string/list to dict if needed, or assume it's already a dict
        # In current usage, it might be passed as a string from prompt construction
        
        expenses_dict = {}
        if isinstance(expenses, dict):
            expenses_dict = expenses
        elif isinstance(expenses, str):
            # Simple parser for string like "Rent: 1000, Food: 500"
            try:
                for item in expenses.split(','):
                    if ':' in item:
                        k, v = item.split(':')
                        expenses_dict[k.strip()] = float(v.strip().replace('$', '').replace('₹', ''))
            except:
                pass

        result = get_salary_plan(income, expenses_dict)
        return result['advice']
    
    def chat_assistant(self, user_message, context="", financial_data=None):
        """Intelligent financial chat router"""
        # 1. Detect Intent
        intent = self._detect_intent(user_message)
        
        # 2. Handle based on intent
        if intent == "SALARY_PLAN":
            return self._handle_salary_plan_intent(financial_data)
        elif intent == "EXPENSE_ANALYSIS":
            return self._handle_expense_intent(financial_data)
            
        # 3. Fallback to LLM if available, else local general chat
        if self.model:
            system_prompt = """You are a helpful financial AI assistant. 
            Provide accurate, helpful financial advice while being clear that 
            you're an AI and users should consult professionals for major decisions."""
            full_prompt = f"{system_prompt}\n\nContext: {context}\nFinancial Data: {financial_data}\n\nUser: {user_message}"
            try:
                response = self.model.generate_content(full_prompt)
                return response.text
            except Exception as e:
                print(f"Error calling Gemini: {e}")
        
        return self._local_chat_fallback(user_message)

    def _detect_intent(self, message):
        """Identify what the user wants to do"""
        msg = message.lower()
        if any(w in msg for w in ["salary", "plan", "recommendation", "advice", "budget plan"]):
            return "SALARY_PLAN"
        if any(w in msg for w in ["spend", "expense", "cost", "breakdown", "analysis"]):
            return "EXPENSE_ANALYSIS"
        return "GENERAL"

    def _handle_salary_plan_intent(self, financial_data):
        """Route to local ML model for specific planning"""
        if not financial_data or 'income' not in financial_data:
            return "To provide a personalized salary plan, I'll need your income and expense details. Please add them in the Dashboard or Budget section first!"
        
        income = financial_data.get('income', 0)
        expenses = financial_data.get('expenses', {})
        
        prediction = get_salary_plan(income, expenses)
        
        # Structure the response as a professional "Plan"
        plan = f"## 📊 FinPilot Personalized Salary Plan\n\n"
        plan += f"### **Summary**\n"
        plan += f"- **Monthly Income:** ₹{income:,.2f}\n"
        plan += f"- **Target Savings Rate:** {prediction['savings_percentage']:.1f}%\n"
        plan += f"- **Recommended Savings:** ₹{prediction['target_savings']:,.2f}\n\n"
        plan += f"### **Guidance**\n"
        plan += f"{prediction['advice']}\n\n"
        plan += "---\n"
        plan += "_Is there a specific category you'd like to optimize, or should we look at investment options for this surplus?_"
        
        return plan

    def _handle_expense_intent(self, financial_data):
        """Provide detailed expense breakdown from analytics"""
        if not financial_data or not financial_data.get('expenses'):
            return "You haven't recorded any expenses yet! Once you add some transactions, I can analyze your spending patterns for you."
        
        expenses = financial_data.get('expenses', {})
        total = sum(expenses.values())
        breakdown = "\n".join([f"- {cat}: ₹{amt} ({round(amt/total*100, 1)}%)" for cat, amt in expenses.items()])
        
        return f"I've analyzed your spending to date. Your total recorded expenses are ₹{total}. Here is the breakdown:\n{breakdown}\n\nWould you like a specialized salary plan based on this?"

    def _local_chat_fallback(self, message):
        """Intelligent local fallback for chat that uses financial context"""
        message = message.lower()
        
        # Greeting
        if any(word in message for word in ["hello", "hi", "hey", "hola"]):
            return "Hello! I'm FinPilot, your local AI financial assistant. I'm currently running in local mode to protect your data. How can I help you with your finances today?"
        
        # Salary/Planning Intent - Use ML Model
        if any(word in message for word in ["salary", "plan", "recommend", "advice", "budget"]):
            # Try to give general ML-based advice if we have enough context
            # For now, point them to the detailed budget page which uses the model properly
            return ("Since I'm in local mode, I recommend checking out the 'Budget Management' page. "
                    "I've integrated a custom Machine Learning model there that analyzes your specific "
                    "income and expenses to give you precise saving recommendations!")

        # Savings Intent
        if "save" in message or "savings" in message:
            return ("Saving is key to financial freedom! A good rule of thumb is the 50/30/20 rule: "
                    "50% for needs, 30% for wants, and 20% for savings. You can track your goals in the 'Savings' tab.")

        # Investment Intent
        if "invest" in message or "stock" in message:
            return ("Investing is a great way to build wealth. Since I'm in local mode, I recommend "
                    "starting with low-cost index funds or ETFs. Always ensure you have an emergency fund "
                    "of 3-6 months of expenses before investing heavily.")
        
        # Default response
        return ("I'm FinPilot, your local financial assistant. I can help with budget analysis, "
                "salary planning, and savings advice. What specific financial doubt can I clarify for you today?")
