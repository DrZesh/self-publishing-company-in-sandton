import React, { useState } from 'react';
import { platform } from '@/api/platformClient';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { RefreshCw, CheckCircle, AlertCircle, Settings, ArrowRight } from 'lucide-react';

export default function ZohoBooksSync({ entityName, entityId, entityData }) {
  const [syncing, setSyncing] = useState(false);
  const [lastSynced, setLastSynced] = useState(entityData?.zoho_synced_at);
  const [zohoId, setZohoId] = useState(entityData?.zoho_contact_id || entityData?.zoho_invoice_id);

  const handleSyncToZoho = async () => {
    setSyncing(true);
    try {
      let action, payload;
      
      if (entityName === 'Contact') {
        action = zohoId ? 'zoho_contact_update' : 'zoho_contact_create';
        payload = { data: entityData, id: zohoId };
      } else if (entityName === 'Invoice') {
        action = zohoId ? 'zoho_invoice_update' : 'zoho_invoice_create';
        payload = { data: entityData, id: zohoId };
      } else if (entityName === 'Payment') {
        action = 'zoho_payment_record';
        payload = { data: entityData };
      }

      const result = await platform.functions.invoke('zohoBooksIntegration', {
        action,
        ...payload,
      });

      if (result.data.zoho_contact_id || result.data.zoho_invoice_id || result.data.zoho_payment_id) {
        const zohoField = entityName === 'Contact' ? 'zoho_contact_id' :
                         entityName === 'Invoice' ? 'zoho_invoice_id' : 'zoho_payment_id';
        
        await platform.entities[entityName].update(entityId, {
          [zohoField]: result.data.zoho_contact_id || result.data.zoho_invoice_id || result.data.zoho_payment_id,
          zoho_synced_at: new Date().toISOString(),
        });

        setZohoId(result.data.zoho_contact_id || result.data.zoho_invoice_id || result.data.zoho_payment_id);
        setLastSynced(new Date().toISOString());
        toast.success('Synced to Zoho Books successfully');
      }
    } catch (error) {
      toast.error(error.message || 'Sync failed');
    } finally {
      setSyncing(false);
    }
  };

  const handleSendInvoice = async () => {
    if (!zohoId) return toast.error('Invoice not synced to Zoho yet');
    setSyncing(true);
    try {
      await platform.functions.invoke('zohoBooksIntegration', {
        action: 'zoho_invoice_send',
        id: zohoId,
      });
      toast.success('Invoice sent via Zoho Books');
    } catch (error) {
      toast.error(error.message || 'Failed to send');
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="border border-gray-200 rounded-xl p-4 bg-white">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
            <span className="text-xs font-bold text-green-700">Z</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-700">Zoho Books</p>
            <p className="text-xs text-gray-400">
              {zohoId ? (
                <span className="flex items-center gap-1">
                  <CheckCircle className="w-3 h-3 text-green-600" />
                  Synced {lastSynced ? new Date(lastSynced).toLocaleString() : 'previously'}
                </span>
              ) : (
                'Not synced'
              )}
            </p>
          </div>
        </div>
        {entityName === 'Invoice' && zohoId && (
          <Button
            size="sm"
            variant="outline"
            onClick={handleSendInvoice}
            disabled={syncing}
            className="text-xs"
          >
            Send via Zoho
          </Button>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Button
          size="sm"
          onClick={handleSyncToZoho}
          disabled={syncing}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          <RefreshCw className={`w-3 h-3 mr-1.5 ${syncing ? 'animate-spin' : ''}`} />
          {syncing ? 'Syncing...' : zohoId ? 'Update in Zoho' : 'Sync to Zoho'}
        </Button>

        {zohoId && (
          <span className="text-xs text-gray-400 font-mono">
            ID: {zohoId}
          </span>
        )}
      </div>

      {!zohoId && (
        <p className="text-xs text-gray-400 mt-2">
          This will create a matching record in Zoho Books
        </p>
      )}
    </div>
  );
}