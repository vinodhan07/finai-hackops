import pandas as pd
import os

def clean_data():
    base_dir = os.path.dirname(os.path.dirname(__file__))
    raw_path = os.path.join(base_dir, "data", "raw", "data.csv")
    processed_dir = os.path.join(base_dir, "data", "processed")
    output_path = os.path.join(processed_dir, "finance_training.csv")

    if not os.path.exists(processed_dir):
        os.makedirs(processed_dir)

    print(f"Loading data from {raw_path}...")
    df = pd.read_csv(raw_path)

    # Simplified data for training
    # We want to predict advice or savings potential
    # Let's say we want to predict 'Potential_Savings' or 'Desired_Savings'
    
    # Selecting relevant columns
    cols_to_keep = [
        'Income', 'Rent', 'Loan_Repayment', 'Insurance', 'Groceries', 
        'Transport', 'Eating_Out', 'Entertainment', 'Utilities', 
        'Healthcare', 'Education', 'Miscellaneous', 'Desired_Savings_Percentage'
    ]
    
    processed_df = df[cols_to_keep].copy()
    
    # Calculate Total Expenses
    expense_cols = ['Rent', 'Loan_Repayment', 'Insurance', 'Groceries', 
                   'Transport', 'Eating_Out', 'Entertainment', 'Utilities', 
                   'Healthcare', 'Education', 'Miscellaneous']
    processed_df['Total_Expense'] = processed_df[expense_cols].sum(axis=1)
    
    # Rule-based 'Advice' for training labels if we want classification
    # Or we can just use the percentages for regression.
    # The user request mentioned 'salary planning advice'.
    
    def generate_advice(row):
        savings_ratio = (row['Income'] - row['Total_Expense']) / row['Income'] if row['Income'] > 0 else 0
        if savings_ratio > 0.3:
            return "Excellent saving habits! Consider investing more in diversified funds."
        elif savings_ratio > 0.15:
            return "Good job. You have a healthy buffer. Try to cut down on Miscellaneous to save more."
        elif savings_ratio > 0:
            return "Tight budget. Focus on reducing Entertainment and Eating Out to build an emergency fund."
        else:
            return "Warning: Expenses exceed income. Immediate budget cuts in non-essentials required."

    processed_df['Advice'] = processed_df.apply(generate_advice, axis=1)
    
    # Let's also keep 'Category' as a feature if we were to use the other dataset, 
    # but data.csv is tabular across categories.
    
    print(f"Saving processed data to {output_path}...")
    processed_df.to_csv(output_path, index=False)
    print("Data cleaning completed successfully.")

if __name__ == "__main__":
    clean_data()
