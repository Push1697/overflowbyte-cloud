// Tells IndexNow search engines (Bing, and through it Yahoo, plus Yandex,
// Seznam, Naver) that pages changed, so they recrawl without waiting.
// Run after a deploy has gone live:  npm run seo:indexnow  [url ...]
// With no URLs it submits every URL in the live sitemap.
const SITE = 'https://www.overflowbyte.tech';
// Public by design: engines fetch SITE/<key>.txt to confirm we own the site.
const KEY = '558c196c303bf81edfdebdbf31588fcb';

const urls = process.argv.slice(2).length
  ? process.argv.slice(2)
  : [...(await (await fetch(`${SITE}/sitemap.xml`)).text()).matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);

if (urls.length === 0) {
  console.error('No URLs to submit (is the sitemap live?)');
  process.exit(1);
}

const res = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify({
    host: new URL(SITE).host,
    key: KEY,
    keyLocation: `${SITE}/${KEY}.txt`,
    urlList: urls,
  }),
});

// 200 = accepted, 202 = accepted and key check pending.
console.log(`IndexNow: ${res.status} ${res.statusText} for ${urls.length} URL(s)`);
if (!res.ok) process.exit(1);
