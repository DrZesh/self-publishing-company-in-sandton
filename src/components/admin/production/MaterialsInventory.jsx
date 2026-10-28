import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Package, AlertTriangle, Download, Plus, Search } from 'lucide-react';
import { toast } from 'sonner';
import { platform } from '@/api/platformClient';

export default function MaterialsInventory({ onRefetch }) {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  const { data: materials, isLoading, refetch } = useQuery({
    queryKey: ['materials-inventory'],
    queryFn: async () => {
      const res = await platform.functions.invoke('manageInventory', {
        action: 'list_materials',
      });
      return res.data.materials || [];
    },
  });

  const filteredMaterials = (materials || []).filter(mat => {
    if (categoryFilter && mat.category !== categoryFilter) return false;
    if (search && !mat.name?.toLowerCase().includes(search.toLowerCase()) &&
        !mat.material_code?.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    return true;
  });

  const stats = {
    total: materials?.length || 0,
    lowStock: materials?.filter(m => m.is_low_stock).length || 0,
    outOfStock: materials?.filter(m => m.current_stock === 0).length || 0,
    totalValue: materials?.reduce((sum, m) => sum + (m.current_stock * m.cost_per_unit), 0) || 0,
  };

  const categories = ['', 'Paper', 'Ink', 'Cover Stock', 'Binding', 'Packaging', 'Other'];

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-gray-500">Total Materials</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-amber-600">{stats.lowStock}</div>
            <p className="text-xs text-gray-500">Low Stock</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-red-600">{stats.outOfStock}</div>
            <p className="text-xs text-gray-500">Out of Stock</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-green-600">R {stats.totalValue.toLocaleString('en-ZA')}</div>
            <p className="text-xs text-gray-500">Total Value</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex gap-2 items-center">
          <input
            type="text"
            placeholder="Search materials..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="">All Categories</option>
            {categories.filter(c => c).map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={async () => {
            const res = await platform.functions.invoke('exportData', {
              action: 'export_materials',
              format: 'csv',
            });
            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'materials.csv';
            a.click();
            toast.success('Materials exported');
          }}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Material
          </Button>
        </div>
      </div>

      {/* Materials Table */}
      <Card>
        <CardHeader>
          <CardTitle>Materials Inventory</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-gray-500">Loading...</div>
          ) : filteredMaterials.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No materials found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 text-sm font-semibold">Code</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold">Name</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold">Category</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold">Stock</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold">Min</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold">Unit Cost</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold">Total Value</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMaterials.map((mat) => (
                    <tr key={mat.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm font-medium">{mat.material_code}</td>
                      <td className="py-3 px-4 text-sm">{mat.name}</td>
                      <td className="py-3 px-4">
                        <Badge className="bg-gray-100 text-gray-700">{mat.category}</Badge>
                      </td>
                      <td className="py-3 px-4 text-sm text-right">{mat.current_stock} {mat.unit_of_measure}</td>
                      <td className="py-3 px-4 text-sm text-right">{mat.minimum_stock}</td>
                      <td className="py-3 px-4 text-sm text-right">R {mat.cost_per_unit?.toFixed(2)}</td>
                      <td className="py-3 px-4 text-sm text-right font-semibold">
                        R {(mat.current_stock * mat.cost_per_unit).toLocaleString('en-ZA')}
                      </td>
                      <td className="py-3 px-4">
                        {mat.current_stock === 0 ? (
                          <Badge className="bg-red-100 text-red-700">Out of Stock</Badge>
                        ) : mat.current_stock <= mat.minimum_stock ? (
                          <Badge className="bg-amber-100 text-amber-700 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            Low Stock
                          </Badge>
                        ) : (
                          <Badge className="bg-green-100 text-green-700">In Stock</Badge>
                        )}
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