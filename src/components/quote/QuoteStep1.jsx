import React from 'react';
import { Field, TextInput, SelectInput, StepHeading } from './QuoteFields';

const provinces = [
  { value: 'Gauteng', label: 'Gauteng' },
  { value: 'Western Cape', label: 'Western Cape' },
  { value: 'KwaZulu-Natal', label: 'KwaZulu-Natal' },
  { value: 'Eastern Cape', label: 'Eastern Cape' },
  { value: 'Free State', label: 'Free State' },
  { value: 'Limpopo', label: 'Limpopo' },
  { value: 'Mpumalanga', label: 'Mpumalanga' },
  { value: 'North West', label: 'North West' },
  { value: 'Northern Cape', label: 'Northern Cape' },
];

export default function QuoteStep1({ data, update, errors }) {
  return (
    <div>
      <StepHeading title="Your Details" description="Tell us about yourself so we can prepare your quote." />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Field label="First Name" required error={errors.firstName}>
          <TextInput value={data.firstName} onChange={v => update({ firstName: v })} placeholder="Jane" error={errors.firstName} />
        </Field>
        <Field label="Last Name" required error={errors.lastName}>
          <TextInput value={data.lastName} onChange={v => update({ lastName: v })} placeholder="Smith" error={errors.lastName} />
        </Field>
        <Field label="Email Address" required error={errors.email}>
          <TextInput type="email" value={data.email} onChange={v => update({ email: v })} placeholder="jane@email.com" error={errors.email} />
        </Field>
        <Field label="Confirm Email Address" required error={errors.confirmEmail}>
          <TextInput type="email" value={data.confirmEmail} onChange={v => update({ confirmEmail: v })} placeholder="jane@email.com" error={errors.confirmEmail} />
        </Field>
        <Field label="Contact Number" required error={errors.phone}>
          <TextInput value={data.phone} onChange={v => update({ phone: v })} placeholder="+27 81 000 0000" error={errors.phone} />
        </Field>
        <Field label="Physical Address" required error={errors.address}>
          <TextInput value={data.address} onChange={v => update({ address: v })} placeholder="123 Main Street" error={errors.address} />
        </Field>
        <Field label="City" required error={errors.city}>
          <TextInput value={data.city} onChange={v => update({ city: v })} placeholder="Johannesburg" error={errors.city} />
        </Field>
        <Field label="Province" required error={errors.province}>
          <SelectInput value={data.province} onChange={v => update({ province: v })} options={provinces} placeholder="Select province" error={errors.province} />
        </Field>
        <Field label="Postal Code" required error={errors.postalCode}>
          <TextInput value={data.postalCode} onChange={v => update({ postalCode: v })} placeholder="2000" error={errors.postalCode} />
        </Field>
      </div>
    </div>
  );
}