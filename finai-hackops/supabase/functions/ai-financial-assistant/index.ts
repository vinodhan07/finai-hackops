import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, user_id } = await req.json();

    if (!message || !user_id) {
      throw new Error('Message and user_id are required');
    }

    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiApiKey) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';

    // Create client with Authorization header to respect RLS
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: { Authorization: req.headers.get('Authorization')! },
      },
    });

    // Get user's financial data
    const { data: transactions, error: transactionsError } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user_id)
      .order('date', { ascending: false });

    if (transactionsError) {
      console.error('Error fetching transactions:', transactionsError);
    }

    const { data: budgetCategories, error: budgetError } = await supabase
      .from('budget_categories')
      .select('*')
      .eq('user_id', user_id);

    if (budgetError) {
      console.error('Error fetching budget categories:', budgetError);
    }

    const { data: incomeData, error: incomeError } = await supabase
      .from('income_sources')
      .select('*')
      .eq('user_id', user_id);

    if (incomeError) {
      console.error('Error fetching income data:', incomeError);
    }

    // Prepare financial context for OpenAI
    const financialContext = {
      transactions: transactions || [],
      budgetCategories: budgetCategories || [],
      incomeData: incomeData || [],
      totalTransactions: transactions?.length || 0,
      totalBudgetCategories: budgetCategories?.length || 0
    };

    const systemPrompt = `You are FinPilot, an AI financial assistant specializing in personal finance analysis. Your task is to help users analyze their spending patterns and provide actionable financial advice.

IMPORTANT: When a user asks about spending analysis by category and time period, follow this structured approach:

1. FIRST, ask for specific details if not provided:
   - Start date of the period (format: YYYY-MM-DD)
   - End date of the period (format: YYYY-MM-DD) 
   - Specific category to analyze (if not mentioned)

2. THEN, analyze the provided financial data:
   - Filter transactions by the specified date range and category
   - Calculate total spent in that category during the period
   - Compare against budget (if available)
   - Identify spending patterns and trends

3. FINALLY, provide:
   - Clear summary with total amount spent
   - Budget comparison (if applicable)
   - Practical suggestions for budget management
   - Recommendations for financial tools or services
   - Tips for adjusting spending habits

Available financial data for analysis:
- Total transactions: ${financialContext.totalTransactions}
- Budget categories: ${financialContext.totalBudgetCategories}
- Transaction categories: ${[...new Set(transactions?.map((t: any) => t.category) || [])].join(', ')}

Current financial snapshot:
${JSON.stringify(financialContext, null, 2)}

Provide helpful, actionable advice based on the user's actual financial data. If asking for specific date ranges or categories, be conversational and helpful.`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `${systemPrompt}\n\nUser: ${message}`
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1000,
        }
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Gemini API error:', errorData);
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const assistantMessage = data.candidates?.[0]?.content?.parts?.[0]?.text || "I apologize, but I couldn't process your request at the moment.";

    return new Response(JSON.stringify({
      message: assistantMessage,
      financialSummary: {
        totalTransactions: financialContext.totalTransactions,
        availableCategories: [...new Set(transactions?.map((t: any) => t.category) || [])],
        budgetCategories: budgetCategories?.map((bc: any) => ({ name: bc.name, budget: bc.budget, spent: bc.spent })) || []
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in AI financial assistant:', error);
    return new Response(JSON.stringify({
      error: 'An error occurred while processing your request',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});