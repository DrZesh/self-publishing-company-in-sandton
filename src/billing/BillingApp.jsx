// The CRM side of Quote to Cash. Mount at /billing/* (see INSTALL.md).
import React from 'react';
import { Routes, Route, Navigate, Link } from 'react-router-dom';
import './billing.css';
import { BillingProvider } from './components.jsx';
import { DealsList, ClientsList, QuotesList, InvoicesList, PaymentsList, ProjectsList } from './pages/Lists.jsx';
import ClientForm from './pages/ClientForm.jsx';
import QuoteEditor from './pages/QuoteEditor.jsx';
import { QuoteView } from './pages/Quote.jsx';
import { InvoiceView, RecordPayment } from './pages/Invoice.jsx';
import { SendDocument } from './pages/SendDocument.jsx';
import EmailTemplates from './pages/EmailTemplates.jsx';
import ProjectView from './pages/Project.jsx';

export default function BillingApp() {
  return (
    <div className="cb-root">
      <BillingProvider>
        <div className="cb-help cb-no-print" style={{padding:'12px 20px'}}>Previous records: <Link to="/admin/previous-quotes">Quotes</Link> · <Link to="/admin/previous-invoices">Invoices</Link> · <Link to="/admin/previous-payments">Payments</Link>. Existing documents and client links are retained. New documents use this workflow.</div>
        <Routes>
          <Route index element={<DealsList />} />
          <Route path="clients" element={<ClientsList />} />
          <Route path="clients/new" element={<ClientForm />} />
          <Route path="clients/:id/edit" element={<ClientForm />} />
          <Route path="quotes" element={<QuotesList />} />
          <Route path="quotes/new" element={<QuoteEditor />} />
          <Route path="quotes/:id" element={<QuoteView />} />
          <Route path="quotes/:id/edit" element={<QuoteEditor />} />
          <Route path="quotes/:id/send" element={<SendDocument kind="quote" />} />
          <Route path="invoices" element={<InvoicesList />} />
          <Route path="invoices/:id" element={<InvoiceView />} />
          <Route path="invoices/:id/send" element={<SendDocument kind="invoice" />} />
          <Route path="invoices/:id/pay" element={<RecordPayment />} />
          <Route path="payments" element={<PaymentsList />} />
          <Route path="templates" element={<EmailTemplates />} />
          <Route path="projects" element={<ProjectsList />} />
          <Route path="projects/:id" element={<ProjectView />} />
          <Route path="*" element={<Navigate to="" replace />} />
        </Routes>
      </BillingProvider>
    </div>
  );
}
