import { useState } from 'react';
import { Sparkles, Loader2, Zap, AlertCircle, ThumbsUp, Clock } from 'lucide-react';
import { platform } from '@/api/platformClient';
import { toast } from 'sonner';

const PRIORITY_STYLES = {
  urgent:  'bg-red-100 text-red-700 border-red-200',
  high:    'bg-orange-100 text-orange-700 border-orange-200',
  normal:  'bg-blue-100 text-blue-700 border-blue-200',
  low:     'bg-gray-100 text-gray-500 border-gray-200',
};

const SENTIMENT_ICONS = {
  positive: '😊',
  neutral: '😐',
  negative: '😟',
  urgent_need: '🚨',
};

const ACTION_LABELS = {
  send_quote: 'Send Quote',
  book_consultation: 'Book Consult',
  request_details: 'Request Info',
  acknowledge: 'Acknowledge',
  ignore: 'Ignore',
};

export default function InboxTriageTag({ submission, onTriaged }) {
  const [loading, setLoading] = useState(false);

  const af = submission.additional_fields || {};
  const hasTriaged = !!af.ai_priority;

  const handleTriage = async () => {
    setLoading(true);
    try {
      const res = await platform.functions.invoke('triageInboxSubmission', {
        submission_id: submission.id,
      });
      toast.success('AI triage complete');
      if (onTriaged) onTriaged(res.data?.triage);
    } catch (e) {
      toast.error('Triage failed: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  if (!hasTriaged) {
    return (
      <button
        onClick={handleTriage}
        disabled={loading}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border"
        style={{ background: 'linear-gradient(135deg,#8b5cf6,#6366f1)', color: '#fff', borderColor: 'transparent', opacity: loading ? 0.7 : 1 }}
      >
        {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
        {loading ? 'Analysing…' : 'AI Triage'}
      </button>
    );
  }

  return (
    <div className="flex flex-wrap gap-1.5 items-center">
      {/* Priority */}
      <span className={`px-2 py-0.5 rounded-full text-xs font-bold border capitalize ${PRIORITY_STYLES[af.ai_priority] || PRIORITY_STYLES.normal}`}>
        {af.ai_priority === 'urgent' && '🚨 '}
        {af.ai_priority}
      </span>

      {/* Sentiment */}
      {af.ai_sentiment && (
        <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-700 border border-purple-200">
          {SENTIMENT_ICONS[af.ai_sentiment] || ''} {af.ai_sentiment?.replace(/_/g, ' ')}
        </span>
      )}

      {/* Category */}
      {af.ai_category && (
        <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 border border-amber-200">
          {af.ai_category.replace(/_/g, ' ')}
        </span>
      )}

      {/* Recommended action */}
      {af.ai_recommended_action && (
        <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 border border-emerald-200">
          → {ACTION_LABELS[af.ai_recommended_action] || af.ai_recommended_action}
        </span>
      )}

      {/* Re-triage */}
      <button
        onClick={handleTriage}
        disabled={loading}
        title="Re-run AI triage"
        className="p-1 rounded-lg text-purple-400 hover:bg-purple-50 transition-colors"
      >
        {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
      </button>
    </div>
  );
}