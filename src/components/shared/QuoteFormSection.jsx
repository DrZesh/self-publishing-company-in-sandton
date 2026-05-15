import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, CheckCircle, AlertCircle } from 'lucide-react';

export default function QuoteFormSection({ title = "Quick Quote Request", services = [], description = "" }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    services: services.length > 0 ? [services[0]?.value] : [],
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleServiceToggle = (serviceValue) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.includes(serviceValue)
        ? prev.services.filter(s => s !== serviceValue)
        : [...prev.services, serviceValue]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!formData.name || !formData.email || !formData.phone || formData.services.length === 0) {
      setError('Please fill in all required fields and select at least one service.');
      setLoading(false);
      return;
    }

    try {
      const selectedServices = services
        .filter(s => formData.services.includes(s.value))
        .map(s => s.label)
        .join(', ');

      const emailBody = `Hi Creative Books SA,

I'm interested in the following services: ${selectedServices}

${formData.message ? `Additional Details:\n${formData.message}\n` : ''}

Please contact me with more information and a quote.

Contact Information:
Name: ${formData.name}
Email: ${formData.email}
Phone: ${formData.phone}

Thank you,
${formData.name}`;

      const response = await fetch('/api/sendFormEmail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: 'info@creativebookssa.co.za',
          subject: `Quote Request: ${selectedServices}`,
          body: emailBody,
          fromName: formData.name,
          replyTo: formData.email,
        }),
      });

      if (response.ok) {
        // Send confirmation to user
        await fetch('/api/sendFormEmail', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: formData.email,
            subject: 'Quote Request Received — Creative Books SA',
            body: `Hi ${formData.name},\n\nThank you for your quote request for ${selectedServices}. We've received your inquiry and will get back to you within 24 hours.\n\nBest regards,\nCreative Books SA Team`,
            fromName: 'Creative Books SA',
          }),
        });

        setSuccess(true);
        setFormData({ name: '', email: '', phone: '', services: services.length > 0 ? [services[0]?.value] : [], message: '' });
        setTimeout(() => setSuccess(false), 5000);
      } else {
        setError('Failed to send quote request. Please try again.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-16 lg:py-20 bg-vellum">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white rounded-2xl p-8 lg:p-12 shadow-lg"
        >
          <h2 className="font-heading text-3xl font-bold text-[#0F0F0F] mb-2">{title}</h2>
          {description && <p className="text-[#0F0F0F]/60 font-body mb-8">{description}</p>}

          {success ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex gap-3 p-4 rounded-lg bg-green-50 border border-green-200"
            >
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
              <div>
                <p className="font-medium text-green-900">Request Sent!</p>
                <p className="text-sm text-green-800">We'll contact you within 24 hours with a quote.</p>
              </div>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Services Selection */}
              {services.length > 0 && (
                <div>
                  <label className="block text-sm font-semibold text-[#0F0F0F] mb-3">Services Needed *</label>
                  <div className="space-y-2">
                    {services.map(service => (
                      <label key={service.value} className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-copper/5 transition-all" style={{ borderColor: formData.services.includes(service.value) ? '#B87333' : '#0F0F0F10' }}>
                        <input
                          type="checkbox"
                          checked={formData.services.includes(service.value)}
                          onChange={() => handleServiceToggle(service.value)}
                          className="w-4 h-4 accent-copper"
                        />
                        <span className="text-sm text-[#0F0F0F]/80 font-body">{service.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Contact Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#0F0F0F]/80 mb-2">Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Your name"
                    className="w-full p-3 border border-[#0F0F0F]/10 rounded-lg font-body bg-white focus:border-copper focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#0F0F0F]/80 mb-2">Email *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="your@email.com"
                    className="w-full p-3 border border-[#0F0F0F]/10 rounded-lg font-body bg-white focus:border-copper focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#0F0F0F]/80 mb-2">Phone *</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+27 123 456 7890"
                  className="w-full p-3 border border-[#0F0F0F]/10 rounded-lg font-body bg-white focus:border-copper focus:outline-none"
                />
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-medium text-[#0F0F0F]/80 mb-2">Additional Details</label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Tell us about your project (optional)"
                  rows="4"
                  className="w-full p-3 border border-[#0F0F0F]/10 rounded-lg font-body bg-white focus:border-copper focus:outline-none"
                />
              </div>

              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-2 p-3 rounded-lg bg-red-50 border border-red-200"
                >
                  <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-800">{error}</p>
                </motion.div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-copper text-white font-medium rounded-full hover:bg-copper/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Sending...' : <>Request Quote <Send className="w-4 h-4" /></>}
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </section>
  );
}