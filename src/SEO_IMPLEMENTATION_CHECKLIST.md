# SEO Implementation Checklist - Creative Books SA

## Completed ✅

1. **Add AggregateRating to LocalBusiness** - Enhanced localBusinessSchemaForCity with rating values
2. **Add Offer/PriceSpecification schema** - Created `offerSchema()` helper for pricing pages
3. **Image optimization** - Added width/height attributes to HeroSlider images (1800x1000)
4. **Internal linking anchors** - Added title attributes to internal links for better context
5. **Add FAQ schema to all service pages** - Already implemented in ServicePageTemplate
6. **Add LocalBusiness schema variations for cities** - Created localBusinessSchemaForCity() with lat/lon for all 17 city pages
7. **Add hreflang tags** - Implemented in PageMeta for en and en-ZA
8. **Unique meta descriptions** - Already done per-page in each service page

## To-Do (Manual Optimization)

1. **Optimize meta title lengths** - Review titles to ensure 50-60 character length
   - Example: Current titles may exceed 60 chars
   - Run through: https://www.serpsim.com/

2. **Add width/height to remaining images** - Add to:
   - ServicesGrid cards
   - About section images
   - Package preview images
   - Apply to all `<img>` tags systematically

3. **Content roadmap** - Create blog articles targeting these keywords:
   - "How much does self-publishing cost in South Africa"
   - "Self-publishing vs traditional publishing 2025"
   - "Best book sizes for self-publishing"
   - "ISBN registration process South Africa"
   - "Book printing turnaround times"

4. **Implement Offer schema on pricing pages** - Use offerSchema() in:
   - pages/publishing/MiniPackages.jsx
   - pages/publishing/FullPackagesA5.jsx
   - pages/publishing/FullPackages6x9.jsx
   - Add to ServicePageTemplate when pricingSection is provided

5. **Breadcrumb component on all pages** - Already created, needs integration on:
   - All location pages
   - All service pages
   - All printing pages

## Quick Wins Remaining

- [ ] Add structured data testing via Google Rich Results Test
- [ ] Monitor Core Web Vitals (ensure images load efficiently)
- [ ] Add FAQ schema to blog article pages
- [ ] Create sitemaps for blog content structure
- [ ] Set up Google Search Console for monitoring