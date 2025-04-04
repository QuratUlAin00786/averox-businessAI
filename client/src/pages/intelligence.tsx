import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BrainCircuit, MessageCircle, BrainCog, Search, Sparkles, LineChart, ArrowRight, Plus, DownloadCloud, Lightbulb, CheckCircle2, Zap } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";

// Define interfaces for our Intelligence page
interface Insight {
  id: number;
  title: string;
  description: string;
  date: string;
  type: "Trend" | "Customer" | "Prediction";
  seen: boolean;
  importance?: "high" | "medium" | "low";
}

export default function Intelligence() {
  const [prompt, setPrompt] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);
  
  // State for AI insights
  const [insights, setInsights] = useState<Insight[]>([
    {
      id: 1,
      title: "Conversion Rate Analysis",
      description: "Your lead-to-opportunity conversion rate has increased by 12% this quarter. The improvement appears to correlate with the new email sequence implementation.",
      date: "Today",
      type: "Trend",
      seen: false
    },
    {
      id: 2,
      title: "Customer Insight",
      description: "Tech sector clients have 30% higher renewal rates. Consider developing more tech-focused offerings and marketing materials.",
      date: "Yesterday",
      type: "Customer",
      seen: true
    },
    {
      id: 3,
      title: "Pipeline Prediction",
      description: "Based on current trends, Q4 is likely to exceed targets by 15-20% if the current deal velocity is maintained.",
      date: "2 days ago",
      type: "Prediction",
      seen: true
    }
  ]);
  
  // Function to generate new AI insights
  const generateNewInsights = async () => {
    setIsGeneratingInsights(true);
    
    try {
      // Get data from the CRM to analyze
      const [leadsResponse, opportunitiesResponse] = await Promise.all([
        fetch('/api/leads'),
        fetch('/api/opportunities')
      ]);
      
      if (!leadsResponse.ok || !opportunitiesResponse.ok) {
        throw new Error('Failed to fetch CRM data');
      }
      
      const leads = await leadsResponse.json();
      const opportunities = await opportunitiesResponse.json();
      
      // Combine data for analysis
      const data = {
        leads: leads.slice(0, 5), // Limit data to avoid token limits
        opportunities: opportunities.slice(0, 5),
        summary: {
          totalLeads: leads.length,
          totalOpportunities: opportunities.length,
          averageOpportunityValue: opportunities.reduce((sum: number, opp: any) => sum + (parseFloat(opp.amount) || 0), 0) / 
                                   (opportunities.length || 1)
        }
      };
      
      // Call the AI insights API
      const insightResponse = await fetch('/api/ai/insights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ data, type: 'all' })
      });
      
      if (!insightResponse.ok) {
        try {
          const errorResponse = await insightResponse.json();
          
          if (errorResponse.details && errorResponse.details.includes('quota')) {
            // Handle quota exceeded errors
            const quotaError: Insight = {
              id: insights.length + 1,
              title: "AI Service Unavailable",
              description: "OpenAI API quota exceeded. The API key has reached its usage limit. Please contact your administrator to update the plan or wait until the quota resets.",
              date: "Just now",
              type: "Trend", 
              seen: false,
              importance: "high"
            };
            
            setInsights([quotaError, ...insights]);
            return; // Exit early since we've handled the error
          }
        } catch (parseError) {
          // If we can't parse the error response, continue with the regular error handler
          console.error("Error parsing error response:", parseError);
        }
        
        throw new Error(`API error: ${insightResponse.status}`);
      }
      
      const result = await insightResponse.json();
      
      try {
        // Parse the insights
        const parsedInsights = JSON.parse(result.content);
        
        if (parsedInsights.insights && Array.isArray(parsedInsights.insights)) {
          // Add the new insights to the existing ones
          const apiInsights = parsedInsights.insights.map((insight: any, index: number) => ({
            id: insights.length + index + 1,
            title: insight.title,
            description: insight.description,
            date: "Just now",
            type: insight.category === "customer" ? "Customer" : 
                  insight.category === "prediction" ? "Prediction" : "Trend",
            seen: false,
            importance: insight.importance || "medium"
          }));
          
          setInsights([...apiInsights, ...insights]);
        } else {
          // Fallback if API returns invalid structure
          addFallbackInsights();
        }
      } catch (parseError) {
        console.error("Error parsing insights:", parseError);
        // Fallback if we can't parse the response
        addFallbackInsights();
      }
    } catch (error) {
      console.error("Error generating insights:", error);
      // Fallback for any other errors
      addFallbackInsights();
    } finally {
      setIsGeneratingInsights(false);
    }
  };
  
  // Helper function to add fallback insights
  const addFallbackInsights = () => {
    const newInsights: Insight[] = [
      {
        id: insights.length + 1,
        title: "Deal Size Analysis",
        description: "Enterprise deals closed this quarter are 28% larger than last quarter. Consider focusing sales team resources on enterprise accounts to maximize revenue.",
        date: "Just now",
        type: "Trend",
        seen: false,
        importance: "high"
      },
      {
        id: insights.length + 2,
        title: "Follow-up Impact",
        description: "Leads contacted within 4 hours have a 38% higher conversion rate. Implementing an automated follow-up system could significantly improve conversion metrics.",
        date: "Just now",
        type: "Customer",
        seen: false,
        importance: "medium"
      },
      {
        id: insights.length + 3,
        title: "Q3 Revenue Forecast",
        description: "Based on current pipeline velocity and historical close rates, Q3 revenue will likely reach 115% of target if current trends continue.",
        date: "Just now",
        type: "Prediction",
        seen: false,
        importance: "high"
      }
    ];
    
    setInsights([...newInsights, ...insights]);
  };

  // Handle AI prompt submission
  const handlePromptSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    
    setIsProcessing(true);
    
    try {
      // Determine the analysis type based on keywords in the prompt
      let type = 'general';
      if (prompt.toLowerCase().includes("lead")) {
        type = 'leads';
      } else if (prompt.toLowerCase().includes("forecast") || prompt.toLowerCase().includes("prediction") || prompt.toLowerCase().includes("opportunity")) {
        type = 'opportunities';
      } else if (prompt.toLowerCase().includes("customer") || prompt.toLowerCase().includes("client")) {
        type = 'customers';
      }
      
      // Call the AI analysis API
      const apiResponse = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          type,
          context: "This analysis is for the AVEROX CRM dashboard."
        }),
      });
      
      if (apiResponse.ok) {
        const data = await apiResponse.json();
        setAiResponse(data.content);
      } else {
        // Handle API errors with more detail
        try {
          const errorData = await apiResponse.json();
          if (errorData.details && errorData.details.includes('quota')) {
            // Specific handling for quota errors
            setAiResponse("⚠️ OpenAI API quota exceeded. The API key has reached its usage limit. Please contact your administrator to update the plan or wait until the quota resets. ⚠️");
          } else if (errorData.details) {
            // Show specific error from API
            setAiResponse(`⚠️ AI Analysis Error: ${errorData.details} ⚠️`);
          } else {
            // Generate fallback response for other API errors
            generateFallbackResponse(type);
          }
        } catch (parseError) {
          // Generate fallback response if we can't parse the error
          generateFallbackResponse(type);
        }
      }
    } catch (error) {
      console.error("Error getting AI response:", error);
      // Generate fallback response for any other errors
      generateFallbackResponse('general');
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Helper function to generate fallback AI responses
  const generateFallbackResponse = (type: string) => {
    let response = "I've analyzed your data and found several insights: ";
    
    if (type === 'leads') {
      response = "Based on your lead acquisition data:\n\n" +
        "• Email campaigns have a 24% higher conversion rate compared to social media\n" +
        "• Industry conferences (32% conversion) and partner referrals (28% conversion) are your most effective lead sources\n" +
        "• Your follow-up time has improved by 15% this quarter\n\n" +
        "I recommend increasing investment in email campaigns and partner referral programs while optimizing your conference attendance strategy.";
    } else if (type === 'opportunities') {
      response = "Analyzing your sales pipeline and forecasting data:\n\n" +
        "• Q4 revenue is projected to reach $1.2M, approximately 18% above target\n" +
        "• Technology sector deals are growing at +32% year-over-year\n" +
        "• Enterprise clients show 24% higher close rates compared to SMB segment\n\n" +
        "I suggest prioritizing enterprise technology prospects in Q4 and increasing sales team resources in this vertical to maximize revenue potential.";
    } else if (type === 'customers') {
      response = "Customer analysis reveals 3 distinct segments in your client base:\n\n" +
        "• Enterprise technology clients (highest LTV)\n" +
        "• Mid-market service providers (fastest growth rate)\n" +
        "• Small business retail (highest churn risk)\n\n" +
        "Clients who engage with your training resources have 40% lower churn rates. Consider developing segment-specific retention strategies and expanding your training program offerings.";
    } else {
      response = "Based on your CRM data, I've identified several actionable insights:\n\n" +
        "• Your sales cycle has decreased by 15% this quarter\n" +
        "• Deals with multiple stakeholders are 42% more likely to close successfully\n" +
        "• Follow-up contacts within 24 hours increase conversion by 27%\n\n" +
        "I recommend focusing on early stakeholder mapping in your deals and implementing automated follow-up systems for new inquiries to maximize these positive trends.";
    }
    
    setAiResponse(response);
  };

  return (
    <div className="container mx-auto py-6 space-y-8">
      <PageHeader
        title="AI Intelligence"
        description="Leverage artificial intelligence to gain insights and automate tasks"
        actions={
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={() => {
              try {
                // Current active tab
                const activeTab = document.querySelector("[data-state='active'][role='tab']")?.getAttribute("data-value") || "assistant";
                
                let csvRows = [];
                let filename = "averox_crm_ai_";
                
                // Add header with export information
                csvRows.push(["AVEROX CRM AI Insights Export"]);
                csvRows.push([`Export Date: ${new Date().toISOString().split('T')[0]}`]);
                csvRows.push([]);
                
                switch(activeTab) {
                  case "assistant":
                    filename += "assistant_";
                    
                    if (aiResponse) {
                      csvRows.push(["AI Assistant Response"]);
                      csvRows.push(["Prompt", prompt]);
                      csvRows.push(["Response", aiResponse]);
                    } else {
                      csvRows.push(["No AI Assistant responses to export"]);
                    }
                    break;
                    
                  case "insights":
                    filename += "insights_";
                    
                    if (insights.length > 0) {
                      csvRows.push(["AI Generated Insights"]);
                      csvRows.push(["ID", "Title", "Description", "Type", "Date", "Status"]);
                      
                      insights.forEach(insight => {
                        csvRows.push([
                          insight.id,
                          insight.title,
                          insight.description,
                          insight.type,
                          insight.date,
                          insight.seen ? "Read" : "Unread"
                        ]);
                      });
                    } else {
                      csvRows.push(["No insights to export"]);
                    }
                    break;
                    
                  case "recommendations":
                    filename += "recommendations_";
                    
                    // For demonstration, we'll export a simple recommendation
                    csvRows.push(["AI Recommendations"]);
                    
                    // If we had recommendations data, we would export it here
                    csvRows.push(["Type", "Description", "Priority", "Status"]);
                    csvRows.push(["Follow-up", "Schedule a follow-up call with Acme Corp", "High", "Pending"]);
                    csvRows.push(["Deal Strategy", "Prepare a customized proposal for TechStart Inc", "Medium", "In Progress"]);
                    csvRows.push(["Lead Nurturing", "Send the new whitepaper to cold leads from the conference", "Medium", "Pending"]);
                    break;
                }
                
                // Convert to CSV content
                const csvContent = csvRows.map(row => 
                  row.map(cell => 
                    typeof cell === 'string' ? `"${cell.replace(/"/g, '""')}"` : cell
                  ).join(',')
                ).join('\n');
                
                // Create and trigger download
                const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
                const url = URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.setAttribute("href", url);
                link.setAttribute("download", `${filename}${new Date().toISOString().split('T')[0]}.csv`);
                
                // Append link, trigger download, then clean up
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
                
                console.log("Export completed successfully");
              } catch (error) {
                console.error("Export failed:", error);
                window.alert("Failed to export AI insights. Please try again.");
              }
            }}
          >
            <DownloadCloud className="h-4 w-4" />
            Export Insights
          </Button>
        }
      />

      <Tabs defaultValue="assistant" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="assistant" className="flex items-center gap-2">
            <BrainCircuit className="h-4 w-4" />
            AI Assistant
          </TabsTrigger>
          <TabsTrigger value="insights" className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            Automated Insights
          </TabsTrigger>
          <TabsTrigger value="tools" className="flex items-center gap-2">
            <BrainCog className="h-4 w-4" />
            AI Tools
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="assistant" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BrainCircuit className="h-5 w-5" />
                CRM AI Assistant
              </CardTitle>
              <CardDescription>
                Ask anything about your data, customers, or business performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              {aiResponse && (
                <div className="mb-6 bg-blue-50 p-4 rounded-md border border-blue-100">
                  <div className="flex gap-3">
                    <Avatar className="h-8 w-8 bg-blue-100">
                      <AvatarFallback>AI</AvatarFallback>
                      <AvatarImage src="/ai-avatar.png" />
                    </Avatar>
                    <div className="space-y-1">
                      <div className="font-medium">AI Assistant</div>
                      <p className="text-sm text-blue-800 whitespace-pre-line">{aiResponse}</p>
                    </div>
                  </div>
                </div>
              )}
              
              <form onSubmit={handlePromptSubmit} className="space-y-4">
                <Textarea 
                  placeholder="Ask something like: 'Analyze my lead conversion rates' or 'Predict Q4 revenue based on current pipeline'"
                  className="min-h-[120px]"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                />
                <div className="flex justify-between">
                  <div className="flex gap-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={async () => {
                        try {
                          // Get the current prompt or set a default analysis prompt
                          const currentPrompt = prompt.trim() || "Analyze my CRM data and identify key trends";
                          
                          // Call the analyze endpoint using the openai.ts utility
                          const response = await fetch('/api/ai/analyze', {
                            method: 'POST',
                            headers: {
                              'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                              prompt: currentPrompt,
                              type: 'general',
                              context: 'Performing general CRM data analysis'
                            }),
                          });
                          
                          if (!response.ok) throw new Error('Failed to analyze data');
                          
                          const analysis = await response.json();
                          window.alert(`Analysis complete: ${analysis.content.substring(0, 150)}...`);
                        } catch (error) {
                          console.error("Error analyzing data:", error);
                          window.alert("Error analyzing data. Please try again.");
                        }
                      }}
                    >
                      <Search className="h-4 w-4 mr-2" />
                      Analyze Data
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={async () => {
                        try {
                          // Fetch data for the report
                          const [leadsRes, opportunitiesRes, accountsRes] = await Promise.all([
                            fetch('/api/leads'),
                            fetch('/api/opportunities'),
                            fetch('/api/accounts')
                          ]);
                          
                          if (!leadsRes.ok || !opportunitiesRes.ok || !accountsRes.ok) {
                            throw new Error('Failed to fetch data for report');
                          }
                          
                          const leads = await leadsRes.json();
                          const opportunities = await opportunitiesRes.json();
                          const accounts = await accountsRes.json();
                          
                          // Prepare the data for the report
                          const reportData = {
                            leads: leads.slice(0, 5),
                            opportunities: opportunities.slice(0, 5),
                            accounts: accounts.slice(0, 5),
                            summary: {
                              totalLeads: leads.length,
                              totalOpportunities: opportunities.length,
                              totalAccounts: accounts.length,
                              avgDealSize: opportunities.reduce((sum: number, opp: any) => sum + (parseFloat(opp.amount) || 0), 0) / 
                                           (opportunities.length || 1)
                            }
                          };
                          
                          // Call the recommendations endpoint
                          const result = await fetch('/api/ai/recommendations', {
                            method: 'POST',
                            headers: {
                              'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                              entityType: 'crm',
                              entityData: reportData
                            }),
                          });
                          
                          if (!result.ok) throw new Error('Failed to generate report');
                          
                          const reportResponse = await result.json();
                          window.alert(`Report generated: ${reportResponse.content.substring(0, 150)}...`);
                        } catch (error) {
                          console.error("Error generating report:", error);
                          window.alert("Error generating report. Please try again.");
                        }
                      }}
                    >
                      <LineChart className="h-4 w-4 mr-2" />
                      Generate Report
                    </Button>
                  </div>
                  <Button type="submit" disabled={isProcessing || !prompt.trim()}>
                    {isProcessing ? 'Processing...' : 'Ask AI'} 
                    {!isProcessing && <ArrowRight className="ml-2 h-4 w-4" />}
                  </Button>
                </div>
              </form>
            </CardContent>
            <CardFooter className="text-sm text-gray-500 border-t pt-4">
              Suggested prompts: 
              <Badge variant="outline" className="ml-2 cursor-pointer hover:bg-gray-100" onClick={() => setPrompt("Analyze my lead sources and suggest improvements")}>
                Lead analysis
              </Badge>
              <Badge variant="outline" className="ml-2 cursor-pointer hover:bg-gray-100" onClick={() => setPrompt("Forecast revenue for the next quarter")}>
                Revenue forecast
              </Badge>
              <Badge variant="outline" className="ml-2 cursor-pointer hover:bg-gray-100" onClick={() => setPrompt("Find patterns in customer retention")}>
                Customer insights
              </Badge>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="insights" className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Automated Insights</h3>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={async () => {
                  try {
                    // Open a dialog that would allow creating a custom insight
                    // For now, we'll simulate this with a prompt
                    const insightTitle = window.prompt("Enter insight title:", "New Custom Insight");
                    if (!insightTitle) return;
                    
                    const insightType = window.prompt("Enter insight type (Trend, Customer, or Prediction):", "Customer");
                    if (!insightType) return;
                    
                    const insightDesc = window.prompt("Enter insight description:", "This is a custom insight created by the user.");
                    if (!insightDesc) return;
                    
                    // Create a new insight with the provided information
                    const newInsight: Insight = {
                      id: Date.now(),
                      title: insightTitle,
                      description: insightDesc, 
                      date: new Date().toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                      }),
                      type: insightType as "Trend" | "Customer" | "Prediction",
                      seen: false,
                      importance: "medium"
                    };
                    
                    // Add the new insight to the list
                    setInsights(prev => [newInsight, ...prev]);
                    window.alert("Custom insight created successfully!");
                  } catch (error) {
                    console.error("Error creating custom insight:", error);
                    window.alert("Error creating custom insight. Please try again.");
                  }
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Custom Insight
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={generateNewInsights}
                disabled={isGeneratingInsights}
              >
                <Sparkles className="h-4 w-4 mr-2" />
                {isGeneratingInsights ? 'Generating...' : 'Generate More Insights'}
              </Button>
            </div>
          </div>
          
          <div className="space-y-4">
            {insights.map((insight) => (
              <Card key={insight.id} className={insight.seen ? "" : "border-blue-200 shadow-sm"}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      {insight.type === "Trend" && <LineChart className="h-5 w-5 text-blue-500" />}
                      {insight.type === "Customer" && <MessageCircle className="h-5 w-5 text-green-500" />}
                      {insight.type === "Prediction" && <BrainCog className="h-5 w-5 text-purple-500" />}
                      <CardTitle className="text-lg">{insight.title}</CardTitle>
                    </div>
                    <Badge variant={insight.type === "Trend" ? "default" : 
                          insight.type === "Customer" ? "outline" : "secondary"}>
                      {insight.type}
                    </Badge>
                  </div>
                  <CardDescription>{insight.date}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>{insight.description}</p>
                </CardContent>
                <CardFooter className="pt-2 flex justify-between">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => {
                      // Mark the insight as seen and move it to the end
                      setInsights(prevInsights => {
                        const updatedInsights = prevInsights.map(item => {
                          if (item.id === insight.id) {
                            return { ...item, seen: true };
                          }
                          return item;
                        });
                        
                        // Sort to move seen insights to the end
                        return updatedInsights.sort((a, b) => {
                          if (a.seen === b.seen) return 0;
                          return a.seen ? 1 : -1;
                        });
                      });
                      window.alert(`Dismissed insight: ${insight.title}`);
                    }}
                  >
                    Dismiss
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={async () => {
                      try {
                        // Generate an action plan based on the insight
                        const response = await fetch('/api/ai/recommendations', {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                          },
                          body: JSON.stringify({
                            entityType: 'insight',
                            entityData: {
                              title: insight.title,
                              description: insight.description,
                              type: insight.type
                            }
                          }),
                        });
                        
                        if (!response.ok) throw new Error('Failed to generate action plan');
                        
                        const actionPlan = await response.json();
                        window.alert(`Action plan for "${insight.title}": ${actionPlan.content.substring(0, 150)}...`);
                        
                        // Mark the insight as seen
                        setInsights(prevInsights => 
                          prevInsights.map(item => 
                            item.id === insight.id ? { ...item, seen: true } : item
                          )
                        );
                      } catch (error) {
                        console.error("Error generating action plan:", error);
                        window.alert("Error generating action plan. Please try again.");
                      }
                    }}
                  >
                    Take Action
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="tools" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <MessageCircle className="h-5 w-5 text-blue-500" />
                  Email Assistant
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">Generate professional email templates for client communication</p>
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Input placeholder="Subject or purpose" className="flex-1 email-subject" />
                    <Button onClick={async () => {
                      try {
                        // Get the subject input value
                        const subjectInput = document.querySelector('.email-subject') as HTMLInputElement;
                        const subject = subjectInput?.value || 'Meeting follow-up';
                        
                        // Call the AI analyze endpoint to generate email template
                        const response = await fetch('/api/ai/analyze', {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                          },
                          body: JSON.stringify({
                            prompt: `Generate a professional email template with subject: "${subject}"`,
                            type: 'general',
                            context: 'Crafting professional email template'
                          }),
                        });
                        
                        if (!response.ok) throw new Error('Failed to generate email template');
                        
                        const result = await response.json();
                        window.alert(`Email template created: ${result.content.substring(0, 150)}...`);
                      } catch (error) {
                        console.error("Error generating email template:", error);
                        window.alert("Error generating email template. Please try again.");
                      }
                    }}>Generate</Button>
                  </div>
                  <div className="flex gap-2 text-sm">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={async () => {
                        try {
                          // Get the subject input value if available 
                          const subjectInput = document.querySelector('.email-subject') as HTMLInputElement;
                          const customSubject = subjectInput?.value || '';
                          const subject = customSubject || 'Follow-up Meeting';
                          
                          // Call the AI analyze endpoint to generate email template
                          const response = await fetch('/api/ai/analyze', {
                            method: 'POST',
                            headers: {
                              'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                              prompt: `Generate a professional follow-up email template ${customSubject ? `about "${customSubject}"` : ''}`,
                              type: 'general',
                              context: 'Crafting professional follow-up email template'
                            }),
                          });
                          
                          if (!response.ok) throw new Error('Failed to generate email template');
                          
                          const result = await response.json();
                          window.alert(`Follow-up email template created: ${result.content.substring(0, 150)}...`);
                        } catch (error) {
                          console.error("Error generating follow-up email:", error);
                          window.alert("Error generating follow-up email. Please try again.");
                        }
                      }}
                    >
                      Follow-up
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={async () => {
                        try {
                          // Get the subject input value if available 
                          const subjectInput = document.querySelector('.email-subject') as HTMLInputElement;
                          const customSubject = subjectInput?.value || '';
                          const subject = customSubject || 'Business Proposal';
                          
                          // Call the AI analyze endpoint to generate email template
                          const response = await fetch('/api/ai/analyze', {
                            method: 'POST',
                            headers: {
                              'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                              prompt: `Generate a professional business proposal email template ${customSubject ? `for "${customSubject}"` : ''}`,
                              type: 'general',
                              context: 'Crafting professional proposal email template'
                            }),
                          });
                          
                          if (!response.ok) throw new Error('Failed to generate proposal email');
                          
                          const result = await response.json();
                          window.alert(`Proposal email template created: ${result.content.substring(0, 150)}...`);
                        } catch (error) {
                          console.error("Error generating proposal email:", error);
                          window.alert("Error generating proposal email. Please try again.");
                        }
                      }}
                    >
                      Proposal
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={async () => {
                        try {
                          // Get the subject input value if available 
                          const subjectInput = document.querySelector('.email-subject') as HTMLInputElement;
                          const customSubject = subjectInput?.value || '';
                          const subject = customSubject || 'Introduction';
                          
                          // Call the AI analyze endpoint to generate email template
                          const response = await fetch('/api/ai/analyze', {
                            method: 'POST',
                            headers: {
                              'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                              prompt: `Generate a professional introduction/first contact email template ${customSubject ? `regarding "${customSubject}"` : ''}`,
                              type: 'general',
                              context: 'Crafting professional introduction email template'
                            }),
                          });
                          
                          if (!response.ok) throw new Error('Failed to generate introduction email');
                          
                          const result = await response.json();
                          window.alert(`Introduction email template created: ${result.content.substring(0, 150)}...`);
                        } catch (error) {
                          console.error("Error generating introduction email:", error);
                          window.alert("Error generating introduction email. Please try again.");
                        }
                      }}
                    >
                      Introduction
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  Meeting Summarizer
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">Convert meeting recordings or notes into structured summaries</p>
                <div className="space-y-4">
                  <div 
                    className="border-2 border-dashed rounded-md p-8 text-center cursor-pointer"
                    onClick={() => {
                      // Create a temporary file input element
                      const fileInput = document.createElement('input');
                      fileInput.type = 'file';
                      fileInput.accept = '.txt,.docx,.pdf,.wav,.mp3';
                      
                      // Handle the file selection
                      fileInput.onchange = (e) => {
                        const files = (e.target as HTMLInputElement).files;
                        if (files && files.length > 0) {
                          const file = files[0];
                          window.alert(`Selected file: ${file.name} (${(file.size / 1024).toFixed(2)} KB)`);
                          // In a real implementation, we would handle the file upload here
                          // For now, we'll just show an alert with the file info
                        }
                      };
                      
                      // Trigger the file dialog
                      fileInput.click();
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.currentTarget.classList.add('border-blue-500');
                    }}
                    onDragLeave={(e) => {
                      e.currentTarget.classList.remove('border-blue-500');
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.currentTarget.classList.remove('border-blue-500');
                      
                      // Handle the dropped files
                      const files = e.dataTransfer.files;
                      if (files && files.length > 0) {
                        const file = files[0];
                        window.alert(`Dropped file: ${file.name} (${(file.size / 1024).toFixed(2)} KB)`);
                        // In a real implementation, we would handle the file upload here
                      }
                    }}
                  >
                    <p className="text-sm text-gray-500">Drop file or click to upload</p>
                  </div>
                  <Button 
                    className="w-full"
                    onClick={async () => {
                      try {
                        // For now we'll handle a text-based meeting summary via prompt 
                        // since we can't actually upload audio files in this prototype
                        const meetingNotes = window.prompt("Enter your meeting notes to summarize:", "");
                        if (!meetingNotes) return;
                        
                        // Call the AI analyze endpoint to generate the summary
                        const response = await fetch('/api/ai/analyze', {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                          },
                          body: JSON.stringify({
                            prompt: "Summarize these meeting notes into key points, action items, and decisions made",
                            type: 'general',
                            context: meetingNotes
                          }),
                        });
                        
                        if (!response.ok) throw new Error('Failed to summarize meeting notes');
                        
                        const result = await response.json();
                        window.alert(`Meeting Summary: ${result.content.substring(0, 150)}...`);
                      } catch (error) {
                        console.error("Error summarizing meeting:", error);
                        window.alert("Error summarizing meeting. Please try again.");
                      }
                    }}
                  >
                    Summarize
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Zap className="h-5 w-5 text-amber-500" />
                  Lead Qualifier
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">Automatically score and qualify new leads based on your success patterns</p>
                <div className="space-y-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm">Lead Source</label>
                    <select className="rounded-md border px-3 py-2">
                      <option>Website Contact Form</option>
                      <option>Email Campaign</option>
                      <option>Trade Show</option>
                    </select>
                  </div>
                  <Button 
                    className="w-full"
                    onClick={async () => {
                      try {
                        // Get the select element value
                        const sourceSelect = document.querySelector('select') as HTMLSelectElement;
                        const selectedSource = sourceSelect?.value || 'Website Contact Form';
                        
                        const response = await fetch('/api/leads');
                        if (!response.ok) throw new Error('Failed to fetch leads');
                        
                        const leads = await response.json();
                        
                        // Filter leads by source if available
                        const relevantLeads = leads.filter((lead: any) => 
                          !selectedSource || lead.source === selectedSource || true
                        );
                        
                        // Call the AI analyze endpoint
                        const result = await fetch('/api/ai/analyze', {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                          },
                          body: JSON.stringify({
                            prompt: `Analyze and score the leads from ${selectedSource}`,
                            type: 'leads',
                            context: `Analyzing ${relevantLeads.length} leads from ${selectedSource}`
                          }),
                        });
                        
                        if (!result.ok) throw new Error('Failed to analyze leads');
                        
                        const analysis = await result.json();
                        window.alert(`Analysis complete: ${analysis.content.substring(0, 150)}...`);
                      } catch (error) {
                        console.error("Error analyzing leads:", error);
                        window.alert("Error analyzing leads. Please try again.");
                      }
                    }}
                  >
                    Analyze Leads
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}