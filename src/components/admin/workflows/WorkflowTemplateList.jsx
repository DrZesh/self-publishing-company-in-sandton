import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Filter, Edit, Copy, Download, Play, Trash2, Settings } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const CATEGORY_COLORS = {
  'Client Onboarding': 'bg-blue-100 text-blue-700',
  'Quote to Invoice': 'bg-green-100 text-green-700',
  'Production': 'bg-purple-100 text-purple-700',
  'Quality Control': 'bg-amber-100 text-amber-700',
  'Delivery': 'bg-cyan-100 text-cyan-700',
  'Custom': 'bg-gray-100 text-gray-700',
};

export default function WorkflowTemplateList({ 
  templates, 
  isLoading, 
  search, 
  setSearch, 
  categoryFilter, 
  setCategoryFilter,
  onEdit,
  onDuplicate,
  onExport,
  onTest,
  onDelete,
}) {
  const categories = ['', 'Client Onboarding', 'Quote to Invoice', 'Production', 'Quality Control', 'Delivery', 'Custom'];

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex gap-2 items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search templates..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm min-w-[250px]"
            />
          </div>
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
        <div className="text-sm text-gray-500">
          {templates.length} template{templates.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <div className="col-span-full text-center py-8 text-gray-500">Loading...</div>
        ) : templates.length === 0 ? (
          <div className="col-span-full text-center py-8 text-gray-500">
            No workflows found. Create your first workflow template!
          </div>
        ) : (
          templates.map((template) => (
            <Card key={template.id} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg font-semibold mb-2">{template.template_name}</CardTitle>
                    <Badge className={CATEGORY_COLORS[template.category] || 'bg-gray-100 text-gray-700'}>
                      {template.category}
                    </Badge>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <Settings className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit(template.id)}>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onTest(template.id)}>
                        <Play className="w-4 h-4 mr-2" />
                        Test
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onDuplicate(template.id)}>
                        <Copy className="w-4 h-4 mr-2" />
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onExport(template.id)}>
                        <Download className="w-4 h-4 mr-2" />
                        Export
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => onDelete(template.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Trigger:</span>
                    <span className="font-medium">{template.trigger_type}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Entity:</span>
                    <span className="font-medium">{template.trigger_entity}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Steps:</span>
                    <span className="font-medium">{template.steps?.length || 0}</span>
                  </div>
                  {template.description && (
                    <p className="text-gray-600 text-xs mt-2 line-clamp-2">{template.description}</p>
                  )}
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t">
                    <Badge variant="outline" className="text-xs">
                      v{template.version}
                    </Badge>
                    {template.is_active ? (
                      <Badge className="bg-green-100 text-green-700 text-xs">Active</Badge>
                    ) : (
                      <Badge className="bg-gray-100 text-gray-700 text-xs">Inactive</Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}