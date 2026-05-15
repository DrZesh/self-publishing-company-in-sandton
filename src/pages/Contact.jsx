import React, { useState, useRef } from 'react';
import PageMeta from '../components/shared/PageMeta';
import { motion } from 'framer-motion';
import { Phone, Mail, MapPin, Clock, Send, CheckCircle, Home, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';

const contactInfo = [
  { icon: Phone, label: 'Landline', value: '010 500 3331', href: 'tel:0105003331' },
  { icon: Phone, label: 'Cell Phone', value: '084 230 5393', href: 'tel:0842305393' },
  { icon: Mail, label: 'Email', value: 'info@creativebooks.co.za', href: 'mailto:info@creativebooks.co.za' },
  { icon: MapPin, label: 'Address', value: 'Prism Office Park, 1 Ruby Cl, Fourways, 2191', href: 'https://www.google.com/maps/search/?api=1&query=Prism+Office+Park+1+Ruby+Cl+Fourways+2191' },
  { icon: Clock, label: 'Hours', value: 'Mon–Fri: 8:00 AM – 5:00 PM' },
];

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', service: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const loadedAt = useRef(Date.now());

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      // Capture to admin database (non-blocking)
      base44.functions.invoke('captureFormSubmission', {
        formType: 'contact',
        fullName: form.name,
        email: form.email,
        phone: form.phone,
        message: form.message,
        sourcePage: window.location.pathname,
        serviceInterest: form.service ? [form.service] : [],
        additionalFields: { subject: form.subject },
        sessionDuration: Math.floor((Date.now() - loadedAt.current) / 1000),
      }).catch(err => console.error('Form capture failed:', err));

      // Send confirmation emails (primary action)
      await base44.functions.invoke('sendFormEmailResend', {
        formType: 'Contact Form',
        submitterName: form.name,
        submitterEmail: form.email,
        businessSubject: `New Contact Form Submission from ${form.name}`,
        userSubject: 'Thanks for reaching out to Creative Books SA',
        fields: [
                           ['Full Name', form.name],
                           ['Email Address', form.email],
                           ['Phone Number', form.phone],
                           ['Service Interested In', form.service],
                           ['Subject', form.subject],
                           ['Message', form.message],
                         ],
        pageUrl: 'https://www.creativebookssa.co.za/contact',
        honeypot: '',
        loadedAt: loadedAt.current,
      });
      setSubmitted(true);
    } catch (err) {
      setError('Something went wrong. Please try again or email us directly at info@creativebookssa.co.za');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <PageMeta
        title="Contact Creative Books SA | Publishing Help in Johannesburg"
        description="Get in touch with Creative Books SA for book publishing, editing, printing and cover design. Based in Johannesburg, serving all of South Africa."
        canonical="https://www.creativebookssa.co.za/contact"
      />
      {/* Hero */}
      <section className="relative pt-32 pb-20 bg-obsidian">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-2xl mx-auto">
            <span className="text-copper text-sm font-body tracking-[0.25em] uppercase mb-4 block">Contact Us</span>
            <h1 className="font-heading text-4xl md:text-5xl font-bold text-white mb-6">Contact Creative Books SA</h1>
            <p className="text-white/60 text-lg leading-relaxed font-body">
              Ready to discuss your publishing project? Our team in Johannesburg is here to help.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Grid */}
      <section className="py-20 bg-vellum">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
            {/* Info */}
            <div className="lg:col-span-2">
              <h2 className="font-heading text-2xl font-bold text-[#0F0F0F] mb-8">Contact Information</h2>
              <div className="space-y-6 mb-10">
                {contactInfo.map((item) => {
                  const Icon = item.icon;
                  const Wrapper = item.href ? 'a' : 'div';
                  return (
                    <Wrapper key={item.label} {...(item.href ? { href: item.href } : {})} className="flex items-start gap-4 group">
                      <div className="w-10 h-10 rounded-xl bg-copper/10 flex items-center justify-center shrink-0">
                        <Icon className="w-5 h-5 text-copper" />
                      </div>
                      <div>
                        <p className="text-sm text-[#0F0F0F]/50 font-body">{item.label}</p>
                        <p className="text-[#0F0F0F] font-body font-medium group-hover:text-copper transition-colors">{item.value}</p>
                      </div>
                    </Wrapper>
                  );
                })}
              </div>

            </div>

            {/* Form */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-2xl border border-[#0F0F0F]/5 shadow-sm p-8">
                {submitted ? (
                  <div className="text-center py-10">
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 180 }}
                      className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-5 border border-green-200">
                      <CheckCircle className="w-8 h-8 text-green-500" />
                    </motion.div>
                    <h3 className="font-heading text-2xl font-bold text-[#0F0F0F] mb-3">
                      Thanks, {form.name.split(' ')[0]}! Your message has been received.
                    </h3>
                    <p className="text-[#0F0F0F]/60 font-body mb-2 text-sm leading-relaxed max-w-sm mx-auto">
                      We'll be in touch within 24 hours during business days. We've also sent a confirmation to <strong>{form.email}</strong> — please check your inbox (and spam folder, just in case).
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center mt-7">
                      <Link to="/" className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-copper text-white rounded-full font-medium text-sm hover:bg-copper/90 transition-colors">
                        <Home className="w-4 h-4" /> Back to Home
                      </Link>
                      <Link to="/selfpublishingpackagesinsouthafrica" className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full font-medium text-sm text-[#0F0F0F]/60 hover:text-copper transition-colors" style={{ border: '1px solid rgba(0,0,0,0.12)' }}>
                        Explore Our Services <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className="text-sm font-body font-medium text-[#0F0F0F] mb-1.5 block">Full Name</label>
                        <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your name" required />
                      </div>
                      <div>
                        <label className="text-sm font-body font-medium text-[#0F0F0F] mb-1.5 block">Email</label>
                        <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@email.com" required />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                       <div>
                         <label className="text-sm font-body font-medium text-[#0F0F0F] mb-1.5 block">Phone</label>
                         <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+27..." />
                       </div>
                       <div>
                         <label className="text-sm font-body font-medium text-[#0F0F0F] mb-1.5 block">Service</label>
                         <Select value={form.service} onValueChange={(v) => setForm({ ...form, service: v })}>
                           <SelectTrigger><SelectValue placeholder="Select a service" /></SelectTrigger>
                           <SelectContent>
                             <SelectItem value="publishing">Book Publishing</SelectItem>
                             <SelectItem value="printing">Book Printing</SelectItem>
                             <SelectItem value="editing">Editing Services</SelectItem>
                             <SelectItem value="design">Design Services</SelectItem>
                             <SelectItem value="ebook">eBook Publishing</SelectItem>
                             <SelectItem value="ghostwriting">Ghostwriting</SelectItem>
                             <SelectItem value="other">Other</SelectItem>
                           </SelectContent>
                         </Select>
                       </div>
                     </div>
                     <div>
                       <label className="text-sm font-body font-medium text-[#0F0F0F] mb-1.5 block">Subject</label>
                       <Input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="What is this about?" required />
                     </div>
                    <div>
                      <label className="text-sm font-body font-medium text-[#0F0F0F] mb-1.5 block">Message</label>
                      <Textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Tell us about your project..." rows={5} required />
                    </div>
                    {error && (
                      <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 border border-red-200">
                        <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                        <p className="text-red-600 text-sm font-body">{error}</p>
                      </div>
                    )}
                    {/* Honeypot - hidden from real users */}
                    <input type="text" name="website" style={{ display: 'none' }} tabIndex={-1} autoComplete="off" />
                    <Button type="submit" disabled={submitting} className="w-full bg-copper hover:bg-copper/90 text-white py-3 rounded-full font-medium">
                      {submitting ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Sending...</> : 'Send Message'}
                    </Button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map */}
      <section className="py-20 bg-vellum">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-10">
            <h2 className="font-heading text-2xl font-bold text-[#0F0F0F] mb-2">Our Location</h2>
            <p className="text-[#0F0F0F]/60 font-body">Creative Books SA - Prism Office Park, Fourways</p>
          </motion.div>
          <div className="rounded-2xl overflow-hidden shadow-xl border border-[#0F0F0F]/10" style={{ height: '450px' }}>
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3581.942980532926!2d28.0061!3d-26.0167!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1e9574c8b5b5b5b5%3A0x5b5b5b5b5b5b5b5b!2sPrism%20Office%20Park%2C%201%20Ruby%20Cl%2C%20Fourways%2C%202191%2C%20South%20Africa!5e0!3m2!1sen!2sza!4v1234567890"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Creative Books SA Location"
            />
          </div>
        </div>
      </section>
    </div>
  );
}