import joblib
import os
import pandas as pd

# Path to model artifacts
MODEL_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "models")
MODEL_PATH = os.path.join(MODEL_DIR, "salary_plan_model.pkl")
FEATURES_PATH = os.path.join(MODEL_DIR, "feature_names.pkl")

# Late-load model to avoid issues during startup if training isn't done
_model = None
_features = None

def load_prediction_model():
    global _model, _features
    if _model is None:
        if os.path.exists(MODEL_PATH) and os.path.exists(FEATURES_PATH):
            _model = joblib.load(MODEL_PATH)
            _features = joblib.load(FEATURES_PATH)
        else:
            print(f"Warning: Model not found at {MODEL_PATH}. Prediction will return fallback.")

def get_salary_plan(income, expenses_dict):
    """
    Generate salary planning advice based on local ML model.
    income: float
    expenses_dict: dict of category: amount
    """
    load_prediction_model()
    
    if _model is None:
        return {
            "advice": "Model is not yet trained. Please check back later.",
            "status": "offline"
        }

    # Prepare input data matching training features
    # Standard training features:
    # ['Income', 'Rent', 'Loan_Repayment', 'Insurance', 'Groceries', 
    #  'Transport', 'Eating_Out', 'Entertainment', 'Utilities', 
    #  'Healthcare', 'Education', 'Miscellaneous']
    
    input_data = {feat: 0.0 for feat in _features}
    input_data['Income'] = float(income)
    
    # Map input dictionary to fixed features
    for cat, amount in expenses_dict.items():
        # Case insensitive match or normalization could be added here
        if cat in input_data:
            input_data[cat] = float(amount)
        else:
            # Add to miscellaneous if not specifically tracked
            input_data['Miscellaneous'] += float(amount)

    input_df = pd.DataFrame([input_data])
    
    # Ensure column order matches training
    input_df = input_df[_features]
    
    prediction_percent = _model.predict(input_df)[0]
    
    # Generate a structured plan based on the predicted percentage
    target_savings = (prediction_percent / 100) * income
    
    if prediction_percent > 30:
        advice = f"Excellent saving habits! Your personalized plan targets a {prediction_percent:.1f}% savings rate (₹{target_savings:,.2f}). Recommendation: Consider investing this surplus in diversified funds or an index fund for long-term growth."
    elif prediction_percent > 15:
        advice = f"Good job. You have a healthy buffer. Your plan targets a {prediction_percent:.1f}% savings rate (₹{target_savings:,.2f}). Recommendation: Try to minimize Miscellaneous spending and automate this savings amount into a recurring deposit."
    elif prediction_percent > 0:
        advice = f"Tight budget. Your plan targets a {prediction_percent:.1f}% savings rate (₹{target_savings:,.2f}). Recommendation: Focus on reducing Entertainment and Eating Out to build an emergency fund of at least 3 months of expenses."
    else:
        advice = f"Warning: Expenses currently exceed income. Your current 'plan' targets debt reduction first. Recommendation: Immediate cuts in non-essential categories like Eating Out are required to reach a positive cash flow."

    return {
        "advice": advice,
        "savings_percentage": float(prediction_percent),
        "target_savings": float(target_savings),
        "status": "online"
    }

if __name__ == "__main__":
    # Test prediction
    sample_expenses = {
        "Rent": 5000,
        "Groceries": 2000,
        "Transport": 1000
    }
    print(get_salary_plan(20000, sample_expenses))
