'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Two-way communication component for when this Next.js app is embedded
 * inside an iframe (e.g. on WordPress https://trpl.polmed.ac.id/hmps/).
 *
 * Sends navigation events, document title, meta description, and
 * thumbnail image immediately with zero delay.
 */
export default function IframeSync() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const isInsideIframe = window.parent && window.parent !== window;
    if (!isInsideIframe) return;

    const sendSync = () => {
      const ogImage =
        document.querySelector('meta[property="og:image"]')?.getAttribute('content') ||
        document.querySelector('meta[name="twitter:image"]')?.getAttribute('content') ||
        `${window.location.origin}/icon-512.png`;

      const metaDesc =
        document.querySelector('meta[name="description"]')?.getAttribute('content') ||
        document.querySelector('meta[property="og:description"]')?.getAttribute('content') ||
        'Himpunan Mahasiswa Program Studi Teknologi Rekayasa Perangkat Lunak Politeknik Negeri Medan';

      window.parent.postMessage(
        {
          type: 'HMPS_NAVIGATE',
          path: pathname,
          title: document.title,
          description: metaDesc,
          image: ogImage,
          url: window.location.href,
        },
        '*'
      );
    };

    // Send immediately (0ms)
    sendSync();

    // Confirm sync on next frame in case document.title was populated on client transition
    const raf = requestAnimationFrame(sendSync);
    return () => cancelAnimationFrame(raf);
  }, [pathname]);

  return null;
}
