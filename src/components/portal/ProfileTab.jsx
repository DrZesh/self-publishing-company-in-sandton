import React from 'react';
import { Users, Building2, Mail, Phone, MapPin, Calendar, Star, TrendingUp, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ProfileTab({ contact = {}, projects = [] }) {
  const roleIcons = {
    author: Star,
    publisher: Building2,
    agent: Users,
    other: Users,
  };

  const RoleIcon = roleIcons[contact?.role] || Users;

  const pipelineStages = [
    'New Enquiry',
    'Information Requested',
    'Quote in Progress',
    'Quote Sent',
    'Payment Pending',
    'Project Started',
    'Editing',
    'Cover Design',
    'Typesetting',
    'Sample Queued',
    'Sample Approved',
    'Mass Production',
    'Completed',
    'Delivered',
  ];

  const currentStageIndex = pipelineStages.indexOf(contact?.pipeline_stage);

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="bg-gradient-to-br from-[#1A1A2E] to-[#16213E] rounded-3xl border border-[#B87333]/20 p-8 shadow-xl">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-gradient-to-br from-[#B87333] to-[#D4A574] rounded-2xl flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-[#B87333]/30">
              {contact?.full_name?.charAt(0) || 'C'}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">{contact?.full_name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <RoleIcon className="w-4 h-4 text-[#D4A574]" />
                <span className="text-sm text-gray-400 capitalize">{contact?.role || 'Client'}</span>
                {contact?.is_vip && (
                  <span className="text-xs px-2 py-1 bg-[#B87333]/20 text-[#D4A574] rounded-full font-semibold">
                    VIP Client
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-400">Client Since</p>
            <p className="text-lg font-bold text-white">
              {contact?.first_contact_date 
                ? new Date(contact.first_contact_date).toLocaleDateString('en-ZA', { month: 'long', year: 'numeric' })
                : 'N/A'}
            </p>
          </div>
        </div>

        {/* Contact Information */}
        <div className="grid md:grid-cols-2 gap-4">
          <InfoField icon={Mail} label="Primary Email" value={contact?.email} />
          <InfoField icon={Phone} label="Phone Number" value={contact?.phone} />
          <InfoField icon={Mail} label="Secondary Email" value={contact?.email_secondary} />
          <InfoField icon={Phone} label="WhatsApp" value={contact?.whatsapp_number} />
          <InfoField icon={Building2} label="Company" value={contact?.company} />
          <InfoField icon={Users} label="Contact Person" value={contact?.contact_person} />
        </div>

        {/* Address */}
        {contact?.street_address && (
          <div className="mt-4 p-4 bg-gray-800/30 rounded-xl border border-gray-700/30">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-4 h-4 text-[#D4A574]" />
              <p className="text-sm font-semibold text-white">Address</p>
            </div>
            <p className="text-sm text-gray-400">
              {[contact.street_address, contact.city, contact.province, contact.postal_code, contact.country]
                .filter(Boolean)
                .join(', ')}
            </p>
          </div>
        )}
      </div>

      {/* Pipeline Stage */}
      {contact?.pipeline_stage && (
        <div className="bg-gradient-to-br from-[#1A1A2E] to-[#16213E] rounded-3xl border border-gray-700/50 p-6 shadow-xl">
          <h3 className="font-bold text-white text-lg mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#D4A574]" />
            Current Stage: {contact.pipeline_stage}
          </h3>
          
          <div className="relative">
            <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-[#B87333] to-[#D4A574] rounded-full transition-all duration-500"
                style={{ width: `${((currentStageIndex + 1) / pipelineStages.length) * 100}%` }}
              />
            </div>
            <p className="text-xs text-gray-400 mt-2">
              Stage {currentStageIndex + 1} of {pipelineStages.length}
            </p>
          </div>

          {contact.pipeline_stage_changed_at && (
            <p className="text-xs text-gray-500 mt-2">
              Updated: {new Date(contact.pipeline_stage_changed_at).toLocaleDateString('en-ZA')}
            </p>
          )}
        </div>
      )}

      {/* Book Details */}
      {contact?.book_title && (
        <div className="bg-gradient-to-br from-[#1A1A2E] to-[#16213E] rounded-3xl border border-gray-700/50 p-6 shadow-xl">
          <h3 className="font-bold text-white text-lg mb-4">Book Information</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <InfoField label="Book Title" value={contact.book_title} />
            <InfoField label="Package Type" value={contact.package_type} />
            <InfoField label="Pipeline Value" value={contact.pipeline_value ? `R ${contact.pipeline_value.toLocaleString()}` : 'N/A'} />
            <InfoField label="Expected Close Date" value={contact.expected_close_date ? new Date(contact.expected_close_date).toLocaleDateString('en-ZA') : 'N/A'} />
          </div>
          {contact.author_bio && (
            <div className="mt-4">
              <label className="text-xs font-semibold text-gray-400 mb-2 block">Author Bio</label>
              <p className="text-sm text-gray-300 bg-gray-800/30 rounded-lg p-4">{contact.author_bio}</p>
            </div>
          )}
        </div>
      )}

      {/* Projects Summary */}
      {projects && projects.length > 0 && (
        <div className="bg-gradient-to-br from-[#1A1A2E] to-[#16213E] rounded-3xl border border-gray-700/50 p-6 shadow-xl">
          <h3 className="font-bold text-white text-lg mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#D4A574]" />
            Your Projects ({projects.length})
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            {projects.map(project => (
              <div key={project.id} className="p-4 bg-gray-800/30 rounded-xl border border-gray-700/30">
                <h4 className="font-semibold text-white mb-2">{project.book_title}</h4>
                <div className="space-y-1 text-sm">
                  <p className="text-gray-400">
                    <span className="text-gray-500">Service:</span> {project.service_type}
                  </p>
                  <p className="text-gray-400">
                    <span className="text-gray-500">Stage:</span> {project.stage}
                  </p>
                  {project.deadline && (
                    <p className="text-orange-400 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      Deadline: {new Date(project.deadline).toLocaleDateString('en-ZA')}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Additional Information */}
      {contact?.tags && contact.tags.length > 0 && (
        <div className="bg-gradient-to-br from-[#1A1A2E] to-[#16213E] rounded-3xl border border-gray-700/50 p-6 shadow-xl">
          <h3 className="font-bold text-white text-lg mb-4">Tags</h3>
          <div className="flex flex-wrap gap-2">
            {contact.tags.map((tag, i) => (
              <span key={i} className="px-3 py-1 bg-[#B87333]/20 text-[#D4A574] rounded-full text-sm font-medium">
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Contact Support CTA */}
      <div className="bg-gradient-to-r from-[#B87333]/20 to-[#D4A574]/10 rounded-3xl border border-[#B87333]/30 p-6 text-center">
        <h3 className="font-bold text-white text-lg mb-2">Need to Update Your Information?</h3>
        <p className="text-sm text-gray-400 mb-4">
          Contact our support team to update your profile details, contact information, or book specifications.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <a href="mailto:info@creativebooks.co.za" className="px-6 py-3 bg-[#B87333] hover:bg-[#A06828] text-white rounded-xl font-semibold transition-colors">
            Email Support
          </a>
          <a href="tel:0842305393" className="px-6 py-3 border-2 border-[#B87333] text-[#D4A574] hover:bg-[#B87333]/10 rounded-xl font-semibold transition-colors">
            Call 084 230 5393
          </a>
        </div>
      </div>
    </div>
  );
}

function InfoField({ icon: Icon, label, value }) {
  return (
    <div className="p-4 bg-gray-800/30 rounded-xl border border-gray-700/30">
      {Icon && (
        <div className="flex items-center gap-2 mb-2">
          <Icon className="w-4 h-4 text-[#D4A574]" />
          <p className="text-xs font-semibold text-gray-400">{label}</p>
        </div>
      )}
      {!Icon && <p className="text-xs font-semibold text-gray-400 mb-2">{label}</p>}
      <p className="text-sm text-white">{value || 'Not provided'}</p>
    </div>
  );
}