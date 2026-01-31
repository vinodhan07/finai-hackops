import pandas as pd
from sklearn.tree import DecisionTreeClassifier
import joblib
import os

def train_model():
    base_dir = os.path.dirname(os.path.dirname(__file__))
    processed_path = os.path.join(base_dir, "data", "processed", "finance_training.csv")
    model_dir = os.path.join(os.path.dirname(base_dir), "models")
    model_path = os.path.join(model_dir, "salary_plan_model.pkl")
    feature_names_path = os.path.join(model_dir, "feature_names.pkl")

    if not os.path.exists(model_dir):
        os.makedirs(model_dir)

    print(f"Loading processed data from {processed_path}...")
    df = pd.read_csv(processed_path)

    # Features: Income and detailed expenses
    X = df.drop(columns=['Advice', 'Total_Expense', 'Desired_Savings_Percentage'])
    y = df['Desired_Savings_Percentage']

    print("Training DecisionTreeRegressor...")
    from sklearn.tree import DecisionTreeRegressor
    model = DecisionTreeRegressor(random_state=42)
    model.fit(X, y)

    print(f"Saving model to {model_path}...")
    joblib.dump(model, model_path)
    
    # We also need to save the feature names to ensure consistency in prediction
    joblib.dump(list(X.columns), feature_names_path)
    
    print("Model training completed successfully.")

if __name__ == "__main__":
    train_model()
