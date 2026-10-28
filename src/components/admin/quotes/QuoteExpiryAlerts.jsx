import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Clock } from 'lucide-react';

export default function QuoteExpiryAlerts({ quotes = [] }) {
  const alerts = React.useMemo(() => {
    const now = new Date();
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    return quotes
      .filter(q => ['Sent', 'Viewed', 'Opened', 'Delivered'].includes(q.status) && q.valid_until)
      .map(q => {
        const validDate = new Date(q.valid_until);
        const daysUntilExpiry = Math.ceil((validDate - now) / (1000 * 60 * 60 * 24));
        return {
          quote: q,
          daysUntilExpiry,
          isExpired: daysUntilExpiry < 0,
          isUrgent: daysUntilExpiry >= 0 && daysUntilExpiry <= 3,
        };
      })
      .filter(a => a.daysUntilExpiry <= 7)
      .sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry)
      .slice(0, 5);
  }, [quotes]);

  const expiredCount = alerts.filter(a => a.isExpired).length;
  const urgentCount = alerts.filter(a => !a.isExpired && a.isUrgent).length;

  if (alerts.length === 0) {
    return (
      <Card className="border-gray-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-gray-700">Expiry Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48 flex items-center justify-center text-gray-400 text-sm">No expiring quotes</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-gray-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold text-gray-700">Expiry Alerts</CardTitle>
          <div className="flex gap-2">
            {expiredCount > 0 && <Badge className="bg-red-100 text-red-700 border-0">{expiredCount} expired</Badge>}
            {urgentCount > 0 && <Badge className="bg-orange-100 text-orange-700 border-0">{urgentCount} urgent</Badge>}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {alerts.map(({ quote, daysUntilExpiry, isExpired, isUrgent }) => (
            <div key={quote.id} className="flex items-center justify-between p-2 rounded-lg bg-gray-50 border border-gray-100">
              <div className="flex items-center gap-2">
                {isExpired ? (
                  <AlertCircle className="w-4 h-4 text-red-500" />
                ) : isUrgent ? (
                  <Clock className="w-4 h-4 text-orange-500" />
                ) : (
                  <Clock className="w-4 h-4 text-blue-500" />
                )}
                <div>
                  <div className="text-sm font-medium text-gray-900">{quote.quote_number}</div>
                  <div className="text-xs text-gray-500">{quote.contact_snapshot?.full_name || 'Client'}</div>
                </div>
              </div>
              <div className={`text-xs font-semibold ${
                isExpired ? 'text-red-600' : isUrgent ? 'text-orange-600' : 'text-blue-600'
              }`}>
                {isExpired 
                  ? `Expired ${Math.abs(daysUntilExpiry)}d ago` 
                  : daysUntilExpiry === 0 
                    ? 'Expires today' 
                    : `Expires in ${daysUntilExpiry}d`}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}