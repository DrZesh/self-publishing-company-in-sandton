import React from 'react';
import StepCard from '../StepCard';

const EXTRAS = [
  { value: 'author_website',   icon: '🌐', label: 'Author Website',                   sub: 'Professional author site with book showcase, blog, mailing list.' },
  { value: 'book_launch',      icon: '📈', label: 'Book Launch & Marketing Support',  sub: 'Pre-launch strategy, social media, email campaigns.' },
  { value: 'rollup_banner',    icon: '📺', label: 'Roll-up Banner Design & Print',    sub: 'Physical banner for launch events and signings.' },
  { value: 'book_trailer',     icon: '🎬', label: 'Book Trailer Video',               sub: 'Promotional video for social media and Amazon.' },
  { value: 'press_release',    icon: '📰', label: 'Press Release & Media Outreach',   sub: 'Drafted release, distributed to SA media.' },
  { value: 'launch_event',     icon: '🎤', label: 'Book Launch Event Planning',       sub: 'Venue, RSVPs, signing logistics.' },
  { value: 'distribution',     icon: '🌍', label: 'International Distribution Setup', sub: 'Amazon KDP global + IngramSpark for libraries/bookstores.' },
  { value: 'isbn',             icon: '📊', label: 'ISBN Registration Service',        sub: 'We register your ISBN with the NLSA on your behalf. (ISBNs are free in SA — included in packages).' },
  { value: 'audiobook',        icon: '📚', label: 'Audiobook Production',             sub: 'Narration, recording, distribution to Audible.' },
  { value: 'speaking_coaching',icon: '🎯', label: 'Speaking & Workshop Coaching',     sub: 'Help leveraging your book for speaking opportunities.' },
];

export default function Step9Extras({ answers, update, onNext, onBack }) {
  const { extras = [] } = answers;

  const toggle = (val) => {
    update({ extras: extras.includes(val) ? extras.filter(e => e !== val) : [...extras, val] });
  };

  return (
    <StepCard
      heading="Do you need any of these additional services?"
      sub="Optional add-ons. Skip what you don't need."
      onNext={onNext}
      onBack={onBack}
      canNext={true}
      nextLabel={extras.length === 0 ? "Skip — none of these →" : "Continue →"}
    >
      <div className="space-y-2">
        {EXTRAS.map(e => (
          <label key={e.value} className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
            extras.includes(e.value) ? 'border-copper bg-copper/5' : 'border-black/10 bg-white hover:border-copper/30'
          }`}>
            <input type="checkbox" checked={extras.includes(e.value)} onChange={() => toggle(e.value)}
              className="w-4 h-4 accent-copper mt-1 flex-shrink-0 rounded" />
            <div>
              <div className="font-medium text-sm text-[#1A1208]">{e.icon} {e.label} <span className="text-xs text-black/40 font-normal ml-1">Custom Quote</span></div>
              <div className="text-xs text-black/50 mt-0.5">{e.sub}</div>
            </div>
          </label>
        ))}
      </div>
    </StepCard>
  );
}