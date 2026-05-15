import React from 'react';
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

export default function CostBreakdownChart({ breakdown, total }) {
  // Prepare data for pie chart
  const chartData = breakdown.map(item => ({
    name: item.name,
    value: item.amount,
    percentage: Math.round((item.amount / total) * 100),
  }));

  // Color palette
  const colors = ['#B87333', '#D4A574', '#9a6030', '#C9975E'];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.2 }}
      className="p-6 sm:p-8 bg-white rounded-2xl border border-[#0F0F0F]/10"
    >
      <h3 className="font-heading text-lg font-bold text-[#0F0F0F] mb-6">Cost Breakdown</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Chart */}
        <div className="flex items-center justify-center">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={80}
                outerRadius={120}
                paddingAngle={3}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => `R${value.toLocaleString()}`}
                contentStyle={{ background: '#fff', border: '1px solid #B87333', borderRadius: '8px' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend with percentages */}
        <div className="space-y-3">
          {chartData.map((item, index) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + index * 0.05 }}
              className="p-3 rounded-lg border border-[#0F0F0F]/5 hover:bg-[#0F0F0F]/2 transition-colors"
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: colors[index % colors.length] }}
                  />
                  <span className="text-sm font-medium text-[#0F0F0F]">{item.name}</span>
                </div>
                <span className="text-sm font-bold text-copper">{item.percentage}%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="w-full h-1.5 bg-[#0F0F0F]/10 rounded-full overflow-hidden mr-2">
                  <div
                    className="h-full transition-all duration-500"
                    style={{
                      width: `${item.percentage}%`,
                      backgroundColor: colors[index % colors.length],
                    }}
                  />
                </div>
                <span className="text-xs text-[#0F0F0F]/60 whitespace-nowrap">
                  R{item.value.toLocaleString()}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}