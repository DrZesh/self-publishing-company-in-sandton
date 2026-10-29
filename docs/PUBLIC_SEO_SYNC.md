# Public website SEO page comparison and sync

Compared 29 October 2026:

- Base44-linked source: DrZesh/Creative-books-sa, commit a7cbe6b2ebbb8a965834e8c08956ff06c38a3f43.
- Migrated Vercel site: DrZesh/self-publishing-company-in-sandton, main cf5b7ba28a680ee514506fb527eb5f930387a539.

The Base44 connector could not access the original app, so the comparison uses its current GitHub-linked source, the same repository previously connected to the Base44 site's Vercel deployment. This is a source comparison; it does not prove there are no unpublished or unpushed edits in Base44.

## Findings

The Base44 source and updated Vercel application now have the same 343 public website routes, including legacy aliases. This count excludes the NDA-signing workflow and does not mean 343 distinct articles. All 47 dedicated SEO page components (location, industry, service and long-tail pages) already existed in the migrated site. No bulk duplication of those pages was necessary.

One SEO URL was missing: /how-to-get-an-isbn-in-south-africa. Base44 reuses the existing ISBNRegistration component at this newer canonical URL, with an updated NLSA guide, metadata and FAQ schema.

## Applied

- Copied the updated ISBN guide from the pinned Base44-linked source.
- Added the canonical ISBN route.
- Added permanent Vercel redirects from /isbn and /isbnregistration, with matching client-side aliases.
- Synced the sitemap's ISBN entry to the new canonical URL.
- Updated public navigation, footer, related-content links and prefetch mappings to the canonical URL.

CRM/admin code, authentication, Supabase access, historical data and notification workflows were not copied from Base44. Source-only /admin/signed-agreements, /oauth/consent and /resources/documents/nda/sign are outside this public SEO sync. Existing source differences in calculator, pricing and form workflows were not used to overwrite the migrated implementation.

## Validation

Automated checks verify that every sitemap URL has an explicit route, sitemap URLs are unique and exclude admin pages, the ISBN URL matches its canonical metadata, and both legacy ISBN redirects are permanent. Production build and full regression tests are run before publishing. Live verification checks the new URL, legacy redirects, sitemap and representative existing public SEO pages.

Search-engine indexing and ranking are not implied by route parity. Canonical public URLs continue to use https://creativebooks.co.za; Vercel preview URLs remain for deployment verification.
