import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, Download, Plus, Search } from 'lucide-react';
import { toast } from 'sonner';
import { platform } from '@/api/platformClient';

export default function PurchaseOrders({ onRefetch }) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const { data: pos, isLoading, refetch } = useQuery({
    queryKey: ['purchase-orders'],
    queryFn: async () => {
      const res = await platform.functions.invoke('manageInventory', {
        action: 'list_pos',
        limit: 200,
      });
      return res.data.pos || [];
    },
  });

  const filteredPOs = (pos || []).filter(po => {
    if (statusFilter && po.status !== statusFilter) return false;
    if (search && !po.po_number?.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    return true;
  });

  const stats = {
    total: pos?.length || 0,
    draft: pos?.filter(p => p.status === 'Draft').length || 0,
    sent: pos?.filter(p => p.status === 'Sent').length || 0,
    completed: pos?.filter(p => p.status === 'Completed').length || 0,
    totalValue: pos?.reduce((sum, p) => sum + (p.total || 0), 0) || 0,
  };

  const statuses = ['', 'Draft', 'Sent', 'Confirmed', 'Partially Received', 'Completed', 'Cancelled'];

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-gray-500">Total POs</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-blue-600">{stats.draft}</div>
            <p className="text-xs text-gray-500">Draft</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-amber-600">{stats.sent}</div>
            <p className="text-xs text-gray-500">Sent/Confirmed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            <p className="text-xs text-gray-500">Completed</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex gap-2 items-center">
          <input
            type="text"
            placeholder="Search POs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="">All Statuses</option>
            {statuses.filter(s => s).map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={async () => {
            const res = await platform.functions.invoke('exportData', {
              action: 'export_purchase_orders',
              format: 'csv',
            });
            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'purchase_orders.csv';
            a.click();
            toast.success('Purchase orders exported');
          }}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Create PO
          </Button>
        </div>
      </div>

      {/* PO Table */}
      <Card>
        <CardHeader>
          <CardTitle>Purchase Orders</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-gray-500">Loading...</div>
          ) : filteredPOs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No purchase orders found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 text-sm font-semibold">PO Number</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold">Supplier</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold">Order Date</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold">Delivery Date</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold">Status</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPOs.map((po) => (
                    <tr key={po.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm font-medium">{po.po_number}</td>
                      <td className="py-3 px-4 text-sm">{po.supplier_snapshot?.name || 'Unknown'}</td>
                      <td className="py-3 px-4 text-sm">
                        {po.order_date ? new Date(po.order_date).toLocaleDateString('en-ZA') : '-'}
                      </td>
                      <td className="py-3 px-4 text-sm">
                        {po.expected_delivery_date ? new Date(po.expected_delivery_date).toLocaleDateString('en-ZA') : '-'}
                      </td>
                      <td className="py-3 px-4">
                        <Badge className={`
                          ${po.status === 'Draft' ? 'bg-gray-100 text-gray-700' :
                            po.status === 'Sent' || po.status === 'Confirmed' ? 'bg-blue-100 text-blue-700' :
                            po.status === 'Partially Received' ? 'bg-amber-100 text-amber-700' :
                            po.status === 'Completed' ? 'bg-green-100 text-green-700' :
                            'bg-red-100 text-red-700'}
                        `}>
                          {po.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-sm text-right font-semibold">
                        R {po.total?.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}