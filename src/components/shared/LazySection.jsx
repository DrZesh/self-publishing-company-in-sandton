import { useState, useEffect, useRef } from 'react';

/**
 * Defers rendering children until they are near the viewport.
 * Eliminates unnecessary Framer Motion work and React renders on initial load.
 */
export default function LazySection({ children, fallback = null, rootMargin = '300px' }) {
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [rootMargin]);

  return (
    <div ref={ref} style={visible ? undefined : { minHeight: '1px' }}>
      {visible ? children : fallback}
    </div>
  );
}