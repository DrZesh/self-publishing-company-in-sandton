import { setStaticHead } from '@/lib/static-head';
import { useEffect } from 'react';
import { organizationSchema, websiteSchema } from '@/lib/seo/schemas';

export default function PageMeta({
  title,
  description,
  keywords,
  canonical,
  ogImage = 'https://media.base44.com/images/public/69fb173eeab1ba78da6eab45/a56a0b3c6_generated_e004f6f0.png',
  ogType = 'website',
  schema,
  noindex = false,
}) {
  // This isolated copy must stay out of search results until launch.
  noindex = true;
  canonical = canonical?.replace(/^https?:\/\/[^/]+/, 'https://creativebooks.co.za');
  if (import.meta.env.SSR) setStaticHead({ title, description, keywords, canonical, ogImage, ogType, schema: { '@context': 'https://schema.org', '@graph': [organizationSchema, websiteSchema, ...(schema && schema['@graph'] ? schema['@graph'] : schema ? [schema] : [])] } });
  useEffect(() => {
    const siteUrl = 'https://creativebooks.co.za';

    // Add hreflang tags
    const addHreflang = (lang, href) => {
      let el = document.querySelector(`link[rel="alternate"][hreflang="${lang}"]`);
      if (!el) { el = document.createElement('link'); el.rel = 'alternate'; el.setAttribute('hreflang', lang); document.head.appendChild(el); }
      el.href = href;
    };
    addHreflang('en', siteUrl);
    addHreflang('en-ZA', siteUrl);

    // Title
    if (title) document.title = title;

    const setMeta = (name, content) => {
      let el = document.querySelector(`meta[name="${name}"]`);
      if (!el) { el = document.createElement('meta'); el.name = name; document.head.appendChild(el); }
      el.content = content;
    };
    const setOg = (property, content) => {
      let el = document.querySelector(`meta[property="${property}"]`);
      if (!el) { el = document.createElement('meta'); el.setAttribute('property', property); document.head.appendChild(el); }
      el.content = content;
    };
    const setTwitter = (name, content) => {
      let el = document.querySelector(`meta[name="${name}"]`);
      if (!el) { el = document.createElement('meta'); el.name = name; document.head.appendChild(el); }
      el.content = content;
    };
    const setLink = (rel, href) => {
      let el = document.querySelector(`link[rel="${rel}"]`);
      if (!el) { el = document.createElement('link'); el.rel = rel; document.head.appendChild(el); }
      el.href = href;
    };

    // Robots
    setMeta('robots', noindex ? 'noindex, nofollow' : 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1');

    // Description & Keywords
    if (description) setMeta('description', description);
    if (keywords) setMeta('keywords', keywords);

    // Open Graph
    if (title) setOg('og:title', title);
    if (description) setOg('og:description', description);
    setOg('og:type', ogType);
    setOg('og:image', ogImage);
    setOg('og:image:width', '1200');
    setOg('og:image:height', '630');
    setOg('og:site_name', 'Creative Books');
    setOg('og:locale', 'en_ZA');

    // Twitter Cards
    setTwitter('twitter:card', 'summary_large_image');
    setTwitter('twitter:title', title || '');
    setTwitter('twitter:description', description || '');
    setTwitter('twitter:image', ogImage);
    setTwitter('twitter:site', '@CreativeBooksSA');

    // Canonical
    const canonicalHref = canonical || siteUrl + window.location.pathname;
    setLink('canonical', canonicalHref);
    setOg('og:url', canonicalHref);

    // Schema markup - include Organization & Website by default, plus page-specific schema
    const allSchemas = {
      '@context': 'https://schema.org',
      '@graph': [
        organizationSchema,
        websiteSchema,
        ...(schema && schema['@graph'] ? schema['@graph'] : schema ? [schema] : [])
      ]
    };

    const id = 'page-schema';
    let existing = document.getElementById(id);
    if (existing) existing.remove();
    const el = document.createElement('script');
    el.id = id;
    el.type = 'application/ld+json';
    el.text = JSON.stringify(allSchemas);
    document.head.appendChild(el);

    // Cleanup schema on unmount
    return () => {
      const s = document.getElementById('page-schema');
      if (s) s.remove();
    };
  }, [title, description, keywords, canonical, ogImage, ogType, schema, noindex]);

  return null;
}