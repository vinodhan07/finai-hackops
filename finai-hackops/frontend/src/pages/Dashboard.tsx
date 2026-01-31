
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
  Activity
} from "lucide-react";
import { useBudget } from "@/contexts/BudgetContext";
import { useState, useEffect } from "react";
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
  const { getCurrentBalance, getTotalSpent, getBudgetUsagePercentage, getSavingsPercentage } = useBudget();
  const { toast } = useToast();
  const { user } = useAuth();
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [upcomingBills, setUpcomingBills] = useState([]);
  const [cibilScore, setCibilScore] = useState<number | null>(null);
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

  // Fetch upcoming bills (Simplified or Mocked for now)
  const fetchUpcomingBills = async () => {
    // Placeholder - will implement reminder endpoints soon
    setUpcomingBills([]);
  };

  // Fetch CIBIL score (Simplified or Mocked for now)
  const fetchCibilScore = async () => {
    // Placeholder
    setCibilScore(null);
  };

  useEffect(() => {
    fetchUpcomingBills();
    fetchCibilScore();
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground">Welcome back! Here's your financial overview.</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Last updated</p>
            <p className="text-sm font-medium">2 minutes ago</p>
          </div>
        </div>

        {/* Key Metrics Cards */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 md:gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants}>
            <Card className="gradient-card shadow-card border-0 hover-scale cursor-default h-full">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-card-foreground">Current Balance</CardTitle>
                <DollarSign className="h-4 w-4 text-income" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-card-foreground">₹{currentBalance.toLocaleString()}</div>
                <div className="flex items-center text-xs text-income">
                  <ArrowUpRight className="w-3 h-3 mr-1" />
                  +12.5% from last month
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="gradient-card shadow-card border-0 hover-scale cursor-default h-full">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-card-foreground">Monthly Spent</CardTitle>
                <CreditCard className="h-4 w-4 text-expense" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-card-foreground">₹{monthlySpent.toLocaleString()}</div>
                <div className="flex items-center text-xs text-expense">
                  <ArrowDownRight className="w-3 h-3 mr-1" />
                  +8.2% from last month
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="gradient-card shadow-card border-0 hover-scale cursor-default h-full">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-card-foreground">Budget Used</CardTitle>
                <Target className="h-4 w-4 text-budget-warning" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-card-foreground">{budgetUsed}%</div>
                <div className="w-full bg-muted rounded-full h-2 mt-2 overflow-hidden">
                  <motion.div
                    className={`rounded-full h-2 ${budgetUsed > 100 ? 'bg-destructive' : 'bg-budget-warning'}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(budgetUsed, 100)}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  ></motion.div>
                </div>
                {budgetUsed > 100 && (
                  <p className="text-xs text-destructive mt-1 font-medium">
                    Over budget by {budgetUsed - 100}%
                  </p>
                )}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="gradient-card shadow-card border-0 hover-scale cursor-default h-full">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-card-foreground">Savings Progress</CardTitle>
                <TrendingUp className="h-4 w-4 text-savings" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-card-foreground">{savingsProgress}%</div>
                <div className="w-full bg-muted rounded-full h-2 mt-2 overflow-hidden">
                  <motion.div
                    className="bg-savings rounded-full h-2"
                    initial={{ width: 0 }}
                    animate={{ width: `${savingsProgress}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  ></motion.div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="gradient-card shadow-card border-0 hover-scale cursor-default h-full">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-card-foreground">CIBIL Score</CardTitle>
                <Activity className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-card-foreground">
                  {cibilScore ? cibilScore : "Not Set"}
                </div>
                <div className={`flex items-center text-xs ${cibilScore
                  ? cibilScore >= 750
                    ? 'text-income'
                    : cibilScore >= 650
                      ? 'text-budget-warning'
                      : 'text-expense'
                  : 'text-muted-foreground'
                  }`}>
                  {cibilScore ? (
                    <>
                      <Activity className="w-3 h-3 mr-1" />
                      {cibilScore >= 750 ? 'Excellent' : cibilScore >= 650 ? 'Good' : 'Needs Improvement'}
                    </>
                  ) : (
                    'Add in Profile'
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* FinPilot AI Assistant & Upcoming Bills */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div variants={itemVariants} className="lg:col-span-2">
            <Card className="gradient-card shadow-card border-0 h-full flex flex-col min-h-[500px]">
              <CardHeader>
                <CardTitle className="text-card-foreground flex items-center">
                  <Bot className="w-6 h-6 mr-2 text-primary" />
                  FinPilot – AI Financial Assistant
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col space-y-4">
                {/* Chat Messages */}
                <div className="flex-1 overflow-y-auto space-y-4 p-4 bg-muted/20 rounded-lg min-h-[300px]">
                  <AnimatePresence initial={false}>
                    {messages.map((msg, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'} mb-4`}
                      >
                        <div className={`flex max-w-[85%] ${msg.type === 'user' ? 'flex-row-reverse' : 'flex-row'} gap-3`}>
                          {msg.type === 'bot' && (
                            <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center flex-shrink-0">
                              <Bot className="w-4 h-4 text-primary-foreground" />
                            </div>
                          )}
                          <div className={`p-3 rounded-2xl shadow-sm ${msg.type === 'user'
                            ? 'bg-primary text-primary-foreground rounded-br-sm'
                            : 'bg-card text-card-foreground rounded-bl-sm border border-border/50'
                            }`}>
                            {msg.type === 'bot' ? (
                              <div className="prose prose-sm dark:prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-muted/50">
                                <ReactMarkdown>{msg.content}</ReactMarkdown>
                              </div>
                            ) : (
                              msg.content
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
            <Card className="gradient-card shadow-card border-0 h-full">
              <CardHeader>
                <CardTitle className="text-card-foreground flex items-center">
                  <Bell className="w-5 h-5 mr-2 text-budget-warning" />
                  Upcoming Bills
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
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
