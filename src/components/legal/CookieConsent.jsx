import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const STORAGE_KEY = 'cb-cookie-consent';
const GTM_ID = 'GTM-N6BB34Z9';
const FB_PIXEL_ID = '1702050791013937';

/** Load Google Tag Manager (analytics) once, only after consent. */
function loadGTM() {
  if (window.__cbGtmLoaded) return;
  window.__cbGtmLoaded = true;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });
  const s = document.createElement('script');
  s.async = true;
  s.src = 'https://www.googletagmanager.com/gtm.js?id=' + GTM_ID;
  document.head.appendChild(s);
}

/** Load the Meta / Facebook Pixel (marketing) once, only after consent. */
function loadPixel() {
  if (window.__cbPixelLoaded) return;
  window.__cbPixelLoaded = true;
  /* eslint-disable */
  !function (f, b, e, v, n, t, s) {
    if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments) };
    if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0';
    n.queue = []; t = b.createElement(e); t.async = !0;
    t.src = v; s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s);
  }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
  /* eslint-enable */
  window.fbq('init', FB_PIXEL_ID);
  window.fbq('track', 'PageView');
}

function applyConsent(consent) {
  if (consent?.analytics) loadGTM();
  if (consent?.marketing) loadPixel();
}

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let stored = null;
    try { stored = JSON.parse(localStorage.getItem(STORAGE_KEY)); } catch { /* ignore */ }
    if (stored) {
      applyConsent(stored);
    } else {
      setVisible(true);
    }
  }, []);

  const save = (consent) => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...consent, ts: Date.now() })); } catch { /* ignore */ }
    applyConsent(consent);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      className="fixed inset-x-0 bottom-0 z-[9999] p-3 sm:p-4 print:hidden"
    >
      <div className="max-w-3xl mx-auto rounded-xl border border-neutral-200 bg-white shadow-2xl px-5 py-4 sm:px-6 sm:py-5">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <p className="text-sm text-neutral-700 leading-relaxed flex-1">
            We use strictly necessary cookies to run this site, and — with your consent — analytics and
            marketing cookies to understand how it&rsquo;s used and to measure our advertising. See our{' '}
            <Link to="/cookie-policy" className="text-[#B87333] font-medium hover:underline">Cookie Policy</Link>.
          </p>
          <div className="flex flex-shrink-0 gap-2">
            <button
              onClick={() => save({ analytics: false, marketing: false })}
              className="px-4 py-2 rounded-lg text-sm font-medium text-neutral-700 border border-neutral-300 hover:bg-neutral-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B87333]"
            >
              Decline
            </button>
            <button
              onClick={() => save({ analytics: true, marketing: true })}
              className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-[#B87333] hover:bg-[#a5652d] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B87333]"
            >
              Accept all
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}