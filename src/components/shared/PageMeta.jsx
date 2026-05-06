import { useEffect } from 'react';

export default function PageMeta({ title, description, keywords }) {
  useEffect(() => {
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
    if (description) { setMeta('description', description); setOg('og:description', description); }
    if (title) setOg('og:title', title);
    if (keywords) setMeta('keywords', keywords);
  }, [title, description, keywords]);
  return null;
}