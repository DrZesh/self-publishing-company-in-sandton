// Optional: the restyled admin sidebar from concept A. Use it, or keep your current one.
import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import cfg from './dashboard.config.js';
import Icon from './Icons.jsx';

const GROUPS = [
  { label: null, items: [['dashboard', 'Dashboard', 'dashboard']] },
  { label: 'CRM', items: [['submissions', 'Submissions', 'inbox', 'submissions', 'red'], ['leads', 'Leads', 'target', 'leads', 'amber'], ['clients', 'Clients / Contacts', 'users'], ['pipeline', 'Pipeline', 'columns'], ['tasks', 'Tasks', 'check'], ['followUps', 'Follow-ups', 'zap', 'followUps', 'red'], ['leadScoring', 'Lead Scoring', 'star']] },
  { label: 'Finance', items: [['quotes', 'Quotes', 'file'], ['invoices', 'Invoices', 'receipt'], ['payments', 'Payments', 'card']] },
  { label: 'Documents · Team', items: [['docLibrary', 'Doc Library', 'folder'], ['eSignatures', 'E-Signatures', 'pen'], ['users', 'User Management', 'user']] },
];

export default function Sidebar({ counts = {}, user = { name: 'Admin', role: 'Admin' }, logoUrl = '/creative-books-logo.png', onLogout }) {
  const [open, setOpen] = useState(false);
  const badge = (n) => (n > 99 ? '99+' : String(n));
  return (
    <nav className={`mc-side ${open ? 'open' : ''}`} aria-label="Main">
      <div className="mc-side-in">
      <div className="mc-brand">
        <span className="mc-logo"><img src={logoUrl} alt="" /></span>
        <span><b>Creative Books SA</b><small>BUSINESS PORTAL</small></span>
        <button type="button" className="mc-menu-btn" aria-label="Menu" aria-expanded={open} onClick={() => setOpen(!open)}><Icon name="menu" /></button>
      </div>
      <div className="mc-nav">
        {GROUPS.map((g) => (
          <React.Fragment key={g.label || 'top'}>
            {g.label && <div className="mc-nav-group">{g.label.toUpperCase()}</div>}
            {g.items.map(([route, label, icon, countKey, tone]) => (
              <NavLink key={route} to={cfg.routes[route]} end className={({ isActive }) => `mc-nav-item ${isActive ? 'on' : ''}`} onClick={() => setOpen(false)}>
                <Icon name={icon} />{label}
                {countKey && counts[countKey] > 0 && <span className={`mc-count ${tone}`}>{badge(counts[countKey])}</span>}
              </NavLink>
            ))}
          </React.Fragment>
        ))}
      </div>
      <div className="mc-me">
        <span className="mc-avatar">{user.name.split(' ').map((w) => w[0]).slice(0, 2).join('')}</span>
        <span className="mc-me-txt"><b>{user.name}</b><small>{user.role}</small></span>
        {onLogout && <button type="button" className="mc-icon-btn sm" aria-label="Log out" onClick={onLogout}><Icon name="logout" size={16} /></button>}
      </div>
      </div>
    </nav>
  );
}
