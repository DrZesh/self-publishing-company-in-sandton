import { createClientFromRequest, serve } from '../_shared/server.ts';

// Pricing data from calculatorPricing.js
const COVER_DESIGN = {
  paperback: { authors: 1650, stock: 2150, illustrated: 3850 },
  ebook: { authors: 1200, stock: 1700, illustrated: 3400 },
};

const TYPESETTING = {
  basic: 10.50,
  standard: 12.50,
  premium: 19.50,
};

const PACKAGES = {
  mini_bronze: { label: 'Mini Bronze', price: 14250, maxWords: 30000, maxPages: 150, copies: 5 },
  mini_silver: { label: 'Mini Silver', price: 16500, maxWords: 50000, maxPages: 250, copies: 5 },
  mini_gold: { label: 'Mini Gold', price: 20000, maxWords: 100000, maxPages: 350, copies: 5 },
  a5_bronze: { label: 'Full A5 Bronze', price: 21000, maxWords: 37500, maxPages: 150, copies: 100, size: 'a5' },
  a5_silver: { label: 'Full A5 Silver', price: 25500, maxWords: 50000, maxPages: 200, copies: 150, size: 'a5' },
  a5_gold: { label: 'Full A5 Gold', price: 35000, maxWords: 62500, maxPages: 250, copies: 200, size: 'a5' },
  '6x9_bronze': { label: 'Full 6×9 Bronze', price: 22700, maxWords: 37500, maxPages: 150, copies: 100, size: '6x9' },
  '6x9_silver': { label: 'Full 6×9 Silver', price: 27200, maxWords: 50000, maxPages: 200, copies: 150, size: '6x9' },
  '6x9_gold': { label: 'Full 6×9 Gold', price: 36700, maxWords: 62500, maxPages: 250, copies: 200, size: '6x9' },
  ebook_only: { label: 'Ebook Package', price: 6500, maxWords: 37500, maxPages: 150, copies: 0 },
  paperback_pkg: { label: 'Paperback Package', price: 8500, maxWords: 62500, maxPages: 250, copies: 0 },
  plus_pkg: { label: 'Plus Package', price: 12500, maxWords: 87500, maxPages: 350, copies: 0 },
};

const EDITING_PRICING = [
  { title: 'Copy Edit', price: 0.30, description: 'Professional copy editing per word - grammar, spelling, punctuation, syntax' },
  { title: 'Line Edit', price: 0.40, description: 'Line editing per word - flow, tone, word choice, repetition reduction' },
  { title: 'Content Edit', price: 0.50, description: 'Content editing per word - structure, style, manuscript assessment' },
  { title: 'Full Package Copy Edit', price: 0.65, description: 'Full package per word - content edit + revision period + copy edit' },
  { title: 'Full Package Line Edit', price: 0.75, description: 'Premium package per word - content edit + revision + advanced line edit' },
];

serve('seedServicesFromWebsite', async (req) => {
  try {
    const platform = createClientFromRequest(req);
    const user = await platform.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized - Admin only' }, { status: 403 });
    }

    const services = [];

    // 1. Cover Design Services
    for (const [variant, tiers] of Object.entries(COVER_DESIGN)) {
      for (const [tier, price] of Object.entries(tiers)) {
        const tierLabel = tier === 'authors' ? "Author's" : tier === 'stock' ? 'Stock' : 'Illustrated';
        const pkgLabel = variant === 'paperback' ? 'Print Cover' : 'Ebook Cover';
        const desc = variant === 'paperback' 
          ? 'Full print cover with front, spine and back cover integration'
          : 'Ebook front cover for Amazon Kindle';
        
        services.push({
          category: 'design',
          serviceName: `${tierLabel} Book Cover`,
          packageName: pkgLabel,
          description: `${tierLabel === "Author's" ? "Uses author professional image" : tier === 'stock' ? 'Shutterstock image integration' : 'Custom illustrated artwork'} - ${desc}`,
          pricingType: 'fixed',
          price: price,
          bookSizeCondition: variant === 'paperback' ? 'any' : 'ebook',
          active: true,
        });
      }
    }

    // 2. Typesetting Services
    for (const [tier, pricePerPage] of Object.entries(TYPESETTING)) {
      services.push({
        category: 'design',
        serviceName: `Typesetting - ${tier.charAt(0).toUpperCase() + tier.slice(1)}`,
        packageName: 'Per Page',
        description: `Professional book typesetting and layout - ${tier} tier`,
        pricingType: 'per_page',
        basePrice: pricePerPage,
        active: true,
      });
    }

    // 3. Publishing Packages
    for (const [key, pkg] of Object.entries(PACKAGES)) {
      services.push({
        category: 'publishing',
        serviceName: pkg.label,
        packageName: 'Publishing Package',
        description: `Complete publishing package - up to ${pkg.maxWords.toLocaleString()} words, ${pkg.copies > 0 ? pkg.copies + ' printed copies' : 'digital only'}`,
        pricingType: 'fixed',
        price: pkg.price,
        wordCountMax: pkg.maxWords,
        pageCountMax: pkg.maxPages,
        copyQuantityMax: pkg.copies,
        active: true,
      });
    }

    // 4. Editing Services
    for (const edit of EDITING_PRICING) {
      services.push({
        category: 'editing',
        serviceName: edit.title,
        packageName: 'Per Word',
        description: edit.description,
        pricingType: 'per_word',
        basePrice: edit.price,
        active: true,
      });
    }

    // Create all services in bulk
    const created = await platform.asServiceRole.entities.Service.bulkCreate(services);
    
    return Response.json({
      success: true,
      created: created.length,
      message: `Successfully imported ${created.length} services from website pricing`,
    });
  } catch (error) {
    console.error('Seed services error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});