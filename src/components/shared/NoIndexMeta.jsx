import { useEffect } from 'react';

/**
 * Lightweight meta component for transactional / utility pages that must NOT
 * be indexed by search engines (Appendix A of the SEO plan).
 * Sets robots=noindex,nofollow on mount and restores index,follow on unmount.
 */
export default function NoIndexMeta({ title }) {
  useEffect(() => {
    if (title) document.title = title;

    let meta = document.querySelector('meta[name="robots"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'robots';
      document.head.appendChild(meta);
    }
    const previous = meta.content;
    meta.content = 'noindex, nofollow';

    return () => {
      meta.content = previous || 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1';
    };
  }, [title]);

  return null;
}