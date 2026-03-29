
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
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 md:gap-6"
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

          <motion.div variants={itemVariants}>
            <Card className="bg-card shadow-card border border-border/50 hover-scale cursor-default h-full rounded-none">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs font-mono uppercase tracking-widest text-muted-foreground">CIBIL Score</CardTitle>
                <Activity className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl lg:text-3xl font-mono font-medium tracking-tight text-foreground">
                  {cibilScore ? cibilScore : "---"}
                </div>
                <div className={`flex items-center text-xs mt-2 ${cibilScore
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
