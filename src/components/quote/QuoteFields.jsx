import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function Field({ label, error, required, children }) {
  return (
    <div>
      <label className="block text-sm font-body font-medium text-[#0F0F0F] mb-1.5">
        {label} {required && <span className="text-copper">*</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-red-500 font-body">{error}</p>}
    </div>
  );
}

export function TextInput({ value, onChange, placeholder, type = 'text', error, ...props }) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`w-full px-4 py-3 rounded-xl border text-sm font-body text-[#0F0F0F] bg-[#F9F7F2] outline-none transition-all
        ${error ? 'border-red-400 focus:border-red-400' : 'border-[#0F0F0F]/10 focus:border-copper'}`}
      {...props}
    />
  );
}

export function SelectInput({ value, onChange, options, placeholder, error }) {
  return (
    <Select value={value || undefined} onValueChange={onChange}>
      <SelectTrigger
        className={`w-full h-auto px-4 py-3 rounded-xl border text-sm font-body bg-[#F9F7F2] outline-none transition-all
          ${error ? 'border-red-400 focus:border-red-400' : 'border-[#0F0F0F]/10 focus:border-copper'}
          ${!value ? 'text-[#0F0F0F]/40' : 'text-[#0F0F0F]'}`}
      >
        <SelectValue placeholder={placeholder || 'Select an option'} />
      </SelectTrigger>
      <SelectContent>
        {options.map(opt => (
          <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function RadioGroup({ value, onChange, options, error }) {
  return (
    <div className={`flex flex-wrap gap-3 ${error ? 'ring-1 ring-red-400 rounded-xl p-2' : ''}`}>
      {options.map(opt => (
        <label
          key={opt.value}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border cursor-pointer transition-all text-sm font-body
            ${value === opt.value
              ? 'border-copper bg-copper/5 text-copper font-medium'
              : 'border-[#0F0F0F]/10 text-[#0F0F0F]/70 hover:border-copper/40'}`}
        >
          <input
            type="radio"
            className="sr-only"
            checked={value === opt.value}
            onChange={() => onChange(opt.value)}
          />
          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0
            ${value === opt.value ? 'border-copper' : 'border-[#0F0F0F]/30'}`}>
            {value === opt.value && <div className="w-2 h-2 rounded-full bg-copper" />}
          </div>
          {opt.label}
        </label>
      ))}
    </div>
  );
}

export function StepHeading({ title, description }) {
  return (
    <div className="mb-6">
      <h2 className="font-heading text-xl md:text-2xl font-bold text-[#0F0F0F]">{title}</h2>
      {description && <p className="text-sm text-[#0F0F0F]/50 font-body mt-1">{description}</p>}
    </div>
  );
}