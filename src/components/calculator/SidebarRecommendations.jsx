import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb } from 'lucide-react';
import { PACKAGES, PACKAGE_UPGRADES, formatZAR } from '../../lib/calculator-pricing';

export default function SidebarRecommendations({ calcState, addCustomItem }) {
  const { lines, total, inclVat } = calcState;
  const book = calcState.book || {};
  const svcs = calcState.services || {};
  const pkg = svcs.package || {};
  const recs = [];

  // Rule 1 — package switch: cover + typeset + print individually > comparable package
  if (!pkg.on) {
    const hasCover = svcs.cover?.on;
    const hasTypeset = svcs.typeset?.on;
    const hasPrint = svcs.print?.on && svcs.print?.copies <= 100;
    if (hasCover && hasTypeset && hasPrint) {
      const bronzeKey = book.size === '6x9' ? '6x9_bronze' : 'a5_bronze';
      const bronze = PACKAGES[bronzeKey];
      if (total > bronze.price) {
        recs.push({
          id: 'rule1',
          icon: '💡',
          text: `Save ${formatZAR(total - bronze.price)} with ${bronze.label}`,
          sub: `Your selected services total ${formatZAR(total)}. The ${bronze.label} includes all of these PLUS more for ${formatZAR(bronze.price)}.`,
          action: 'Switch to Package',
          onAction: () => {}, // handled by parent via updateService — simplified here
        });
      }
    }
  }

  // Rule 2 — missing cover when printing
  if (svcs.print?.on && !svcs.cover?.on && !pkg.on) {
    recs.push({
      id: 'rule2',
      icon: '🎨',
      text: 'Most printed books need a custom cover',
      sub: `Add Stock Design Cover (${formatZAR(2150)})`,
      action: 'Add Cover Design',
      onAction: () => {}, // parent toggles this via updateService
    });
  }

  // Rule 3 — missing printing when cover + typeset selected
  if (svcs.cover?.on && svcs.typeset?.on && !svcs.print?.on && !pkg.on) {
    recs.push({
      id: 'rule3',
      icon: '📚',
      text: 'Planning to print copies?',
      sub: `Adding 100 copies starts at ${formatZAR(5500)}.`,
      action: 'Add Printing',
      onAction: () => {},
    });
  }

  // Rule 4 — manuscript exceeds package limit
  if (pkg.on && pkg.key) {
    const p = PACKAGES[pkg.key];
    const exceedsPages = book.pages > p.maxPages;
    const exceedsWords = book.words > p.maxWords;
    if ((exceedsPages || exceedsWords) && PACKAGE_UPGRADES[pkg.key]) {
      const nextKey = PACKAGE_UPGRADES[pkg.key];
      const next = PACKAGES[nextKey];
      recs.push({
        id: 'rule4',
        icon: '⚠️',
        text: `Manuscript exceeds ${p.label} limit`,
        sub: `Your book (${book.pages} pages / ${(book.words||0).toLocaleString()} words) exceeds the ${p.label} limit (${p.maxPages} pages / ${p.maxWords.toLocaleString()} words). Consider ${next.label} (${formatZAR(next.price)}).`,
        action: `Upgrade to ${next.label}`,
        onAction: () => {},
        nextKey,
      });
    }
  }

  if (recs.length === 0) return null;

  return (
    <div className="mt-4 space-y-2">
      {recs.map(r => (
        <motion.div key={r.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          className="p-3 rounded-xl border border-amber-200 bg-amber-50">
          <div className="flex gap-2">
            <span className="text-base flex-shrink-0">{r.icon}</span>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-amber-900">{r.text}</div>
              <div className="text-xs text-amber-700 mt-0.5 leading-relaxed">{r.sub}</div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}