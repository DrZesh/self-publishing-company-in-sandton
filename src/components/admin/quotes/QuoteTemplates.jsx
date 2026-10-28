import React, { useState } from 'react';
import { platform } from '@/api/platformClient';
import { Button } from '@/components/ui/button';
import { FileText, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function QuoteTemplates({ onAddTemplate, onClose }) {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    platform.entities.Service.list().then(services => {
      setTemplates(services.filter(s => s.active !== false));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleAddTemplate = async (service) => {
    onAddTemplate(service);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden shadow-2xl">
        <div className="p-6 border-b flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Service Templates</h2>
            <p className="text-sm text-gray-500 mt-1">Select a template to add to your quote</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            </div>
          ) : templates.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No templates available</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {templates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => handleAddTemplate(template)}
                  className="text-left p-4 border border-gray-200 rounded-xl hover:border-[#B87333] hover:bg-[#B87333]/5 transition-all group"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900 group-hover:text-[#B87333]">
                          {template.serviceName}
                        </h3>
                        {template.packageName && (
                          <span className="text-xs px-2 py-0.5 bg-[#B87333]/10 text-[#B87333] rounded-full font-medium">
                            {template.packageName}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{template.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <span>Category: {template.category}</span>
                        <span>Pricing: {template.pricingType.replace('_', ' ')}</span>
                        {template.basePrice && (
                          <span className="font-semibold text-[#B87333]">
                            R {Number(template.basePrice).toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
                          </span>
                        )}
                      </div>
                    </div>
                    <Button size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                      Add
                    </Button>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}