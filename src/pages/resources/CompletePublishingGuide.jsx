import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle } from 'lucide-react';
import PageMeta from '../../components/shared/PageMeta';
import CTASection from '../../components/shared/CTASection';
import InternalLinks from '../../components/shared/InternalLinks';

const PriceTable = ({ title, rows }) => (
  <div className="my-6 overflow-x-auto">
    {title && <p className="text-sm font-semibold text-[#0F0F0F]/70 mb-2 font-body">{title}</p>}
    <table className="w-full text-sm font-body border-collapse">
      <tbody>
        {rows.map(([label, value], i) => (
          <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-[#F9F7F2]'}>
            <td className="px-4 py-2.5 text-[#0F0F0F]/70 border border-[#e8e0d0]">{label}</td>
            <td className="px-4 py-2.5 font-semibold text-[#0F0F0F] border border-[#e8e0d0]">{value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const SectionHeading = ({ number, title }) => (
  <h2 className="font-heading text-2xl md:text-3xl font-bold text-[#0F0F0F] mt-16 mb-6 flex items-start gap-3">
    <span className="text-copper font-heading text-xl mt-1 shrink-0">{number}.</span>
    {title}
  </h2>
);

const InlineLink = ({ to, children }) => (
  <Link to={to} className="text-copper underline underline-offset-2 hover:text-[#9a6030] transition-colors">
    {children}
  </Link>
);

export default function CompletePublishingGuide() {
  return (
    <div>
      <PageMeta
        title="Complete Publishing Guide"
        description="The complete guide to publishing a book in South Africa — manuscript prep, ISBN, printing, distribution. Everything in one place. Free resource."
        keywords="self-publishing South Africa, how to publish a book South Africa, book publishing guide South Africa, self-publishing costs South Africa"
        canonical="https://www.creativebooks.co.za/publishingguide"
      />

      {/* Hero */}
      <section className="relative pt-32 pb-16 bg-obsidian overflow-hidden">
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 30% 0%, rgba(184,115,51,0.12) 0%, transparent 55%)' }} />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="text-center">
            <span className="text-copper text-sm font-body tracking-[0.25em] uppercase mb-4 block">Complete Self-Publishing Guide</span>
            <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Complete Publishing Guide
            </h1>
            <p className="text-white/60 text-lg leading-relaxed font-body max-w-2xl mx-auto">
              Real Creative Books SA pricing, real steps, and the distribution truth most authors learn too late.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Article Body */}
      <article className="py-20 bg-vellum">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="prose-custom">

            {/* Introduction */}
            <p className="text-[#0F0F0F]/70 leading-relaxed font-body text-lg mb-6">
              Self-publishing in South Africa has grown from a fringe option into the main route most local authors actually use. The reason is simple: it's faster, you keep your rights, and with the right team behind you, your book can look, read, and sell like anything from a traditional publisher.
            </p>
            <p className="text-[#0F0F0F]/70 leading-relaxed font-body mb-6">
              This guide walks you through every stage of self-publishing a book in South Africa. We'll cover whether your manuscript is ready, what cover design and typesetting actually cost, how to get a free ISBN through the National Library, how printing works locally, and the part most authors learn the hard way: distribution, royalties, and why bookstores can take half your book's retail price.
            </p>
            <p className="text-[#0F0F0F]/70 leading-relaxed font-body mb-10">
              By the end, you'll have a clear, honest picture of what self-publishing your book will involve. We won't tell you what to spend. We'll show you the real Creative Books SA prices for each service, and you decide which ones you need.
            </p>

            {/* Section 1 */}
            <SectionHeading number="1" title="Deciding If Your Book Is Ready" />
            <p className="text-[#0F0F0F]/70 leading-relaxed font-body mb-4">
              Before you spend a cent, the most important question is whether your manuscript is genuinely ready. A book that goes to print before it's ready will haunt you. Bad reviews stick, sales stall, and you lose the chance for a strong launch.
            </p>
            <p className="text-[#0F0F0F]/70 leading-relaxed font-body mb-3"><strong className="text-[#0F0F0F]">Signs your book is ready:</strong> it has a clear beginning, middle, and end; you've revised it at least three times; beta readers have given you feedback and you've acted on it; you've read it aloud and the language flows; and you can summarise it in two sentences without hesitation.</p>
            <p className="text-[#0F0F0F]/70 leading-relaxed font-body mb-4"><strong className="text-[#0F0F0F]">Signs your book isn't ready:</strong> you haven't shown it to anyone yet; you keep rewriting the opening chapter; you can't describe the central conflict or argument in plain language; or you're tired of it and want to be done.</p>
            <p className="text-[#0F0F0F]/70 leading-relaxed font-body mb-4">
              Tiredness isn't readiness. Most first-time authors finish their manuscript and immediately want to publish. That's the moment to slow down, not speed up.
            </p>
            <p className="text-[#0F0F0F]/70 leading-relaxed font-body mb-10">
              For a full readiness checklist, see <InlineLink to="/howdoiknowifmybookisreadytopublish">How Do I Know If My Book Is Ready to Publish?</InlineLink>
            </p>

            {/* Section 2 */}
            <SectionHeading number="2" title="Why Self-Publishing Works for Most South African Authors" />
            <p className="text-[#0F0F0F]/70 leading-relaxed font-body mb-4">
              Traditional publishing in South Africa is a tough route. Local publishing houses receive far more submissions than they can ever accept, and even strong manuscripts can take 18 to 36 months to reach the shelf if they're picked up at all. Royalties are usually 8% to 15% of the wholesale price, which often works out to a few rand per book sold.
            </p>
            <p className="text-[#0F0F0F]/70 leading-relaxed font-body mb-4">
              Hybrid publishing exists in the middle, but it's a category that's been muddied by vanity publishers who call themselves "hybrid" while charging traditional-publishing prices for self-publishing services. Be cautious here.
            </p>
            <p className="text-[#0F0F0F]/70 leading-relaxed font-body mb-4">
              Self-publishing flips the model. You keep full ownership of your work. You keep close to 100% of profit on every sale. You decide when your book launches, what the cover looks like, and how it's priced. The trade-off is that you carry the upfront costs, and you're the project manager. That's why working with a publishing partner who handles the heavy lifting (editing, design, layout, printing, ISBN) makes the route practical for most authors.
            </p>
            <p className="text-[#0F0F0F]/70 leading-relaxed font-body mb-10">
              For a fuller comparison, see <InlineLink to="/howdoigetmybookpublishedinsouthafrica">How Do I Get My Book Published?</InlineLink> and <InlineLink to="/traditionalvsselfpublishingroyaltiesinsouthafrica">Traditional vs Self-Publishing Royalties</InlineLink>.
            </p>

            {/* Section 3 */}
            <SectionHeading number="3" title="Editing Your Manuscript" />
            <p className="text-[#0F0F0F]/70 leading-relaxed font-body mb-4">
              Whatever else you do, your book needs to be professionally edited. This is the single most important investment you'll make. A poorly edited book is the fastest way to lose readers, and once a one-star review goes live, it's there forever.
            </p>
            <p className="text-[#0F0F0F]/70 leading-relaxed font-body mb-4">There are three main types of editing, and each plays a different role:</p>
            <p className="text-[#0F0F0F]/70 leading-relaxed font-body mb-3">
              <strong className="text-[#0F0F0F]">Developmental editing</strong> looks at the big picture: story structure, pacing, character arcs (for fiction) or argument and flow (for non-fiction). A developmental editor tells you whether your book actually works.
            </p>
            <p className="text-[#0F0F0F]/70 leading-relaxed font-body mb-3">
              <strong className="text-[#0F0F0F]">Copy editing</strong> focuses on sentence-level clarity: grammar, syntax, word choice, consistency, and style. A copy editor makes sure every sentence does its job.
            </p>
            <p className="text-[#0F0F0F]/70 leading-relaxed font-body mb-4">
              <strong className="text-[#0F0F0F]">Proofreading</strong> is the final pass. It catches typos, formatting errors, and small mistakes after copy editing is done. It's the polish before printing.
            </p>
            <p className="text-[#0F0F0F]/70 leading-relaxed font-body mb-4">
              Most self-publishing authors need at least copy editing and proofreading. Skipping these is the single most common reason self-published books fail.
            </p>
            <p className="text-[#0F0F0F]/70 leading-relaxed font-body mb-4">
              At Creative Books SA, editing is built into every Full Package and Mini Package (2 drafts included). If you only need editing on its own, request a <InlineLink to="/getquote">free quote</InlineLink> and we'll send you a price based on your word count and the level of editing you need.
            </p>
            <p className="text-[#0F0F0F]/70 leading-relaxed font-body mb-10">
              For more, see <InlineLink to="/doineedaneditorbeforepublishing">Do I Need an Editor Before Publishing My Book?</InlineLink> and <InlineLink to="/professionalcopyeditingservices">Professional Copy Editing Explained</InlineLink>.
            </p>

            {/* Section 4 */}
            <SectionHeading number="4" title="Designing Your Book Cover" />
            <p className="text-[#0F0F0F]/70 leading-relaxed font-body mb-4">
              People do judge books by their covers. A professional cover is the difference between someone clicking on your book online and scrolling past it. Cheap covers cost you sales, every single time.
            </p>
            <p className="text-[#0F0F0F]/70 leading-relaxed font-body mb-6">
              A good book cover does three things: it signals the genre clearly, it's readable as a thumbnail (most people see your cover at stamp size on Amazon), and it stands out from competitors in its category.
            </p>

            <div className="rounded-2xl p-6 mb-6" style={{ background: 'rgba(255,255,255,0.85)', border: '1px solid rgba(184,115,51,0.12)', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
              <p className="font-heading font-semibold text-[#0F0F0F] mb-4">Creative Books SA cover design pricing (standalone)</p>
              <p className="text-sm text-[#0F0F0F]/60 mb-3 font-body">Full paperback cover (front, spine, back integrated, 2 concepts, mockups, revisions, print-ready files):</p>
              <PriceTable rows={[
                ["Author's Book Cover (your own professional image)", "R1,650"],
                ["Stock Design Cover (Shutterstock image integration)", "R2,150"],
                ["Illustrated Cover Design (1x character development, custom artwork)", "R3,850"],
              ]} />
              <p className="text-sm text-[#0F0F0F]/60 mb-3 font-body mt-4">Amazon ebook cover (front cover only):</p>
              <PriceTable rows={[
                ["Author's Book Cover", "R1,200"],
                ["Stock Design Cover", "R1,700"],
                ["Illustrated Cover Design", "R3,400"],
              ]} />
            </div>

            <p className="text-[#0F0F0F]/70 leading-relaxed font-body mb-4">
              We don't use templates. Every cover is original and built for your book specifically. Full details and examples on our <InlineLink to="/bookcoverdesign">Book Cover Design</InlineLink> page.
            </p>
            <p className="text-[#0F0F0F]/70 leading-relaxed font-body mb-10">
              For more on cover budgeting, see <InlineLink to="/howmuchdoispendonbookcoverdesigninsouthafrica">How Much Should You Spend on Book Cover Design?</InlineLink>
            </p>

            {/* Section 5 */}
            <SectionHeading number="5" title="Book Layout and Typesetting" />
            <p className="text-[#0F0F0F]/70 leading-relaxed font-body mb-4">
              Layout (also called typesetting) is the work of turning your edited manuscript into a properly designed book interior: chosen fonts, balanced margins, correct page numbers, drop caps, chapter headings, and clean line spacing. A well-typeset book is invisible to the reader. A badly typeset book screams "amateur" from page one.
            </p>

            <div className="rounded-2xl p-6 mb-6" style={{ background: 'rgba(255,255,255,0.85)', border: '1px solid rgba(184,115,51,0.12)', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
              <p className="font-heading font-semibold text-[#0F0F0F] mb-4">Creative Books SA typesetting pricing (per page, Microsoft Word, print-ready file)</p>
              <PriceTable rows={[
                ["Basic Layout — R10.50/page", "Basic formatting, drop cap, chapter headings, source file"],
                ["Standard Layout — R12.50/page", "Adds header, bullet/numbering, images and bleed images"],
                ["Premium Layout — R19.50/page", "Everything above plus tabulation and complex structures"],
              ]} />
            </div>

            <p className="text-[#0F0F0F]/70 leading-relaxed font-body mb-3">
              A worked example: a 200-page novel using Standard Layout works out to 200 × R12.50 = <strong className="text-[#0F0F0F]">R2,500</strong>.
            </p>
            <p className="text-[#0F0F0F]/70 leading-relaxed font-body mb-4">
              A 250-page non-fiction book using Premium Layout works out to 250 × R19.50 = <strong className="text-[#0F0F0F]">R4,875</strong>.
            </p>
            <p className="text-[#0F0F0F]/70 leading-relaxed font-body mb-10">
              Layout is also included in every Full Package and Mini Package. See our <InlineLink to="/typesetting">Book Typesetting</InlineLink> page for full detail.
            </p>

            {/* Section 6 */}
            <SectionHeading number="6" title="Getting an ISBN in South Africa" />
            <p className="text-[#0F0F0F]/70 leading-relaxed font-body mb-4">
              Every book that's sold needs an ISBN, a unique 13-digit identifier. South Africa is one of the few countries in the world where ISBNs are free.
            </p>
            <p className="text-[#0F0F0F]/70 leading-relaxed font-body mb-3">You apply directly through the National Library of South Africa:</p>
            <ol className="space-y-3 mb-6 font-body">
              {[
                'Email the National Library at kholofelo.mojela@nlsa.ac.za to request ISBNs.',
                "They'll send you a form to fill in for each ISBN you need (you'll need a separate ISBN for each format: paperback, hardcover, ebook).",
                'Provide the required information: title, author, publisher name (you can use your own name if you\'re self-publishing), format, page count, publication date.',
                'Wait 3 to 5 working days for your ISBNs to be issued.',
              ].map((step, i) => (
                <li key={i} className="flex gap-3 text-[#0F0F0F]/70">
                  <span className="shrink-0 w-6 h-6 rounded-full bg-copper/10 text-copper text-xs font-bold flex items-center justify-center mt-0.5">{i + 1}</span>
                  {step}
                </li>
              ))}
            </ol>
            <p className="text-[#0F0F0F]/70 leading-relaxed font-body mb-4">
              You'll also need a barcode that incorporates your ISBN for the back cover. Barcode generation is free online, but our cover designers include it as part of the cover design.
            </p>
            <p className="text-[#0F0F0F]/70 leading-relaxed font-body mb-10">
              For more detail, see <InlineLink to="/howtogetanisbnforyourbook">How to Get an ISBN for Your Book</InlineLink> and <InlineLink to="/isbnregistrationsouthafrica">ISBN Registration South Africa</InlineLink>.
            </p>

            {/* Section 7 */}
            <SectionHeading number="7" title="Printing Your Book" />
            <p className="text-[#0F0F0F]/70 leading-relaxed font-body mb-4">
              Once your book is edited, designed, and has an ISBN, it's ready to print. In South Africa, you have two main routes:
            </p>
            <p className="text-[#0F0F0F]/70 leading-relaxed font-body mb-3">
              <strong className="text-[#0F0F0F]">Short-run digital printing</strong> is what most self-published authors use. You print 100 copies or so at a time, no minimum upfront commitment. This is ideal when you're starting out and don't know your demand yet. You can reorder whenever you sell through your stock.
            </p>
            <p className="text-[#0F0F0F]/70 leading-relaxed font-body mb-6">
              <strong className="text-[#0F0F0F]">Offset printing</strong> is for larger print runs (1,000 copies or more). Per-unit cost drops, but you need to be confident you can sell the books, because you're committing to the full quantity upfront.
            </p>

            <div className="rounded-2xl p-6 mb-6" style={{ background: 'rgba(255,255,255,0.85)', border: '1px solid rgba(184,115,51,0.12)', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
              <p className="font-heading font-semibold text-[#0F0F0F] mb-1">A5 Printing — 100 copies</p>
              <p className="text-xs text-[#0F0F0F]/50 mb-3 font-body">Cream paper, gloss or matte cover, perfect binding, black-and-white inners</p>
              <PriceTable rows={[
                ["50 to 100 pages", "R5,500"],
                ["115 to 150 pages", "R6,250"],
                ["160 to 200 pages", "R7,500"],
                ["210 to 250 pages", "R8,750"],
                ["260 to 300 pages", "R9,600"],
                ["310 to 350 pages", "R11,500"],
                ["360 to 400 pages", "R12,500"],
              ]} />
            </div>

            <div className="rounded-2xl p-6 mb-6" style={{ background: 'rgba(255,255,255,0.85)', border: '1px solid rgba(184,115,51,0.12)', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
              <p className="font-heading font-semibold text-[#0F0F0F] mb-1">6x9 Printing — 100 copies</p>
              <p className="text-xs text-[#0F0F0F]/50 mb-3 font-body">Cream paper, gloss or matte cover, perfect binding, black-and-white inners</p>
              <PriceTable rows={[
                ["50 to 100 pages", "R6,200"],
                ["115 to 150 pages", "R6,950"],
                ["160 to 200 pages", "R8,200"],
                ["210 to 250 pages", "R9,450"],
                ["260 to 300 pages", "R10,300"],
                ["310 to 350 pages", "R12,200"],
                ["360 to 400 pages", "R13,200"],
              ]} />
            </div>

            <p className="text-[#0F0F0F]/70 leading-relaxed font-body mb-4">
              A worked per-copy example: a 200-page A5 novel printed at 100 copies costs R7,500, which works out to <strong className="text-[#0F0F0F]">R75 per book</strong> before any other costs.
            </p>
            <p className="text-[#0F0F0F]/70 leading-relaxed font-body mb-4">
              White paper printing is also available in both A5 and 6x9 sizes if your book contains many images or you prefer a brighter look. See our <InlineLink to="/bookprinting">Book Printing</InlineLink> page for the full pricing range and options.
            </p>
            <p className="text-[#0F0F0F]/70 leading-relaxed font-body mb-10">
              For more, see <InlineLink to="/howmuchdoesbookprintingcost">How Much Does Book Printing Cost?</InlineLink>, <InlineLink to="/a5vs6x9bookprinting">A5 vs 6x9 Book Printing</InlineLink>, and <InlineLink to="/howtoprintyourselfpublishedbookinsouthafrica">How to Print a Self-Published Book</InlineLink>.
            </p>

            {/* Section 8 */}
            <SectionHeading number="8" title="Creative Books SA Publishing Packages" />
            <p className="text-[#0F0F0F]/70 leading-relaxed font-body mb-6">
              If managing every step yourself feels like too much, a full publishing package handles it all (cover design, editing, layout, printing, consultation) for a single, transparent price.
            </p>

            <div className="space-y-6 mb-8">
              {/* Mini Packages */}
              <div className="rounded-2xl p-6" style={{ background: 'rgba(255,255,255,0.85)', border: '1px solid rgba(184,115,51,0.12)', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
                <p className="font-heading font-semibold text-[#0F0F0F] mb-1">Mini Packages</p>
                <p className="text-xs text-[#0F0F0F]/50 mb-3 font-body">For authors not ready for a bulk print run — includes 5 copies</p>
                <PriceTable rows={[
                  ["Mini Bronze — R14,250", "A5 or 6x9, 5 copies, cover design (2 concepts), editing (2 drafts), up to 30,000 words / 150 pages, book layout"],
                  ["Mini Silver — R16,500", "A5 or 6x9, 5 copies, cover design (2 concepts), editing (2 drafts), up to 50,000 words / 250 pages, book layout"],
                  ["Mini Gold — R20,000", "A5 or 6x9, 5 copies, cover design, editing (2 drafts), up to 100,000 words / 350 pages, book layout"],
                ]} />
              </div>

              {/* A5 Full Packages */}
              <div className="rounded-2xl p-6" style={{ background: 'rgba(255,255,255,0.85)', border: '1px solid rgba(184,115,51,0.12)', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
                <p className="font-heading font-semibold text-[#0F0F0F] mb-3">Full Packages — A5</p>
                <PriceTable rows={[
                  ["A5 Bronze — R21,000", "100 copies, cover design (2 concepts), editing (2 drafts), up to 150 pages, book layout, cream paper, Facebook banner, mockups, consultation"],
                  ["A5 Silver — R25,500", "150 copies, cover design (2 concepts), editing (2 drafts), up to 200 pages, book layout (2 styles), cream paper, Facebook banner, mockups, consultation"],
                  ["A5 Gold — R35,000", "200 copies, cover design (2 concepts), editing (2 drafts), up to 250 pages, book layout, cream paper, roll-up banner + print, ebook conversion (all platforms), consultation"],
                ]} />
              </div>

              {/* 6x9 Full Packages */}
              <div className="rounded-2xl p-6" style={{ background: 'rgba(255,255,255,0.85)', border: '1px solid rgba(184,115,51,0.12)', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
                <p className="font-heading font-semibold text-[#0F0F0F] mb-3">Full Packages — 6x9</p>
                <PriceTable rows={[
                  ["6x9 Bronze — R22,700", "100 copies, cover design (2 concepts), editing (2 drafts), up to 150 pages, book layout, cream paper, Facebook banner, mockups, consultation"],
                  ["6x9 Silver — R27,200", "150 copies, cover design (2 concepts), editing (2 drafts), up to 200 pages, book layout (2 styles), cream paper, Facebook banner, mockups, consultation"],
                  ["6x9 Gold — R36,700", "200 copies, cover design (2 concepts), editing (2 drafts), up to 250 pages, book layout, cream paper, roll-up banner + print, ebook conversion (all platforms), consultation"],
                ]} />
              </div>

              {/* Ebook Packages */}
              <div className="rounded-2xl p-6" style={{ background: 'rgba(255,255,255,0.85)', border: '1px solid rgba(184,115,51,0.12)', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
                <p className="font-heading font-semibold text-[#0F0F0F] mb-3">Ebook Packages</p>
                <PriceTable rows={[
                  ["Ebook — R6,500", "eBook and print-ready manuscript, layout and typesetting, up to 150 pages (Amazon-ready)"],
                  ["Paperback — R8,500", "Layout and typesetting, ebook-ready manuscript, up to 250 pages (print-ready paperback)"],
                  ["Plus — R12,500", "Ebook cover design, interior layout for print, ebook conversion, up to 350 pages (both editions)"],
                ]} />
              </div>
            </div>

            <p className="text-[#0F0F0F]/70 leading-relaxed font-body mb-4">
              Our packages are one-off charges. There are no ongoing royalties or hidden fees. You keep 100% of your profits on every book you sell.
            </p>
            <p className="text-[#0F0F0F]/70 leading-relaxed font-body mb-10">
              See <InlineLink to="/selfpublishingpackagesinsouthafrica">Self-Publishing Packages</InlineLink> and <InlineLink to="/publishingpackages/mini">Mini Publishing Package</InlineLink> for the full breakdown.
            </p>

            {/* Section 9 */}
            <SectionHeading number="9" title="Distribution: The Part Most Authors Get Wrong" />
            <p className="text-[#0F0F0F]/70 leading-relaxed font-body mb-4">
              This is the section every self-published author needs to read carefully, because distribution is where most authors lose money without realising it.
            </p>
            <p className="text-[#0F0F0F]/70 leading-relaxed font-body mb-6">
              When your book is printed, you own physical stock. The question is: how does it actually get into readers' hands? You have several options, and each one has trade-offs that affect your margins significantly.
            </p>

            <h3 className="font-heading text-xl font-semibold text-[#0F0F0F] mb-3">Selling direct to readers</h3>
            <p className="text-[#0F0F0F]/70 leading-relaxed font-body mb-3">
              This is the most profitable channel. You sell from your own website, at events, through social media, or hand-to-hand. You keep close to 100% of the retail price minus printing cost.
            </p>
            <p className="text-[#0F0F0F]/70 leading-relaxed font-body mb-3">
              Example using real Creative Books SA pricing: a 200-page A5 novel costs R75 per copy to print (R7,500 for 100 copies, Bronze tier). If you sell direct at R250, you make <strong className="text-[#0F0F0F]">R175 profit per book</strong>.
            </p>
            <p className="text-[#0F0F0F]/70 leading-relaxed font-body mb-6">
              The catch: you have to do all the marketing, packaging, and shipping yourself.
            </p>

            <h3 className="font-heading text-xl font-semibold text-[#0F0F0F] mb-3">Selling through online retailers (Amazon, Takealot, Loot)</h3>
            <p className="text-[#0F0F0F]/70 leading-relaxed font-body mb-3">
              These platforms reach huge audiences, but they take a cut. Amazon KDP's royalty structure is around 60% of list price for paperback (after print costs). Takealot and Loot operate on consignment or marketplace models with commissions typically between 15% and 30%.
            </p>
            <p className="text-[#0F0F0F]/70 leading-relaxed font-body mb-6">
              For ebooks, Amazon pays 70% royalties for books priced between R55 and R180 (roughly $2.99 to $9.99), and 35% outside that range.
            </p>

            <h3 className="font-heading text-xl font-semibold text-[#0F0F0F] mb-3">Selling through physical bookstores</h3>
            <p className="text-[#0F0F0F]/70 leading-relaxed font-body mb-4">
              This is where authors most often lose money without understanding why. South African bookstores, both chains and independents, typically take a 40% to 50% discount off the recommended retail price. That isn't a fee. That's the bookstore's margin on every book they sell.
            </p>
            <div className="rounded-2xl p-6 mb-6" style={{ background: 'rgba(184,115,51,0.06)', border: '1px solid rgba(184,115,51,0.15)' }}>
              <p className="font-heading font-semibold text-[#0F0F0F] mb-3">The bookstore maths you need to know</p>
              <p className="text-[#0F0F0F]/70 font-body text-sm mb-2">200-page A5 novel, R75 print cost, R250 retail, 50% bookstore discount:</p>
              <p className="text-[#0F0F0F]/70 font-body text-sm mb-4">R125 received minus R75 print cost = <strong className="text-[#0F0F0F]">R50 profit per copy</strong></p>
              <p className="text-[#0F0F0F]/70 font-body text-sm mb-2">300-page A5 book, R96 print cost, R250 retail, 50% bookstore discount:</p>
              <p className="text-[#0F0F0F]/70 font-body text-sm mb-4">R125 received minus R96 print cost = <strong className="text-[#0F0F0F]">R29 profit per copy</strong></p>
              <p className="text-[#0F0F0F]/70 font-body text-sm mb-2">300-page A5 book, R96 print cost, R200 retail, 50% bookstore discount:</p>
              <p className="text-[#0F0F0F]/70 font-body text-sm">R100 received minus R96 print cost = <strong className="text-[#0F0F0F]">R4 profit per book</strong></p>
            </div>
            <p className="text-[#0F0F0F]/70 leading-relaxed font-body mb-6">
              This is the trap. The thicker your book, the more careful you have to be about pricing for bookstore channels.
            </p>

            <h3 className="font-heading text-xl font-semibold text-[#0F0F0F] mb-3">The bookstore maths to do before approaching any retailer</h3>
            <ol className="space-y-2 mb-6 font-body">
              {[
                'Your printing cost per copy',
                "The retailer's percentage cut",
                'What you receive per copy (retail price minus the retailer\'s cut)',
                'Your profit per copy (what you receive minus printing cost)',
              ].map((step, i) => (
                <li key={i} className="flex gap-3 text-[#0F0F0F]/70 text-sm">
                  <span className="shrink-0 w-5 h-5 rounded-full bg-copper/10 text-copper text-xs font-bold flex items-center justify-center mt-0.5">{i + 1}</span>
                  {step}
                </li>
              ))}
            </ol>
            <p className="text-[#0F0F0F]/70 leading-relaxed font-body mb-6">
              If the profit per copy is negative or near zero, that channel is costing you money. Either raise your retail price, lower your printing cost (print larger runs), or walk away from that channel.
            </p>

            <h3 className="font-heading text-xl font-semibold text-[#0F0F0F] mb-3">Other distribution costs authors often forget</h3>
            <ul className="space-y-2 mb-6">
              {[
                'Delivery to the bookstore (you usually have to deliver stock, sometimes nationally)',
                'Returns (bookstores can return unsold stock; you wear that cost)',
                'Sale or return terms (you only get paid when the book actually sells, sometimes months later)',
                'Account setup fees (some chains charge a once-off listing fee per title)',
                'Storage (where do 500 unsold books live? Your garage adds up)',
              ].map((item, i) => (
                <li key={i} className="flex gap-2 text-[#0F0F0F]/70 text-sm font-body">
                  <CheckCircle className="w-4 h-4 text-copper shrink-0 mt-0.5" />
                  {item}
                </li>
              ))}
            </ul>

            <h3 className="font-heading text-xl font-semibold text-[#0F0F0F] mb-3">International distribution (Amazon KDP and IngramSpark)</h3>
            <p className="text-[#0F0F0F]/70 leading-relaxed font-body mb-4">
              These print-on-demand services let your book appear globally without you holding stock. They print each book when it's ordered. The trade-off: per-unit print cost is much higher than a local run, and royalties after retailer cut and print cost are often 20% to 35% of retail.
            </p>
            <p className="text-[#0F0F0F]/70 leading-relaxed font-body mb-4">
              For most South African authors, the realistic strategy is a mix: direct sales (highest margin), online retailers like Amazon and Takealot (broadest reach), and selective bookstore placement (only where the maths makes sense).
            </p>
            <p className="text-[#0F0F0F]/70 leading-relaxed font-body mb-10">
              For more on distribution, see <InlineLink to="/dosouthafricanauthorsneedinternationaldistribution">Do Authors Need International Distribution?</InlineLink> and <InlineLink to="/bookdistributioninsouthafrica">Book Distribution Services South Africa</InlineLink>.
            </p>

            {/* Section 10 */}
            <SectionHeading number="10" title="Launching Your Book" />
            <p className="text-[#0F0F0F]/70 leading-relaxed font-body mb-4">
              A book launch is one day, but a successful launch starts weeks before. The goal isn't to sell a thousand copies on launch day. It's to generate the early reviews and word-of-mouth that drive sales for the rest of the year.
            </p>

            <h3 className="font-heading text-xl font-semibold text-[#0F0F0F] mb-2">Pre-launch (4 to 6 weeks before)</h3>
            <p className="text-[#0F0F0F]/70 leading-relaxed font-body mb-4">
              Set up your author website and social media presence; send your book to 10 to 20 beta readers and ask for honest reviews; build an email list of friends, family, and readers who'll buy on launch day; create a launch graphic and start teasing the cover.
            </p>

            <h3 className="font-heading text-xl font-semibold text-[#0F0F0F] mb-2">Launch week</h3>
            <p className="text-[#0F0F0F]/70 leading-relaxed font-body mb-4">
              Announce the launch date everywhere; offer a launch-week discount or bonus (signed copies, free shipping); coordinate a launch event (in-person or online); push email and social media on launch day itself.
            </p>

            <h3 className="font-heading text-xl font-semibold text-[#0F0F0F] mb-2">Post-launch</h3>
            <p className="text-[#0F0F0F]/70 leading-relaxed font-body mb-4">
              Keep momentum with reader Q&amp;As, book club appearances, press features, and ongoing social posts. Don't disappear after launch week.
            </p>
            <p className="text-[#0F0F0F]/70 leading-relaxed font-body mb-10">
              For a step-by-step launch plan, see <InlineLink to="/howtolaunchyourbooksuccessfullyinsouthafrica">How to Launch Your Book in South Africa</InlineLink>.
            </p>

            {/* Section 11 */}
            <SectionHeading number="11" title="Marketing Your Self-Published Book" />
            <p className="text-[#0F0F0F]/70 leading-relaxed font-body mb-4">
              Most self-published books don't fail because they're bad. They fail because no one knows they exist. Marketing isn't optional. It's the difference between selling 50 copies and selling 5,000.
            </p>
            <p className="text-[#0F0F0F]/70 leading-relaxed font-body mb-6">
              The most important marketing principle: build an audience before you need them. Authors who launch with zero audience are launching to silence.
            </p>

            <div className="space-y-4 mb-6">
              {[
                { title: 'Build an author platform', body: 'Website, email list, and at least one social media channel where you post regularly.', link: { to: '/howtobuildanauthorplatformbeforepublishing', label: 'How to Build an Author Platform' } },
                { title: 'Get reviews early', body: 'Books with 25 or more honest reviews sell significantly more than books with 5 reviews. Send free copies to genuine readers in exchange for an honest review.' },
                { title: 'Local media coverage', body: "South African radio shows, magazines, and book clubs are often more accessible than authors expect. A short, well-written press release can land you interviews." },
                { title: 'Direct-to-reader is your highest-margin channel', body: 'Always promote your direct sales link first. Send people to your website where you keep close to 100% of the price.' },
                { title: 'Online ads', body: "Amazon, Facebook, and Instagram ads can work, but only after you've nailed your cover, blurb, and pricing. Don't pay for ads until the basics are right." },
                { title: 'Speaking and events', body: 'If your book is non-fiction, every talk you give is a marketing event. Authors who treat their book as a business card sell more books over the long term.' },
              ].map((item, i) => (
                <div key={i} className="flex gap-3 p-4 rounded-xl font-body" style={{ background: 'rgba(255,255,255,0.85)', border: '1px solid rgba(184,115,51,0.08)' }}>
                  <CheckCircle className="w-4 h-4 text-copper shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold text-[#0F0F0F] text-sm mb-1">{item.title}</p>
                    <p className="text-[#0F0F0F]/60 text-sm">{item.body}{item.link && <> See <InlineLink to={item.link.to}>{item.link.label}</InlineLink>.</>}</p>
                  </div>
                </div>
              ))}
            </div>

            <p className="text-[#0F0F0F]/70 leading-relaxed font-body mb-10">
              For more depth, see <InlineLink to="/howtomarketandsellyourselfpublishedbookinsouthafrica">How to Market a Self-Published Book in South Africa</InlineLink> and <InlineLink to="/howtogetyourbookreviewedbysouthafricanpublications">How to Get Your Book Reviewed in South Africa</InlineLink>.
            </p>

            {/* Section 12 */}
            <SectionHeading number="12" title="Building Your Own Budget" />
            <p className="text-[#0F0F0F]/70 leading-relaxed font-body mb-6">
              You now have the real Creative Books SA prices for each piece of self-publishing. Use them to build the budget that fits your project.
            </p>

            <div className="rounded-2xl p-6 mb-6" style={{ background: 'rgba(255,255,255,0.85)', border: '1px solid rgba(184,115,51,0.12)', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
              <p className="font-heading font-semibold text-[#0F0F0F] mb-3">Standalone services</p>
              <PriceTable rows={[
                ["Cover design (paperback, author's image)", "R1,650"],
                ["Cover design (paperback, stock image)", "R2,150"],
                ["Cover design (paperback, illustrated)", "R3,850"],
                ["Cover design (ebook, author's image)", "R1,200"],
                ["Cover design (ebook, stock image)", "R1,700"],
                ["Cover design (ebook, illustrated)", "R3,400"],
                ["Layout — Basic", "R10.50 per page"],
                ["Layout — Standard", "R12.50 per page"],
                ["Layout — Premium", "R19.50 per page"],
                ["ISBN", "Free (National Library)"],
                ["Printing (A5, 100 copies)", "R5,500 to R12,500"],
                ["Printing (6x9, 100 copies)", "R6,200 to R13,200"],
                ["Editing", "Quoted on request"],
              ]} />
            </div>

            <div className="rounded-2xl p-6 mb-6" style={{ background: 'rgba(255,255,255,0.85)', border: '1px solid rgba(184,115,51,0.12)', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
              <p className="font-heading font-semibold text-[#0F0F0F] mb-3">Package options (all-in-one)</p>
              <PriceTable rows={[
                ["Ebook only", "R6,500"],
                ["Paperback only", "R8,500"],
                ["Ebook + Paperback (Plus)", "R12,500"],
                ["Mini Bronze (5 copies, up to 150 pages)", "R14,250"],
                ["Mini Silver (5 copies, up to 250 pages)", "R16,500"],
                ["Mini Gold (5 copies, up to 350 pages)", "R20,000"],
                ["A5 Bronze (100 copies)", "R21,000"],
                ["A5 Silver (150 copies)", "R25,500"],
                ["A5 Gold (200 copies + ebook)", "R35,000"],
                ["6x9 Bronze (100 copies)", "R22,700"],
                ["6x9 Silver (150 copies)", "R27,200"],
                ["6x9 Gold (200 copies + ebook)", "R36,700"],
              ]} />
            </div>

            <p className="text-[#0F0F0F]/70 leading-relaxed font-body mb-4">
              The smart approach: list the services you actually need, add them up, and compare the total to a full package. Packages usually work out cheaper than buying each service separately because everything is coordinated under one team.
            </p>
            <p className="text-[#0F0F0F]/70 leading-relaxed font-body mb-4">
              For example, a 200-page A5 book bought as separate services costs roughly R2,150 (stock cover) + R2,500 (standard layout at 200 pages) + R7,500 (100 copies printed) = <strong className="text-[#0F0F0F]">R12,150</strong>, and that's before editing. The A5 Bronze package at <strong className="text-[#0F0F0F]">R21,000</strong> includes all of that plus editing (2 drafts), Facebook banner design, book mockups, and publishing consultation.
            </p>
            <p className="text-[#0F0F0F]/70 leading-relaxed font-body mb-4">
              The two services we'd never recommend cutting corners on: editing and cover design. These two determine whether your book sells. Everything else can be adjusted.
            </p>
            <p className="text-[#0F0F0F]/70 leading-relaxed font-body mb-10">
              For the full industry cost breakdown, see <InlineLink to="/howmuchdoesitcosttopublishabook">How Much Does It Cost to Publish a Book in South Africa?</InlineLink>
            </p>

            {/* Section 13 */}
            <SectionHeading number="13" title="Your Next Step" />
            <p className="text-[#0F0F0F]/70 leading-relaxed font-body mb-4">
              Self-publishing a book in South Africa is a project, but it's a project thousands of South African authors complete every year. The difference between the ones who succeed and the ones who don't isn't talent. It's understanding the real costs, choosing the right distribution channels, and investing in the parts that matter most.
            </p>
            <p className="text-[#0F0F0F]/70 leading-relaxed font-body mb-4">If you're ready to start, here's what we'd suggest:</p>
            <ol className="space-y-3 mb-6 font-body">
              {[
                'Make sure your manuscript is genuinely ready.',
                'List the services you need (cover, editing, layout, printing, ISBN).',
                'Get a quote on each one, or compare against a full package.',
                'Plan your distribution honestly. Do the bookstore maths before you commit to any channel.',
              ].map((step, i) => (
                <li key={i} className="flex gap-3 text-[#0F0F0F]/70">
                  <span className="shrink-0 w-6 h-6 rounded-full bg-copper/10 text-copper text-xs font-bold flex items-center justify-center mt-0.5">{i + 1}</span>
                  {step}
                </li>
              ))}
            </ol>
            <p className="text-[#0F0F0F]/70 leading-relaxed font-body mb-8">
              That's where Creative Books SA comes in. We're a Johannesburg-based publishing house specialising in helping South African authors self-publish books that look, read, and sell like professional titles. Our packages are transparent, our pricing is one-off, and you keep full ownership of your work and every cent of profit on every book you sell direct.
            </p>

            {/* Final CTA */}
            <div className="rounded-2xl p-8 text-center mb-6" style={{ background: 'linear-gradient(135deg, rgba(184,115,51,0.08) 0%, rgba(184,115,51,0.04) 100%)', border: '1px solid rgba(184,115,51,0.2)' }}>
              <p className="font-heading text-2xl font-bold text-[#0F0F0F] mb-3">Your book deserves to exist in the world.</p>
              <p className="text-[#0F0F0F]/60 font-body mb-6">Let's get it there.</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                  <Link to="/getquote"
                    className="inline-flex items-center gap-2 px-8 py-4 text-white font-medium rounded-full transition-all text-base"
                    style={{
                      background: 'linear-gradient(135deg, #B87333 0%, #9a6030 100%)',
                      boxShadow: '0 16px 40px rgba(184,115,51,0.35), inset 0 1px 0 rgba(255,255,255,0.15)',
                    }}>
                    Get a Free Publishing Quote Within 24 Hours
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                  <Link to="/selfpublishingpackagesinsouthafrica"
                    className="inline-flex items-center gap-2 px-8 py-4 font-medium rounded-full transition-all text-base text-[#0F0F0F]"
                    style={{ background: 'rgba(255,255,255,0.9)', border: '1px solid rgba(184,115,51,0.2)' }}>
                    Browse Self-Publishing Services
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </motion.div>
              </div>
            </div>

          </motion.div>
        </div>
      </article>

      <InternalLinks
        title="Related Services & Guides"
        links={[
          { label: 'Book Publishing', path: '/bookpublishing' },
          { label: 'Book Printing', path: '/bookprinting' },
          { label: 'Book Editing', path: '/bookediting' },
          { label: 'Cover Design', path: '/bookcoverdesign' },
          { label: 'Publishing Packages', path: '/publishingpackages' },
          { label: 'Ebook Publishing', path: '/ebookpublishing' },
          { label: 'ISBN Registration', path: '/isbnregistration' },
          { label: 'Get a Quote', path: '/getquote' },
        ]}
        light
      />
      <CTASection />
    </div>
  );
}