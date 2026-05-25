import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export default function RevenueForecast() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.functions.invoke('getRevenueForecast', {})
      .then(res => setData(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Revenue Forecast</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  const growthColor = data.growth_rate >= 0 ? 'text-green-600' : 'text-red-600';
  const GrowthIcon = data.growth_rate >= 0 ? ArrowUpRight : ArrowDownRight;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-green-600" />
            Revenue Forecast
          </CardTitle>
          <span className={`text-xs font-medium ${growthColor} flex items-center gap-1`}>
            <GrowthIcon className="w-3 h-3" />
            {data.growth_rate >= 0 ? '+' : ''}{data.growth_rate.toFixed(1)}% vs last month
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-500 mb-1">This Month</p>
            <p className="text-xl font-bold text-gray-900">
              R {data.monthly_revenue.toLocaleString('en-ZA', { minimumFractionDigits: 0 })}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Projected (Month End)</p>
            <p className="text-xl font-bold text-blue-600">
              R {data.projected_month_end.toLocaleString('en-ZA', { minimumFractionDigits: 0 })}
            </p>
          </div>
        </div>

        <div className="pt-3 border-t">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-gray-500">Pipeline (Weighted)</p>
            <p className="text-sm font-semibold">
              R {data.pipeline_forecast.total_weighted.toLocaleString('en-ZA', { minimumFractionDigits: 0 })}
            </p>
          </div>
          <Progress value={(data.pipeline_forecast.total_weighted / data.pipeline_forecast.total_pipeline) * 100} className="h-2" />
          <p className="text-xs text-gray-400 mt-1">
            {data.pipeline_forecast.total_opportunities} opportunities • R {data.pipeline_forecast.total_pipeline.toLocaleString('en-ZA')} total
          </p>
        </div>

        <div className="pt-3 border-t">
          <p className="text-xs text-gray-500 mb-2">Pipeline by Stage</p>
          <div className="space-y-2">
            {Object.entries(data.pipeline_by_stage).slice(0, 4).map(([stage, info]) => (
              <div key={stage} className="flex items-center justify-between text-xs">
                <span className="capitalize text-gray-600">{stage.replace('_', ' ')}</span>
                <span className="font-medium text-gray-900">
                  R {info.total_value.toLocaleString('en-ZA', { minimumFractionDigits: 0 })}
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}