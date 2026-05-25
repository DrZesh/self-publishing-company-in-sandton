import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Brain, Copy, RefreshCw, CheckCircle, AlertCircle, Info, Mail } from 'lucide-react';
import { toast } from 'sonner';

const SCORE_COLORS = {
  Hot: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  Warm: 'bg-amber-100 text-amber-700 border-amber-200',
  Cold: 'bg-gray-100 text-gray-600 border-gray-200',
};

export default function AILeadSummary({ lead, contact, submission, onGenerateSummary, onGenerateReply }) {
  const [generating, setGenerating] = useState(false);
  const [summary, setSummary] = useState(null);
  const [score, setScore] = useState(null);
  const [missingInfo, setMissingInfo] = useState([]);
  const [reply, setReply] = useState('');

  const handleGenerateSummary = async () => {
    setGenerating(true);
    try {
      // Simulate AI analysis
      const analysis = analyzeLead(lead, contact, submission);
      setSummary(analysis.summary);
      setScore(analysis.score);
      setMissingInfo(analysis.missingInfo);
      if (onGenerateSummary) onGenerateSummary(analysis);
      toast.success('AI summary generated');
    } catch (error) {
      toast.error('Failed to generate summary');
    } finally {
      setGenerating(false);
    }
  };

  const handleGenerateReply = () => {
    const generatedReply = generateEmailReply(lead, contact, summary);
    setReply(generatedReply);
    if (onGenerateReply) onGenerateReply(generatedReply);
    toast.success('AI reply drafted');
  };

  if (!summary && !generating) {
    return (
      <Card className="border-[#B87333]/20 bg-gradient-to-br from-[#F8F5EF]/30 to-white">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-[#2B2B2B] flex items-center gap-2">
            <Brain className="w-4 h-4 text-[#B87333]" />
            AI Lead Intelligence
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Button
            onClick={handleGenerateSummary}
            className="w-full bg-[#B87333] hover:bg-[#a06428]"
          >
            <Brain className="w-4 h-4 mr-2" />
            Generate AI Summary
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-[#B87333]/20 bg-gradient-to-br from-[#F8F5EF]/30 to-white">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold text-[#2B2B2B] flex items-center gap-2">
          <Brain className="w-4 h-4 text-[#B87333]" />
          AI Lead Intelligence
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Lead Score */}
        {score && (
          <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
            <div>
              <div className="text-xs text-gray-500 mb-1">AI Lead Score</div>
              <div className="text-lg font-bold text-[#2B2B2B]">{score.label}</div>
            </div>
            <Badge className={`${SCORE_COLORS[score.label]} border`}>
              {score.confidence}% confidence
            </Badge>
          </div>
        )}

        {/* Summary */}
        {summary && (
          <div className="p-3 bg-white rounded-lg border border-gray-200">
            <div className="text-xs text-gray-500 mb-2">AI Summary</div>
            <div className="text-sm text-[#2B2B2B] space-y-1">
              {summary.service && <p><strong>Service:</strong> {summary.service}</p>}
              {summary.bookTitle && <p><strong>Book Title:</strong> {summary.bookTitle}</p>}
              {summary.bookSize && <p><strong>Book Size:</strong> {summary.bookSize}</p>}
              {summary.pageCount && <p><strong>Page Count:</strong> {summary.pageCount}</p>}
              {summary.wordCount && <p><strong>Word Count:</strong> {summary.wordCount}</p>}
              {summary.quantity && <p><strong>Quantity:</strong> {summary.quantity}</p>}
              {summary.urgency && <p><strong>Timeline:</strong> {summary.urgency}</p>}
              {summary.mainRequest && <p><strong>Request:</strong> {summary.mainRequest}</p>}
            </div>
          </div>
        )}

        {/* Missing Information */}
        {missingInfo.length > 0 && (
          <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              <div className="text-sm font-semibold text-amber-800">Missing Information</div>
            </div>
            <ul className="text-xs text-amber-700 space-y-1 list-disc list-inside">
              {missingInfo.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Recommended Action */}
        {summary?.recommendedAction && (
          <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <div className="text-sm font-semibold text-emerald-800">Recommended Action</div>
            </div>
            <p className="text-xs text-emerald-700">{summary.recommendedAction}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleGenerateReply}
            className="flex-1"
          >
            <Mail className="w-4 h-4 mr-2" />
            Draft Reply
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              navigator.clipboard.writeText(JSON.stringify(summary, null, 2));
              toast.success('Summary copied');
            }}
          >
            <Copy className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleGenerateSummary}
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>

        {/* Email Draft */}
        {reply && (
          <div className="p-3 bg-white rounded-lg border border-gray-200">
            <div className="text-xs text-gray-500 mb-2">AI Email Draft</div>
            <Textarea
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              className="h-32 text-xs"
            />
            <div className="flex gap-2 mt-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  navigator.clipboard.writeText(reply);
                  toast.success('Email copied');
                }}
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setReply('')}
              >
                Clear
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Helper functions
function analyzeLead(lead, contact, submission) {
  const services = lead?.service_interest || submission?.service_interest || [];
  const bookTitle = contact?.book_title || submission?.book_title;
  const pageCount = contact?.custom_fields?.pageCount || submission?.book_page_count;
  const wordCount = contact?.custom_fields?.wordCount || submission?.book_word_count;
  const message = submission?.message || '';

  // Score calculation
  let scoreValue = 50;
  const reasons = [];

  if (services.length > 0) { scoreValue += 10; reasons.push('Services specified'); }
  if (bookTitle) { scoreValue += 10; reasons.push('Book title provided'); }
  if (pageCount) { scoreValue += 10; reasons.push('Page count known'); }
  if (wordCount) { scoreValue += 10; reasons.push('Word count known'); }
  if (message.length > 100) { scoreValue += 10; reasons.push('Detailed message'); }
  if (lead?.estimated_value > 0) { scoreValue += 15; reasons.push('Budget indicated'); }
  if (contact?.phone) { scoreValue += 5; reasons.push('Phone provided'); }

  const scoreLabel = scoreValue >= 80 ? 'Hot' : scoreValue >= 60 ? 'Warm' : 'Cold';
  const score = { label: scoreLabel, confidence: Math.min(scoreValue + 10, 95), value: scoreValue };

  // Missing info detection
  const missingInfo = [];
  const serviceType = services[0] || '';

  if (serviceType.includes('Printing') && !pageCount) missingInfo.push('Page count');
  if (serviceType.includes('Printing') && !contact?.custom_fields?.quantity) missingInfo.push('Print quantity');
  if (serviceType.includes('Printing') && !contact?.custom_fields?.bookSize) missingInfo.push('Book size');
  if (serviceType.includes('Editing') && !wordCount) missingInfo.push('Word count');
  if (serviceType.includes('Cover') && !contact?.custom_fields?.coverType) missingInfo.push('Cover type preference');

  // Summary
  const summary = {
    service: services.join(', ') || 'Not specified',
    bookTitle: bookTitle || 'Not provided',
    bookSize: contact?.custom_fields?.bookSize || 'Not specified',
    pageCount: pageCount || 'Not provided',
    wordCount: wordCount || 'Not provided',
    quantity: contact?.custom_fields?.quantity || 'Not specified',
    urgency: message.toLowerCase().includes('urgent') || message.toLowerCase().includes('asap') ? 'Urgent' : 'Normal',
    mainRequest: message.slice(0, 100) + (message.length > 100 ? '...' : ''),
    recommendedAction: scoreLabel === 'Hot' 
      ? 'Contact within 24 hours - high conversion potential'
      : scoreLabel === 'Warm'
      ? 'Send follow-up email with service details'
      : 'Add to nurturing sequence',
  };

  return { summary, score, missingInfo };
}

function generateEmailReply(lead, contact, summary) {
  const clientName = contact?.full_name?.split(' ')[0] || 'there';
  const serviceName = summary?.service || 'our services';
  const bookTitle = summary?.bookTitle !== 'Not provided' ? `"${summary.bookTitle}"` : 'your book';

  return `Hi ${clientName},

Thank you for your interest in ${serviceName} for ${bookTitle || 'your project'}.

I've reviewed your enquiry and would be happy to provide you with a custom quote. To ensure I give you accurate pricing, could you please confirm a few details:

${summary?.missingInfo?.length > 0 
  ? summary.missingInfo.map(info => `- ${info}`).join('\n')
  : 'Any additional requirements or preferences you have.'}

Once I have this information, I'll send over a detailed quote within 24 hours.

If you have any questions in the meantime, feel free to reach out.

Best regards,
Creative Books SA Team
010 500 3331
info@creativebooks.co.za`;
}