import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Phone, Mail, MapPin, Clock, MessageCircle, Send } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import SectionHeading from '../components/shared/SectionHeading';

const contactInfo = [
  { icon: Phone, label: 'Phone', value: '+27 (0) 00 000 0000', href: 'tel:+27000000000' },
  { icon: Mail, label: 'Email', value: 'info@creativebookssa.co.za', href: 'mailto:info@creativebookssa.co.za' },
  { icon: MapPin, label: 'Address', value: 'Johannesburg, Gauteng, South Africa' },
  { icon: Clock, label: 'Hours', value: 'Mon–Fri: 8:00 AM – 5:00 PM' },
];

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', service: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div>
      {/* Hero */}
      <section className="relative pt-32 pb-20 bg-obsidian">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-2xl mx-auto">
            <span className="text-copper text-sm font-body tracking-[0.25em] uppercase mb-4 block">Contact Us</span>
            <h1 className="font-heading text-4xl md:text-5xl font-bold text-white mb-6">Get in Touch</h1>
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
              <a href="https://wa.me/27000000000" target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-full font-medium hover:bg-green-600 transition-colors">
                <MessageCircle className="w-4 h-4" /> Chat on WhatsApp
              </a>
            </div>

            {/* Form */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-2xl border border-[#0F0F0F]/5 shadow-sm p-8">
                {submitted ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 rounded-full bg-copper/10 flex items-center justify-center mx-auto mb-4">
                      <Send className="w-8 h-8 text-copper" />
                    </div>
                    <h3 className="font-heading text-2xl font-bold text-[#0F0F0F] mb-2">Message Sent!</h3>
                    <p className="text-[#0F0F0F]/60 font-body">We'll get back to you within 24 hours.</p>
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
                      <label className="text-sm font-body font-medium text-[#0F0F0F] mb-1.5 block">Message</label>
                      <Textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Tell us about your project..." rows={5} required />
                    </div>
                    <Button type="submit" className="w-full bg-copper hover:bg-copper/90 text-white py-3 rounded-full font-medium">
                      Send Message
                    </Button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map */}
      <section className="h-80 bg-[#1a1a1a] flex items-center justify-center">
        <div className="text-center">
          <MapPin className="w-10 h-10 text-copper mx-auto mb-3" />
          <p className="text-white/60 font-body">Johannesburg, Gauteng, South Africa</p>
        </div>
      </section>
    </div>
  );
}