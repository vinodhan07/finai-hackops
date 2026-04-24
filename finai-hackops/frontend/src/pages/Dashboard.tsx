
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Layout } from "@/components/layout/Layout";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  CreditCard,
  Target,
  Bell,
  ArrowUpRight,
  ArrowDownRight,
  Send,
  Bot,
  Activity,
  Heart,
  CheckCircle,
  Clock,
  Plus
} from "lucide-react";
import { useBudget } from "@/contexts/BudgetContext";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiClient } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import ReactMarkdown from "react-markdown";
import { motion, AnimatePresence, Variants } from "framer-motion";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100
    }
  }
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { getCurrentBalance, getTotalSpent, getBudgetUsagePercentage, getSavingsPercentage } = useBudget();
  const { toast } = useToast();
  const { user } = useAuth();
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [upcomingBills, setUpcomingBills] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [spendingBreakdown, setSpendingBreakdown] = useState([]);
  const [messages, setMessages] = useState([
    {
      type: 'bot',
      content: "Hi! I'm FinPilot, your AI financial assistant. I can help you analyze your spending by category and time period. Try asking: 'What did I spend on food last month?' or 'Analyze my transportation expenses from January 1st to January 31st, 2025'."
    }
  ]);

  const currentBalance = getCurrentBalance();
  const monthlySpent = getTotalSpent();
  const budgetUsed = getBudgetUsagePercentage();
  const savingsProgress = getSavingsPercentage();

  // Health Score Logic
  const getHealthStatus = () => {
    if (budgetUsed <= 80) return { 
      status: 'Healthy', 
      color: 'text-income', 
      bgColor: 'bg-income',
      message: 'Your family health spending is within safe limits.',
      level: 'healthy'
    };
    if (budgetUsed <= 100) return { 
      status: 'Moderate', 
      color: 'text-warning', 
      bgColor: 'bg-warning',
      message: 'Your spending is approaching your budget limits. Be careful.',
      level: 'moderate'
    };
    return { 
      status: 'Critical', 
      color: 'text-destructive', 
      bgColor: 'bg-destructive',
      message: 'You have exceeded your family budget limits!',
      level: 'critical'
    };
  };

  const health = getHealthStatus();

  // Fetch upcoming bills (Simplified or Mocked for now)
  const fetchUpcomingBills = async () => {
    // Placeholder - will implement reminder endpoints soon
    setUpcomingBills([]);
  };

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    if (!user) return;
    try {
      const [recent, breakdown] = await Promise.all([
        apiClient.get(`/transactions/recent/${user.id}`),
        apiClient.get(`/transactions/breakdown/${user.id}`)
      ]);
      setRecentTransactions(recent);
      setSpendingBreakdown(breakdown);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    }
  };

  useEffect(() => {
    fetchUpcomingBills();
    fetchDashboardData();
  }, [user]);

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    const userMessage = message;
    setMessage("");
    setIsLoading(true);

    // Add user message immediately
    setMessages(prev => [...prev, { type: 'user', content: userMessage }]);

    try {
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to use the AI financial assistant.",
          variant: "destructive",
        });
        return;
      }

      // Call the local AI financial assistant API
      const data = await apiClient.post('/analysis/chat', {
        message: userMessage,
        user_id: user.id,
        session_id: 'default'
      });

      // Add AI response
      setMessages(prev => [...prev, {
        type: 'bot',
        content: data.response || "I apologize, but I couldn't process your request at the moment. Please try again."
      }]);

    } catch (error: any) {
      console.error('Error calling AI assistant:', error);

      setMessages(prev => [...prev, {
        type: 'bot',
        content: `I'm having trouble connecting to my AI services. Error: ${error.message}`
      }]);

      toast({
        title: "Error",
        description: "Failed to get AI response. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <Layout>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6 pb-20"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0">
          <div className="w-full sm:w-auto">
            <h1 className="text-3xl sm:text-4xl font-serif font-bold text-foreground tracking-tight">Dashboard</h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-1">Welcome back! Here's your financial overview.</p>
          </div>
          <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto bg-card sm:bg-transparent p-3 sm:p-0 rounded-xl sm:rounded-none border border-border/50 sm:border-none shadow-sm sm:shadow-none">
            <p className="text-[10px] sm:text-xs font-mono text-muted-foreground uppercase tracking-wider">Last updated</p>
            <p className="text-xs sm:text-sm font-mono font-medium">2 minutes ago</p>
          </div>
        </div>

        {/* Key Metrics Cards */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants}>
            <Card className="bg-card shadow-card border border-border/50 hover-scale cursor-default h-full rounded-none">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Current Balance</CardTitle>
                <DollarSign className="h-4 w-4 text-income" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl lg:text-3xl font-mono font-medium tracking-tight text-foreground">₹{currentBalance.toLocaleString()}</div>
                <div className="flex items-center text-xs text-income mt-2">
                  <ArrowUpRight className="w-3 h-3 mr-1" />
                  +12.5% from last month
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="bg-card shadow-card border border-border/50 hover-scale cursor-default h-full rounded-none">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Monthly Spent</CardTitle>
                <CreditCard className="h-4 w-4 text-expense" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl lg:text-3xl font-mono font-medium tracking-tight text-foreground">₹{monthlySpent.toLocaleString()}</div>
                <div className="flex items-center text-xs text-expense mt-2">
                  <ArrowDownRight className="w-3 h-3 mr-1" />
                  +8.2% from last month
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="bg-card shadow-card border border-border/50 hover-scale cursor-default h-full rounded-none">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Budget Used</CardTitle>
                <Target className="h-4 w-4 text-budget-warning" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl lg:text-3xl font-mono font-medium tracking-tight text-foreground">{budgetUsed}%</div>
                <div className="w-full bg-muted rounded-none h-1 mt-3 overflow-hidden">
                  <motion.div
                    className={`h-1 ${budgetUsed > 100 ? 'bg-destructive' : 'bg-budget-warning'}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(budgetUsed, 100)}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  ></motion.div>
                </div>
                {budgetUsed > 100 && (
                  <p className="text-xs text-destructive mt-2 font-mono">
                    Over budget by {budgetUsed - 100}%
                  </p>
                )}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="bg-card shadow-card border border-border/50 hover-scale cursor-default h-full rounded-none">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Savings Progress</CardTitle>
                <TrendingUp className="h-4 w-4 text-savings" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl lg:text-3xl font-mono font-medium tracking-tight text-foreground">{savingsProgress}%</div>
                <div className="w-full bg-muted rounded-none h-1 mt-3 overflow-hidden">
                  <motion.div
                    className="bg-savings h-1"
                    initial={{ width: 0 }}
                    animate={{ width: `${savingsProgress}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  ></motion.div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          </motion.div>

        {/* Spending Breakdown & Recent Transactions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Spending Breakdown */}
          <motion.div variants={itemVariants}>
            <Card className="bg-card shadow-card border border-border/50 rounded-none h-full">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b border-border/50">
                <CardTitle className="text-xl font-serif text-foreground flex items-center">
                  <Clock className="w-5 h-5 mr-3 text-primary" />
                  Spending Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 flex flex-col space-y-4">
                {spendingBreakdown.length === 0 ? (
                  <div className="py-10 flex flex-col items-center justify-center text-center space-y-4">
                    <p className="text-muted-foreground italic">No expenses recorded yet</p>
                    <Button 
                      onClick={() => navigate('/transactions')}
                      className="bg-[#0f172a] hover:bg-[#1e293b] text-white rounded-md px-6 shadow-sm"
                    >
                      Add Your First Expense
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                    {spendingBreakdown.map((item: any, i: number) => (
                      <div key={i} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium text-foreground capitalize">{item.category}</span>
                          <span className="font-mono text-muted-foreground">₹{item.total.toLocaleString()}</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min((item.total / (monthlySpent || 1)) * 100, 100)}%` }}
                            className="bg-primary h-full"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent Transactions */}
          <motion.div variants={itemVariants}>
            <Card className="bg-card shadow-card border border-border/50 rounded-none h-full">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b border-border/50">
                <CardTitle className="text-xl font-serif text-foreground">
                  Recent Transactions
                </CardTitle>
                <Button 
                  variant="link" 
                  onClick={() => navigate('/transactions')}
                  className="text-sm font-medium text-primary hover:no-underline p-0 flex items-center"
                >
                  View All
                </Button>
              </CardHeader>
              <CardContent className="pt-4">
                {recentTransactions.length === 0 ? (
                  <div className="py-16 flex flex-col items-center justify-center text-center">
                    <p className="text-muted-foreground italic">No transactions yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentTransactions.map((tx: any) => (
                      <div key={tx.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/20 hover:bg-muted/40 transition-colors border border-border/10">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${tx.transaction_type === 'income' ? 'bg-income/10 text-income' : 'bg-expense/10 text-expense'}`}>
                            {tx.transaction_type === 'income' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">{tx.description || tx.category}</p>
                            <p className="text-[10px] text-muted-foreground font-mono">{tx.transaction_date}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`text-sm font-bold ${tx.transaction_type === 'income' ? 'text-income' : 'text-expense'}`}>
                            {tx.transaction_type === 'income' ? '+' : '-'}₹{tx.amount.toLocaleString()}
                          </p>
                          <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{tx.category}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Family Health Score Section */}
        <motion.div variants={itemVariants}>
          <Card className="bg-card shadow-card border border-border/50 rounded-none overflow-hidden relative">
            <CardContent className="p-6">
              <div className="flex flex-col space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <Heart className="w-5 h-5 text-income fill-income/10" />
                  <h3 className="text-xl font-serif font-bold text-foreground">Family Health Score</h3>
                </div>
                
                <div className="flex items-start gap-4">
                  {/* Traffic Light Cluster */}
                  <div className="bg-muted/30 p-2 rounded-lg flex flex-col gap-1.5">
                    <div className={`w-4 h-4 rounded-full ${health.level === 'healthy' ? 'bg-income shadow-[0_0_8px_rgba(34,197,94,0.4)]' : 'bg-muted/40'}`}></div>
                    <div className={`w-4 h-4 rounded-full ${health.level === 'moderate' ? 'bg-warning shadow-[0_0_8px_rgba(234,179,8,0.4)]' : 'bg-muted/40'}`}></div>
                    <div className={`w-4 h-4 rounded-full ${health.level === 'critical' ? 'bg-destructive shadow-[0_0_8px_rgba(239,68,68,0.4)]' : 'bg-muted/40'}`}></div>
                  </div>

                  <div className="flex flex-col justify-center">
                    <div className="flex items-center gap-2">
                      {health.level === 'healthy' && <CheckCircle className="w-5 h-5 text-income" />}
                      <span className={`text-lg font-bold ${health.color}`}>{health.status}</span>
                    </div>
                    <p className="text-muted-foreground mt-1 text-sm md:text-base leading-relaxed">{health.message}</p>
                  </div>
                </div>
              </div>

              {/* Status Bar Legend */}
              <div className="mt-8 pt-6 border-t border-border/50 flex flex-wrap items-center justify-start gap-8">
                <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-muted-foreground">
                  <div className="w-2.5 h-2.5 rounded-full bg-income"></div> Healthy
                </div>
                <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-muted-foreground">
                  <div className="w-2.5 h-2.5 rounded-full bg-warning"></div> Moderate
                </div>
                <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-muted-foreground">
                  <div className="w-2.5 h-2.5 rounded-full bg-destructive"></div> Critical
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* FinPilot AI Assistant & Upcoming Bills */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          <motion.div variants={itemVariants} className="lg:col-span-2">
            <Card className="bg-card shadow-card border border-border/50 flex flex-col h-[65vh] md:h-[600px] min-h-[400px] md:min-h-[500px] rounded-none">
              <CardHeader className="border-b border-border/50 pb-4">
                <CardTitle className="text-xl font-serif text-foreground flex items-center">
                  <Bot className="w-5 h-5 mr-3 text-primary" />
                  FinPilot Intelligence
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col space-y-4">
                {/* Chat Messages */}
                <div className="flex-1 overflow-y-auto flex flex-col gap-4 p-3 sm:p-4 bg-muted/20 rounded-lg min-h-[250px] overflow-x-hidden">
                  <AnimatePresence initial={false}>
                    {messages.map((msg, index) => (
                      <motion.div
                        layout
                        key={index}
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className={`flex w-full ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`flex max-w-[85%] ${msg.type === 'user' ? 'flex-row-reverse' : 'flex-row'} gap-3`}>
                          {msg.type === 'bot' && (
                            <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center flex-shrink-0">
                              <Bot className="w-4 h-4 text-primary-foreground" />
                            </div>
                          )}
                          <div className={`p-3 rounded-2xl shadow-sm overflow-hidden ${msg.type === 'user'
                            ? 'bg-primary text-primary-foreground rounded-br-sm'
                            : 'bg-card text-card-foreground rounded-bl-sm border border-border/50'
                            }`}>
                            {msg.type === 'bot' ? (
                              <div className="prose prose-sm prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-muted/50 prose-headings:mt-0">
                                <ReactMarkdown>{msg.content}</ReactMarkdown>
                              </div>
                            ) : (
                              <div className="whitespace-pre-wrap break-words">{msg.content}</div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                {/* Input Section */}
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Ask about your finances, investments, or expenses…"
                      className="flex-1"
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={isLoading}
                      className="gradient-primary shadow-glow"
                      size="icon"
                    >
                      {isLoading ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground text-center">
                    Try: "What is my salary plan?" or "Analyze my spending patterns"
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants} className="lg:col-span-1">
            <Card className="bg-card shadow-card border border-border/50 h-full rounded-none">
              <CardHeader className="border-b border-border/50 pb-4">
                <CardTitle className="text-xl font-serif text-foreground flex items-center">
                  <Bell className="w-5 h-5 mr-3 text-primary" />
                  Upcoming Obligations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4 max-h-[400px] lg:max-h-none overflow-y-auto">
                {upcomingBills.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground italic">No upcoming bills found.</p>
                  </div>
                ) : (
                  upcomingBills.map((bill) => {
                    const today = new Date();
                    const due = new Date(bill.due_date);
                    const daysUntilDue = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

                    const getBgColor = () => {
                      if (daysUntilDue <= 3) return 'bg-warning-light/50';
                      return 'bg-muted/30';
                    };

                    const getTextColor = () => {
                      if (daysUntilDue <= 3) return 'text-warning';
                      return 'text-card-foreground';
                    };

                    return (
                      <div key={bill.id} className={`flex items-center justify-between p-4 rounded-xl ${getBgColor()} hover-scale`}>
                        <div className="space-y-1">
                          <p className="font-semibold text-card-foreground">{bill.title}</p>
                          <p className="text-xs text-muted-foreground italic">Due {bill.due_date}</p>
                        </div>
                        <div className="text-right">
                          <p className={`font-bold ${getTextColor()}`}>₹{bill.amount.toLocaleString()}</p>
                          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Due in {daysUntilDue} days</p>
                        </div>
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

      </motion.div>
    </Layout>
  );
};

export default Dashboard;
