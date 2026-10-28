import React from 'react';
import { Mail, Bell, Settings, Zap } from 'lucide-react';

export default function NotificationSettingsTab({ contact, projects }) {
  const [settings, setSettings] = React.useState({
    email_project_updates: true,
    email_file_requests: true,
    email_payment_reminders: true,
    email_proof_approvals: true,
    whatsapp_notifications: false,
    sms_notifications: false,
  });

  const handleToggle = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-6">
      {/* Email Notifications */}
      <div className="bg-gradient-to-br from-[#1A1A2E] to-[#16213E] rounded-3xl border border-[#B87333]/20 p-6 shadow-xl">
        <h3 className="font-bold text-white text-lg mb-4 flex items-center gap-2">
          <Mail className="w-5 h-5 text-[#D4A574]" />
          Email Notifications
        </h3>
        
        <div className="space-y-4">
          <ToggleRow
            label="Project Updates"
            description="Receive emails when your project stage changes or milestones are completed"
            enabled={settings.email_project_updates}
            onToggle={() => handleToggle('email_project_updates')}
          />
          <ToggleRow
            label="File Requests"
            description="Get notified when we need files or documents from you"
            enabled={settings.email_file_requests}
            onToggle={() => handleToggle('email_file_requests')}
          />
          <ToggleRow
            label="Payment Reminders"
            description="Receive invoice and payment due date reminders"
            enabled={settings.email_payment_reminders}
            onToggle={() => handleToggle('email_payment_reminders')}
          />
          <ToggleRow
            label="Proof Approvals"
            description="Notifications when proofs are ready for your review"
            enabled={settings.email_proof_approvals}
            onToggle={() => handleToggle('email_proof_approvals')}
          />
        </div>
      </div>

      {/* Instant Notifications */}
      <div className="bg-gradient-to-br from-[#1A1A2E] to-[#16213E] rounded-3xl border border-gray-700/50 p-6 shadow-xl">
        <h3 className="font-bold text-white text-lg mb-4 flex items-center gap-2">
          <Bell className="w-5 h-5 text-[#D4A574]" />
          Instant Notifications
        </h3>
        
        <div className="space-y-4">
          <ToggleRow
            label="WhatsApp Notifications"
            description="Receive urgent updates via WhatsApp"
            enabled={settings.whatsapp_notifications}
            onToggle={() => handleToggle('whatsapp_notifications')}
            comingSoon
          />
          <ToggleRow
            label="SMS Notifications"
            description="Get text messages for time-sensitive updates"
            enabled={settings.sms_notifications}
            onToggle={() => handleToggle('sms_notifications')}
            comingSoon
          />
        </div>
      </div>

      {/* Automation Status */}
      <div className="bg-gradient-to-r from-[#B87333]/20 to-[#D4A574]/10 rounded-3xl border border-[#B87333]/30 p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-[#B87333]/20 rounded-xl flex items-center justify-center">
            <Zap className="w-6 h-6 text-[#D4A574]" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-white text-lg mb-1">Automated Project Updates</h3>
            <p className="text-sm text-gray-400 mb-3">
              Our system automatically sends you email updates every 2 days when your project is active, keeping you informed of progress without manual intervention.
            </p>
            <div className="flex items-center gap-2 text-xs text-[#D4A574]">
              <Settings className="w-3 h-3" />
              <span>Currently active for your projects</span>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Preferences */}
      <div className="bg-gradient-to-br from-[#1A1A2E] to-[#16213E] rounded-3xl border border-gray-700/50 p-6 shadow-xl">
        <h3 className="font-bold text-white text-lg mb-4">Contact Information</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <InfoField label="Email" value={contact.email} />
          <InfoField label="Phone" value={contact.phone || 'Not provided'} />
          <InfoField label="Secondary Email" value={contact.email_secondary || 'Not provided'} />
          <InfoField label="WhatsApp" value={contact.whatsapp_number || 'Not provided'} />
        </div>
        <p className="text-xs text-gray-500 mt-4">
          To update your contact information, please contact our support team at info@creativebooks.co.za
        </p>
      </div>
    </div>
  );
}

function ToggleRow({ label, description, enabled, onToggle, comingSoon }) {
  return (
    <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-xl border border-gray-700/30">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <p className="text-sm font-semibold text-white">{label}</p>
          {comingSoon && (
            <span className="text-[10px] px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded-full font-medium">
              Coming Soon
            </span>
          )}
        </div>
        <p className="text-xs text-gray-400">{description}</p>
      </div>
      <button
        onClick={onToggle}
        disabled={comingSoon}
        className={`relative w-12 h-6 rounded-full transition-colors ${
          enabled ? 'bg-[#B87333]' : 'bg-gray-700'
        } ${comingSoon ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <div
          className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
            enabled ? 'left-7' : 'left-1'
          }`}
        />
      </button>
    </div>
  );
}

function InfoField({ label, value }) {
  return (
    <div>
      <label className="text-xs font-semibold text-gray-400 mb-1 block">{label}</label>
      <p className="text-sm text-white bg-gray-800/50 rounded-lg px-3 py-2">{value}</p>
    </div>
  );
}