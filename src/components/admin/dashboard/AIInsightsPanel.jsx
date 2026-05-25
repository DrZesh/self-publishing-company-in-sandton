import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Brain, TrendingUp, AlertTriangle, CheckCircle, Clock, Target, Mail, FileText, Phone } from 'lucide-react';

const PRIORITY_COLORS = {
  Urgent: 'bg-red-100 text-red-700 border-red-200',
  High: 'bg-orange-100 text-orange-700 border-orange-200',
  Medium: 'bg-amber-100 text-amber-700 border-amber-200',
  Low: 'bg-blue-100 text-blue-700 border-blue-200',
};

const ALERT_ICONS = {
  Hot: Target,
  Overdue: Clock,
  Missing: AlertTriangle,
  Pending: FileText,
  SEO: TrendingUp,
  FollowUp: Mail,
  Convert: CheckCircle,
  Upsell: Brain,
};

export default function AIInsightsPanel({ insights = [], onAction }) {
  if (!insights || insights.length === 0) {
    return (
      <Card className="border-[#B87333]/20 bg-gradient-to-br from-[#F8F5EF]/50 to-white">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-[#2B2B2B] flex items-center gap-2">
            <Brain className="w-4 h-4 text-[#B87333]" />
            AI Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 text-center py-4">No AI insights at the moment</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-[#B87333]/20 bg-gradient-to-br from-[#F8F5EF]/50 to-white">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold text-[#2B2B2B] flex items-center gap-2">
          <Brain className="w-4 h-4 text-[#B87333]" />
          AI Insights
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {insights.slice(0, 5).map((insight, idx) => {
          const Icon = ALERT_ICONS[insight.type] || Brain;
          return (
            <div
              key={idx}
              className="p-3 bg-white rounded-lg border border-gray-200 hover:border-[#B87333]/30 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${PRIORITY_COLORS[insight.priority]}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h4 className="text-sm font-semibold text-[#2B2B2B] truncate">{insight.title}</h4>
                    <Badge className={`text-xs ${PRIORITY_COLORS[insight.priority]}`}>
                      {insight.priority}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-600 mb-2">{insight.reason}</p>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs"
                      onClick={() => onAction?.(insight)}
                    >
                      {insight.actionLabel || 'View'}
                    </Button>
                    {insight.relatedRecord && (
                      <span className="text-xs text-gray-400">{insight.relatedRecord}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}