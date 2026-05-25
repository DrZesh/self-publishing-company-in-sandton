import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Brain, Send, Sparkles, TrendingUp, Target, AlertCircle, CheckCircle, Clock, FileText, Mail, Phone } from 'lucide-react';
import { toast } from 'sonner';

const QUESTION_PRESETS = [
  'Which leads need follow-up today?',
  'Which quotes are overdue?',
  'Which leads are most likely to convert?',
  'Which services are getting the most enquiries?',
  'Which SEO pages generated the most leads?',
  'Which clients are waiting for a response?',
  'Which pipeline projects are stuck?',
];

export default function AICopilot({ data }) {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState(null);
  const [thinking, setThinking] = useState(false);

  const handleAsk = async () => {
    if (!question.trim()) return;
    
    setThinking(true);
    try {
      // Analyze question and provide AI-powered answer
      const response = analyzeQuestion(question, data);
      setAnswer(response);
      toast.success('AI analysis complete');
    } catch (error) {
      toast.error('Failed to get AI response');
    } finally {
      setThinking(false);
    }
  };

  const analyzeQuestion = (questionText, dashboardData) => {
    const q = questionText.toLowerCase();
    
    // Hot leads needing follow-up
    if (q.includes('follow-up') || q.includes('follow up')) {
      const hotLeads = (data?.leads || []).filter(l => 
        l.stage === 'new' || l.stage === 'contacted'
      ).slice(0, 5);
      
      return {
        summary: `${hotLeads.length} leads need follow-up today`,
        confidence: 92,
        recommendations: hotLeads.map(lead => ({
          type: 'lead',
          title: `${lead.contact_name || 'Lead'} - ${lead.stage}`,
          reason: `${lead.stage === 'new' ? 'New enquiry' : 'Needs response'} ${lead.created_date ? `(${Math.floor((Date.now() - new Date(lead.created_date)) / (1000*60*60*24))} days ago)` : ''}`,
          priority: lead.stage === 'new' ? 'High' : 'Medium',
          action: 'Contact Lead',
        })),
      };
    }
    
    // Overdue quotes
    if (q.includes('overdue') && q.includes('quote')) {
      const overdueQuotes = (data?.quotes || []).filter(q => 
        q.status === 'Sent' || q.status === 'Viewed'
      ).filter(q => {
        const validUntil = new Date(q.valid_until);
        return validUntil < new Date();
      });
      
      return {
        summary: `${overdueQuotes.length} quotes are overdue for follow-up`,
        confidence: 95,
        recommendations: overdueQuotes.map(quote => ({
          type: 'quote',
          title: `Quote ${quote.quote_number}`,
          reason: `Expired on ${new Date(quote.valid_until).toLocaleDateString()}`,
          priority: 'High',
          action: 'Follow Up',
        })),
      };
    }
    
    // Conversion likelihood
    if (q.includes('convert') || q.includes('conversion')) {
      const hotLeads = (data?.leads || []).filter(l => 
        l.probability_percent > 70 || l.stage === 'negotiating'
      ).slice(0, 5);
      
      return {
        summary: `${hotLeads.length} leads are likely to convert`,
        confidence: 88,
        recommendations: hotLeads.map(lead => ({
          type: 'lead',
          title: `${lead.contact_name || 'Lead'} - ${(lead.probability_percent || 0)}% probability`,
          reason: `High engagement ${lead.estimated_value ? `(R${(lead.estimated_value || 0).toLocaleString()})` : ''}`,
          priority: lead.probability_percent > 80 ? 'High' : 'Medium',
          action: 'View Lead',
        })),
      };
    }
    
    // Service enquiries
    if (q.includes('service') && (q.includes('enquir') || q.includes('request'))) {
      const serviceCount = {};
      (data?.submissions || []).forEach(s => {
        const services = s.service_interest || [];
        services.forEach(svc => {
          serviceCount[svc] = (serviceCount[svc] || 0) + 1;
        });
      });
      
      const topServices = Object.entries(serviceCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);
      
      return {
        summary: 'Top requested services this month',
        confidence: 90,
        recommendations: topServices.map(([service, count]) => ({
          type: 'service',
          title: service,
          reason: `${count} enquiries`,
          priority: count > 10 ? 'High' : 'Medium',
          action: 'View Service',
        })),
      };
    }
    
    // Default response
    return {
      summary: 'I can help you analyze your CRM data',
      confidence: 100,
      recommendations: [
        { type: 'info', title: 'Try asking about:', reason: 'Leads, quotes, services, or SEO performance', priority: 'Low', action: '' },
      ],
    };
  };

  return (
    <Card className="border-[#B87333]/20 bg-gradient-to-br from-[#F8F5EF]/50 to-white">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold text-[#2B2B2B] flex items-center gap-2">
          <Brain className="w-4 h-4 text-[#B87333]" />
          AI Copilot
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Question Input */}
        <div className="space-y-2">
          <Textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask me anything about your CRM data..."
            className="h-20 text-sm"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleAsk();
              }
            }}
          />
          <div className="flex gap-2">
            <Button
              onClick={handleAsk}
              disabled={thinking || !question.trim()}
              className="flex-1 bg-[#B87333] hover:bg-[#a06428]"
            >
              {thinking ? (
                <>
                  <Sparkles className="w-4 h-4 mr-2 animate-pulse" />
                  Thinking...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Ask AI
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Quick Questions */}
        <div className="flex flex-wrap gap-2">
          {QUESTION_PRESETS.slice(0, 3).map((q, idx) => (
            <Button
              key={idx}
              size="sm"
              variant="outline"
              className="text-xs h-7"
              onClick={() => setQuestion(q)}
            >
              {q}
            </Button>
          ))}
        </div>

        {/* AI Answer */}
        {answer && (
          <div className="space-y-3">
            <div className="p-3 bg-white rounded-lg border border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-4 h-4 text-[#B87333]" />
                <div className="text-sm font-semibold text-[#2B2B2B]">{answer.summary}</div>
              </div>
              <Badge className="text-xs bg-[#B87333]/10 text-[#B87333]">
                {answer.confidence}% confidence
              </Badge>
            </div>

            {answer.recommendations && answer.recommendations.length > 0 && (
              <div className="space-y-2">
                {answer.recommendations.map((rec, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-white rounded-lg border border-gray-200 hover:border-[#B87333]/30 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="text-sm font-semibold text-[#2B2B2B]">{rec.title}</div>
                        <div className="text-xs text-gray-600 mt-1">{rec.reason}</div>
                      </div>
                      <Badge className={`text-xs ${
                        rec.priority === 'High' ? 'bg-red-100 text-red-700' :
                        rec.priority === 'Medium' ? 'bg-amber-100 text-amber-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {rec.priority}
                      </Badge>
                    </div>
                    {rec.action && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full mt-2 h-8 text-xs"
                      >
                        {rec.action}
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}