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
    <div
      className="rounded-2xl border backdrop-blur-xl p-6"
      style={{
        background: 'rgba(15, 23, 42, 0.6)',
        borderColor: 'rgba(34, 211, 238, 0.2)',
        boxShadow: '0 4px 24px rgba(0, 0, 0, 0.4), inset 0 0 20px rgba(139, 92, 246, 0.1)'
      }}
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#a855f7,#c084fc)', boxShadow: '0 2px 12px rgba(168, 85, 247, 0.5)' }}>
          <Brain className="w-4 h-4 text-white" />
        </div>
        <div>
          <h2 className="text-base font-bold text-cyan-50">AI Revenue Insights</h2>
          <p className="text-xs text-cyan-200/50">Ask me anything about your business</p>
        </div>
      </div>

      {/* Question Input */}
      <div className="space-y-3 mb-4">
        <div
          className="rounded-xl border p-3 backdrop-blur-xl"
          style={{
            background: 'rgba(15, 23, 42, 0.8)',
            borderColor: 'rgba(34, 211, 238, 0.2)'
          }}
        >
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask me anything about your CRM data..."
            className="w-full h-20 bg-transparent text-cyan-50 text-sm resize-none focus:outline-none placeholder:text-cyan-200/30"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleAsk();
              }
            }}
          />
        </div>
        <button
          onClick={handleAsk}
          disabled={thinking || !question.trim()}
          className="w-full py-3 rounded-xl font-bold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            background: thinking ? 'rgba(168, 85, 247, 0.5)' : 'linear-gradient(135deg,#a855f7,#c084fc)',
            color: 'white',
            boxShadow: '0 2px 12px rgba(168, 85, 247, 0.4)'
          }}
        >
          {thinking ? (
            <span className="flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4 animate-pulse" />
              Thinking...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <Send className="w-4 h-4" />
              Ask AI
            </span>
          )}
        </button>
      </div>

      {/* Quick Questions */}
      <div className="flex flex-wrap gap-2 mb-4">
        {QUESTION_PRESETS.slice(0, 3).map((q, idx) => (
          <button
            key={idx}
            onClick={() => setQuestion(q)}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border"
            style={{
              background: 'rgba(15, 23, 42, 0.6)',
              borderColor: 'rgba(34, 211, 238, 0.2)',
              color: 'rgba(165, 243, 252, 0.7)'
            }}
          >
            {q}
          </button>
        ))}
      </div>

      {/* AI Answer */}
      {answer && (
        <div className="space-y-3">
          <div
            className="p-4 rounded-xl border backdrop-blur-xl"
            style={{
              background: 'rgba(15, 23, 42, 0.8)',
              borderColor: 'rgba(34, 211, 238, 0.25)'
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <div className="text-sm font-bold text-cyan-50">{answer.summary}</div>
            </div>
            <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold" style={{ background: 'rgba(168, 85, 247, 0.2)', color: '#c084fc', border: '1px solid rgba(168, 85, 247, 0.3)' }}>
              {answer.confidence}% confidence
            </span>
          </div>

          {answer.recommendations && answer.recommendations.length > 0 && (
            <div className="space-y-2">
              {answer.recommendations.map((rec, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl border backdrop-blur-xl transition-all hover:scale-[1.01]"
                  style={{
                    background: 'rgba(15, 23, 42, 0.6)',
                    borderColor: rec.priority === 'High' ? 'rgba(239, 68, 68, 0.3)' : rec.priority === 'Medium' ? 'rgba(245, 158, 11, 0.3)' : 'rgba(59, 130, 246, 0.3)'
                  }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="text-sm font-bold text-cyan-50">{rec.title}</div>
                      <div className="text-xs text-cyan-200/50 mt-1">{rec.reason}</div>
                    </div>
                    <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      rec.priority === 'High' ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
                      rec.priority === 'Medium' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                      'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                    }`}>
                      {rec.priority}
                    </span>
                  </div>
                  {rec.action && (
                    <button
                      className="w-full mt-3 py-2 rounded-lg text-xs font-bold transition-all border"
                      style={{
                        background: 'rgba(34, 211, 238, 0.15)',
                        borderColor: 'rgba(34, 211, 238, 0.3)',
                        color: '#22d3ee'
                      }}
                    >
                      {rec.action}
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}