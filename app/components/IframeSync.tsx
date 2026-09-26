'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Two-way communication component for when this Next.js app is embedded
 * inside an iframe (e.g. on WordPress https://trpl.polmed.ac.id/hmps/).
 *
 * It sends navigation events and document title to the parent window
 * so the parent URL and browser tab title stay perfectly synchronized.
 */
export default function IframeSync() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const isInsideIframe = window.parent && window.parent !== window;
    if (!isInsideIframe) return;

    // Small delay to allow document.title from Next.js metadata to settle
    const timer = setTimeout(() => {
      window.parent.postMessage(
        {
          type: 'HMPS_NAVIGATE',
          path: pathname,
          title: document.title,
          url: window.location.href,
        },
        '*'
      );
    }, 50);

    return () => clearTimeout(timer);
  }, [pathname]);

  return null;
}
