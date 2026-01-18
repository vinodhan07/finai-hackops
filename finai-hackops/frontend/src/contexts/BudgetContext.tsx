
import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

export interface BudgetCategory {
  id: number;
  name: string;
  budget: number;
  spent: number;
  color: string;
  icon: string;
}

export interface IncomeSource {
  id: number;
  name: string;
  amount: number;
  date: string;
}

export interface Transaction {
  id: number;
  date: string;
  description: string;
  amount: number;
  category: string;
  mode: string;
  status: string;
}

interface BudgetContextType {
  budgets: BudgetCategory[];
  income: IncomeSource[];
  transactions: Transaction[];
  setBudgets: (budgets: BudgetCategory[]) => void;
  addIncome: (income: Omit<IncomeSource, 'id'>) => void;
  addBudget: (budget: Omit<BudgetCategory, 'id' | 'spent'>) => void;
  processPayment: (payment: { amount: number; description: string; category: string; merchant: string }) => void;
  refreshTransactions: () => Promise<void>;
  getTotalBudget: () => number;
  getTotalSpent: () => number;
  getTotalIncome: () => number;
  getCurrentBalance: () => number;
  getBudgetUsagePercentage: () => number;
  getSavingsPercentage: () => number;
}

const BudgetContext = createContext<BudgetContextType | undefined>(undefined);

export const BudgetProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [budgets, setBudgets] = useState<BudgetCategory[]>([]);
  const [income, setIncome] = useState<IncomeSource[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const { user } = useAuth();

  // Load data when user changes
  useEffect(() => {
    if (user) {
      loadData();
    } else {
      setBudgets([]);
      setIncome([]);
      setTransactions([]);
    }
  }, [user]);

  const loadData = async () => {
    if (!user) return;

    try {
      // Load transactions (most of the data is derived from here in this simplified version)
      const transactionData = await apiClient.get(`/transactions/${user.id}`);
      setTransactions(transactionData);

      // Note: In the new SQLite schema, we have separate tables for budgets and income
      // For now, I'll fetch them if I implement those endpoints, or keep placeholders
      // For this migration, I'll focus on transactions as they are the core.
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const addIncome = async (newIncome: Omit<IncomeSource, 'id'>) => {
    if (!user) {
      toast.error('Please sign in first');
      return;
    }

    try {
      await apiClient.post('/transactions/', {
        ...newIncome,
        user_id: user.id,
        transaction_type: 'income',
        description: `${newIncome.name} Credit`,
        transaction_date: newIncome.date,
      });

      toast.success('Income added successfully!');
      await loadData();
    } catch (error) {
      console.error('Error adding income:', error);
      toast.error('Failed to add income');
    }
  };

  const addBudget = async (newBudget: Omit<BudgetCategory, 'id' | 'spent'>) => {
    // Placeholder: Budget table exists but endpoint needs implementation
    // For now, let's just simulate or add a simple POST
    toast.info('Budget management will be fully enabled soon');
  };

  const processPayment = async (payment: { amount: number; description: string; category: string; merchant: string }) => {
    if (!user) {
      toast.error('Please sign in first');
      return;
    }

    try {
      await apiClient.post('/transactions/', {
        user_id: user.id,
        transaction_type: 'expense',
        amount: -payment.amount,
        category: payment.category,
        description: `${payment.merchant} - ${payment.description}`,
        transaction_date: new Date().toISOString().split('T')[0],
      });

      toast.success('Payment processed successfully!');
      await loadData();
    } catch (error) {
      console.error('Error processing payment:', error);
      toast.error('Failed to process payment');
    }
  };

  const getTotalBudget = () => {
    return budgets.reduce((sum, category) => sum + category.budget, 0);
  };

  const getTotalSpent = () => {
    return transactions
      .filter(transaction => transaction.amount < 0)
      .reduce((sum, transaction) => sum + Math.abs(transaction.amount), 0);
  };

  const getTotalIncome = () => {
    return transactions
      .filter(transaction => transaction.amount > 0)
      .reduce((sum, transaction) => sum + transaction.amount, 0);
  };

  const getCurrentBalance = () => {
    return getTotalIncome() - getTotalSpent();
  };

  const getBudgetUsagePercentage = () => {
    const totalBudget = getTotalBudget();
    const totalSpent = getTotalSpent();
    return totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;
  };

  const getSavingsPercentage = () => {
    const totalIncome = getTotalIncome();
    const totalSpent = getTotalSpent();
    const savings = totalIncome - totalSpent;
    return totalIncome > 0 ? Math.round((savings / totalIncome) * 100) : 0;
  };

  const refreshTransactions = async () => {
    await loadData();
  };

  const value: BudgetContextType = {
    budgets,
    income,
    transactions,
    setBudgets,
    addIncome,
    addBudget,
    processPayment,
    refreshTransactions,
    getTotalBudget,
    getTotalSpent,
    getTotalIncome,
    getCurrentBalance,
    getBudgetUsagePercentage,
    getSavingsPercentage
  };

  return (
    <BudgetContext.Provider value={value}>
      {children}
    </BudgetContext.Provider>
  );
};

export const useBudget = () => {
  const context = useContext(BudgetContext);
  if (context === undefined) {
    throw new Error('useBudget must be used within a BudgetProvider');
  }
  return context;
};
