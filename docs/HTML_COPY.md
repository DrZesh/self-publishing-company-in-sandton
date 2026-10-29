# Creative Books SA: isolated HTML copy

This is a separate experimental copy of production commit `ca2099879daa1294fa7efc718a04de94af31031e`. Do not merge it into main or upload it over the live site.

## What it does

- `npm ci` then `npm run build` generates the normal browser assets and a separate HTML file for every public sitemap URL.
- Public content is rendered from the existing components, preserving the existing styling and wording. JavaScript still powers navigation, calculators and interactive controls.
- Only public sitemap routes are rendered. CRM records, private portals, invoices, quotes and signing pages are never exported into HTML.
- Existing public aliases are resolved when generating their HTML.
- The generated `dist/html-export-report.json` lists each exported URL and its checks.
- Preview pages include noindex metadata; robots.txt disallows crawling. These are crawler instructions, not password protection.
- Apache `.htaccess` serves real HTML files first and falls back to the application for other routes. It also includes the two existing ISBN redirects. Apache hosting compatibility still requires testing on the selected host.

## Isolation

The production source folder, main branch, Vercel project, DNS and Supabase database are unchanged. No database migrations or imports are run for this copy. Automatic Vercel Git deployment is disabled in this branch's vercel.json.

Environment files and Vercel project links were excluded from the local copy. The Supabase client refuses connections unless `VITE_COPY_CONNECT_LIVE=true` is explicitly provided along with the usual public URL and publishable key. Leave this unset during design review. A public form therefore cannot submit to the production database in the default build.

The original Supabase integration is retained for later reconnection. No private keys or historical CRM export records are included. This is a website copy, not a new database or database backup.

## Preview and limitations

Run `npm run preview` after building, then inspect the supplied local URL. Serve dist over HTTP; do not open index.html directly using file:// URLs. Navigation and layout need browser review before hosting.

The first HTML render omits browser-only editors and maps. The normal browser JavaScript mounts interactive widgets afterwards. Animation wrappers render their content visibly in the generated HTML. Images and fonts still depend on their existing external hosts; this is not a fully offline archive.

Pages whose content is fetched from the database retain their initial public state in the disconnected preview. Forms, login, database-dependent pricing/settings and CRM workflows require a separately reviewed staging connection before functional testing. Previously blocked integrations remain blocked.

## Next steps

1. Review the exported public pages on a separate preview address.
2. Confirm the destination host and test direct URL access, mobile layout, media, calculators and redirects.
3. Choose a staging database for form/CRM tests, or explicitly authorise connecting this copy to production. Do not enable live access merely to review the design.
4. Only after review, decide whether to replace the existing site. Revisit noindex, canonical URLs, Auth redirects and email links at that point.
