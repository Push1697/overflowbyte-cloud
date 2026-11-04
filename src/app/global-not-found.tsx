import './(site)/globals.css';
import type { Metadata } from 'next';
import NotFound from './(site)/not-found';

/* The app has two root layouts, (site) and (payload), so a URL that matches
   neither has no layout to render inside. This page carries its own <html>,
   and applies the saved theme the same way (site)/layout.tsx does. */

export const metadata: Metadata = {
  title: '404 — OverflowByte',
};

export default function GlobalNotFound() {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <script
          dangerouslySetInnerHTML={{
            __html:
              "(function(){try{var t=localStorage.getItem('ob-theme');if(!t){t=window.matchMedia('(prefers-color-scheme: light)').matches?'light':'dark';}document.documentElement.dataset.theme=t;}catch(e){}})();",
          }}
        />
        <main id="main">
          <NotFound />
        </main>
      </body>
    </html>
  );
}
