import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Info } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PACKAGES, QUANTITY_MULTIPLIERS, TYPESETTING, COVER_DESIGN, formatZAR, getPrintingPrice } from '../../lib/calculator-pricing';

const PACKAGE_OPTIONS = [
  { group: 'Mini Packages (5 copies)', keys: ['mini_bronze','mini_silver','mini_gold'] },
  { group: 'Full A5 Packages', keys: ['a5_bronze','a5_silver','a5_gold'] },
  { group: 'Full 6x9 Packages', keys: ['6x9_bronze','6x9_silver','6x9_gold'] },
  { group: 'Ebook & Combo', keys: ['ebook','paperback','plus'] },
];

const INCLUDED_IN_PKG = new Set(['cover','typeset','editing']);

function Module({ id, icon, title, desc, on, onToggle, children, included }) {
  return (
    <div className={`rounded-xl border transition-all ${on ? 'border-copper/40 bg-white' : 'border-[#0F0F0F]/10 bg-white'} ${included ? 'opacity-60' : ''}`}>
      <button
        className="w-full flex items-center gap-3 p-4 text-left"
        onClick={() => !included && onToggle()}
        disabled={included}
      >
        <span className="text-xl flex-shrink-0">{icon}</span>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm text-[#0F0F0F]">{title}</div>
          <div className="text-xs text-[#0F0F0F]/50 truncate">{included ? '✓ Included in your package' : desc}</div>
        </div>
        {!included && (
          <div className={`w-10 h-6 rounded-full transition-colors flex-shrink-0 ${on ? 'bg-copper' : 'bg-[#0F0F0F]/15'}`}
            style={{ position: 'relative' }}>
            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${on ? 'left-5' : 'left-1'}`} />
          </div>
        )}
      </button>
      <AnimatePresence>
        {on && !included && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }} className="overflow-hidden">
            <div className="px-4 pb-4 pt-0 border-t border-[#0F0F0F]/5">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function TierButton({ label, price, sub, active, onClick }) {
  return (
    <button onClick={onClick}
      className={`p-3 rounded-xl border-2 text-left transition-all text-sm ${active ? 'border-copper bg-copper/8' : 'border-[#0F0F0F]/10 hover:border-copper/40'}`}>
      <div className="font-semibold text-[#0F0F0F]">{label}</div>
      <div className="text-copper font-bold text-xs mt-0.5">{price}</div>
      {sub && <div className="text-[#0F0F0F]/45 text-xs mt-0.5 leading-relaxed">{sub}</div>}
    </button>
  );
}

export default function ServiceModules({ book, services, updateService, addCustomItem }) {
  const [customForm, setCustomForm] = useState({ open: false, label: '', note: '' });

  const pkg = services.package;
  const included = (id) => pkg.on && pkg.key && INCLUDED_IN_PKG.has(id);
  const pkgIncludesPrint = pkg.on && pkg.key && PACKAGES[pkg.key]?.copies > 0;
  const pkgIncludesEbook = pkg.on && pkg.key && ['a5_gold','6x9_gold','plus'].includes(pkg.key);

  return (
    <div className="space-y-3">
      <h2 className="font-heading text-lg font-bold text-[#0F0F0F]">Services</h2>

      {/* MODULE A — Publishing Package */}
      <Module id="package" icon="📦" title="Publishing Package"
        desc="Save 20–40% vs buying services individually."
        on={services.package.on} onToggle={() => updateService('package', { on: !services.package.on, key: services.package.key })}>
        <div className="mt-3 space-y-3">
          {PACKAGE_OPTIONS.map(group => (
            <div key={group.group}>
              <div className="text-xs font-semibold text-[#0F0F0F]/40 uppercase tracking-wider mb-1.5">{group.group}</div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {group.keys.map(k => {
                  const p = PACKAGES[k];
                  return (
                    <TierButton key={k}
                      label={p.label}
                      price={formatZAR(p.price)}
                      sub={`${p.copies > 0 ? p.copies + ' copies · ' : ''}up to ${p.maxPages}pp / ${(p.maxWords/1000).toFixed(0)}K words`}
                      active={services.package.key === k}
                      onClick={() => updateService('package', { on: true, key: k })}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </Module>

      {/* MODULE B — Cover Design */}
      <Module id="cover" icon="🎨" title="Cover Design"
        desc="Professional book cover — front, spine, back."
        on={services.cover.on} onToggle={() => updateService('cover', { on: !services.cover.on })}
        included={included('cover')}>
        <div className="mt-3 space-y-3">
          <div>
            <div className="text-xs font-semibold text-[#0F0F0F]/50 mb-2">Cover Type</div>
            <div className="flex gap-2">
              {[{ v:'paperback', l:'Paperback (front+spine+back)'},{ v:'ebook', l:'Ebook (front only)'}].map(o => (
                <button key={o.v} onClick={() => updateService('cover', { variant: o.v })}
                  className={`px-3 py-1.5 text-xs rounded-lg border transition-all ${services.cover.variant === o.v ? 'border-copper bg-copper/10 text-copper' : 'border-[#0F0F0F]/10 text-[#0F0F0F]/60'}`}>
                  {o.l}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {[
              { key:'authors',     label:"Author's Cover",   sub:'2 concepts, mockups, 3 revisions' },
              { key:'stock',       label:'Stock Design',      sub:'Photo-based, print-ready PDF + bleed' },
              { key:'illustrated', label:'Illustrated',       sub:'Custom illustration, full artwork' },
            ].map(t => {
              const price = COVER_DESIGN[services.cover.variant]?.[t.key] || 0;
              return <TierButton key={t.key} label={t.label} price={formatZAR(price)} sub={t.sub}
                active={services.cover.tier === t.key}
                onClick={() => updateService('cover', { tier: t.key })} />;
            })}
          </div>
        </div>
      </Module>

      {/* MODULE C — Typesetting */}
      <Module id="typeset" icon="📄" title="Typesetting / Layout"
        desc={`Layout & formatting — from R${TYPESETTING.basic}/page.`}
        on={services.typeset.on} onToggle={() => updateService('typeset', { on: !services.typeset.on })}
        included={included('typeset')}>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2">
          {[
            { key:'basic',    label:'Basic Layout',    price:`R ${TYPESETTING.basic}/page`,    sub:'Clean formatting, chapter headings' },
            { key:'standard', label:'Standard Layout', price:`R ${TYPESETTING.standard}/page`, sub:'Drop caps, headers, images, source file' },
            { key:'premium',  label:'Premium Layout',  price:`R ${TYPESETTING.premium}/page`,  sub:'Full design, custom elements, premium finish' },
          ].map(t => (
            <TierButton key={t.key} label={t.label} price={t.price} sub={t.sub}
              active={services.typeset.tier === t.key}
              onClick={() => updateService('typeset', { tier: t.key })} />
          ))}
        </div>
        {book.pages > 0 && (
          <div className="mt-3 text-xs text-[#0F0F0F]/50">
            For {book.pages} pages: <span className="font-semibold text-copper">{formatZAR(Math.round(book.pages * TYPESETTING[services.typeset.tier]))}</span>
          </div>
        )}
      </Module>

      {/* MODULE D — Printing */}
      <Module id="print" icon="📚" title="Book Printing"
        desc="100+ copies, cream or white paper, perfect bind."
        on={services.print.on} onToggle={() => updateService('print', { on: !services.print.on })}
        included={pkgIncludesPrint}>
        <div className="mt-3 space-y-4">
          <div>
            <div className="text-xs font-semibold text-[#0F0F0F]/50 mb-2">Number of Copies</div>
            <div className="flex flex-wrap gap-2">
              {Object.keys(QUANTITY_MULTIPLIERS).map(q => (
                <button key={q} onClick={() => updateService('print', { copies: Number(q) })}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${services.print.copies === Number(q) ? 'border-copper bg-copper text-white' : 'border-[#0F0F0F]/10 text-[#0F0F0F]/60 hover:border-copper/40'}`}>
                  {q}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="text-xs font-semibold text-[#0F0F0F]/50 mb-2">Paper Type</div>
            <div className="flex gap-2">
              {[{ v:'cream', l:'Cream paper (standard)'},{ v:'white', l:'White paper (request quote)'}].map(o => (
                <button key={o.v} onClick={() => updateService('print', { paperType: o.v })}
                  className={`px-3 py-1.5 text-xs rounded-lg border transition-all ${services.print.paperType === o.v ? 'border-copper bg-copper/10 text-copper' : 'border-[#0F0F0F]/10 text-[#0F0F0F]/60'}`}>
                  {o.l}
                </button>
              ))}
            </div>
          </div>
          {book.pages > 0 && services.print.paperType === 'cream' && (() => {
            const r = getPrintingPrice(book.size === '6x9' ? '6x9' : 'a5', book.pages, services.print.copies);
            if (!r) return <div className="text-xs text-amber-600 mt-1">Page count out of standard range — custom quote required.</div>;
            return (
              <div className="text-xs text-[#0F0F0F]/50">
                {services.print.copies} copies: <span className="font-semibold text-copper">{formatZAR(r.total)}</span>
                <span className="ml-2">({formatZAR(r.perCopy)}/copy)</span>
                {services.print.copies > 100 && (
                  <div className="mt-1 text-[#0F0F0F]/40">Estimate for orders above 100 copies. Larger orders qualify for better rates — request a custom quote for exact figures.</div>
                )}
              </div>
            );
          })()}
        </div>
      </Module>

      {/* MODULE E — Ebook Add-on */}
      {!pkgIncludesEbook && (
        <Module id="ebook" icon="📱" title="Ebook Add-on"
          desc="Amazon Kindle-ready ebook formatting (R 6,500)."
          on={services.ebook.on} onToggle={() => updateService('ebook', { on: !services.ebook.on })}>
          <div className="mt-3 text-sm text-[#0F0F0F]/60">
            Formatted for Amazon KDP. Includes cover thumbnail and metadata setup. <span className="text-copper font-semibold">R 6,500</span>
          </div>
        </Module>
      )}

      {/* MODULE F — Editing */}
      <Module id="editing" icon="✏️" title="Standalone Editing"
        desc="Editing is included free in all packages."
        on={services.editing.on} onToggle={() => updateService('editing', { on: !services.editing.on })}
        included={included('editing')}>
        <div className="mt-3 p-3 bg-[#F9F7F2] rounded-lg text-sm text-[#0F0F0F]/60">
          Editing pricing varies by manuscript length and type. We'll confirm pricing in your formal quote.
          <Link to="/getquote" className="ml-2 text-copper font-semibold hover:underline">Request a quote →</Link>
        </div>
      </Module>

      {/* MODULE G — Additional Services */}
      <div className="rounded-xl border border-[#0F0F0F]/10 bg-white p-4">
        <div className="font-semibold text-sm text-[#0F0F0F] mb-3">➕ Additional Services</div>
        <div className="flex flex-wrap gap-2">
          {['Ghostwriting','Hardcover','Children\'s Book Illustration','Author Website','Book Launch','Marketing'].map(s => {
            const exists = services.custom.some(c => c.label === s);
            return (
              <button key={s}
                onClick={() => { if (!exists) addCustomItem(s, 'Custom Quote Required'); }}
                disabled={exists}
                className={`px-3 py-1.5 text-xs rounded-lg border transition-all ${
                  exists ? 'border-copper/40 bg-copper/10 text-copper' : 'border-[#0F0F0F]/10 text-[#0F0F0F]/60 hover:border-copper/40'
                }`}>
                {exists ? `✓ ${s}` : `+ ${s}`}
              </button>
            );
          })}
        </div>

        <div className="mt-3">
          {!customForm.open ? (
            <button onClick={() => setCustomForm({ open: true, label: '', note: '' })}
              className="text-xs text-copper hover:underline">+ Add custom service</button>
          ) : (
            <div className="space-y-2 mt-1">
              <input value={customForm.label} onChange={e => setCustomForm(f => ({ ...f, label: e.target.value }))}
                placeholder="Service name" className="w-full px-3 py-2 text-xs border rounded-lg focus:outline-none focus:border-copper" />
              <input value={customForm.note} onChange={e => setCustomForm(f => ({ ...f, note: e.target.value }))}
                placeholder="Brief description (optional)" className="w-full px-3 py-2 text-xs border rounded-lg focus:outline-none focus:border-copper" />
              <div className="flex gap-2">
                <button onClick={() => { if (customForm.label) { addCustomItem(customForm.label, customForm.note); setCustomForm({ open: false, label: '', note: '' }); }}}
                  className="px-3 py-1.5 bg-copper text-white text-xs rounded-lg font-medium">Add to quote</button>
                <button onClick={() => setCustomForm({ open: false, label: '', note: '' })}
                  className="px-3 py-1.5 border text-xs rounded-lg">Cancel</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}