import { useState, useCallback, useRef, useEffect } from 'react';
import { platform } from '@/api/platformClient';

/**
 * Triggers a real file download and shows a transient "download started" toast.
 * Also increments the document's download_count (best-effort, non-blocking).
 */
export default function useDocumentDownload() {
  const [toast, setToast] = useState(null);
  const timerRef = useRef(null);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const download = useCallback((doc) => {
    if (!doc?.file_url) return;

    // Fire the actual download without delay
    const a = document.createElement('a');
    a.href = doc.file_url;
    a.download = '';
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    // Confirmation toast
    setToast(doc.title);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setToast(null), 3200);

    // Best-effort download counter
    platform.entities.ResourceDocument
      .update(doc.id, { download_count: (doc.download_count || 0) + 1 })
      .catch(() => {});
  }, []);

  const trackView = useCallback((doc) => {
    if (!doc?.id) return;
    platform.entities.ResourceDocument
      .update(doc.id, { view_count: (doc.view_count || 0) + 1 })
      .catch(() => {});
  }, []);

  return { download, trackView, toast, dismiss: () => setToast(null) };
}