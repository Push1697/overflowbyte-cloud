import fs from 'node:fs';
import path from 'node:path';

const ROOT_DIR = process.cwd();
const STATIC_DIR = path.join(ROOT_DIR, 'public', 'static');
const POSTS_DIR = path.join(ROOT_DIR, 'posts');

// Read reference file to get the exact CSS and JS
const referenceHtml = fs.readFileSync(path.join(STATIC_DIR, 'php2shell-node2shell.html'), 'utf-8');

const styleMatch = referenceHtml.match(/<style>([\s\S]*?)<\/style>/);
if (!styleMatch) throw new Error('Style block missing');
const baseStyles = styleMatch[1];

const scriptMatch = referenceHtml.match(/<script>([\s\S]*?)<\/script>/);
if (!scriptMatch) throw new Error('Script block missing');
const baseScript = scriptMatch[1];

// Helper to assemble full HTML page
function renderHtmlPage({
  metaTitle,
  metaDesc,
  metaKeywords,
  badgeText,
  badgeColor = 'indigo', // indigo, red, orange, green, byte
  titleHtml,
  subtitle,
  date,
  sectionsHtml,
  sourcesHtml
}) {
  const badgeColors = {
    indigo: { bg: 'rgba(99,102,241,0.12)', border: 'rgba(99,102,241,0.3)', color: 'var(--indigo-light)', dot: 'var(--indigo)' },
    red: { bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.3)', color: 'var(--red-glow)', dot: 'var(--red)' },
    orange: { bg: 'rgba(242,153,74,0.12)', border: 'rgba(242,153,74,0.3)', color: 'var(--orange)', dot: 'var(--orange)' },
    green: { bg: 'rgba(34,197,94,0.12)', border: 'rgba(34,197,94,0.3)', color: 'var(--green-glow)', dot: 'var(--green)' },
    byte: { bg: 'rgba(92,225,255,0.12)', border: 'rgba(92,225,255,0.3)', color: 'var(--byte)', dot: 'var(--byte)' }
  };
  const b = badgeColors[badgeColor] || badgeColors.indigo;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${metaTitle} | OverflowByte</title>
  <meta name="description" content="${metaDesc}">
  <meta name="keywords" content="${metaKeywords}">
  <meta name="author" content="Pushpendra Dev — OverflowByte">
  <meta property="og:title" content="${metaTitle}">
  <meta property="og:description" content="${metaDesc}">
  <meta property="og:type" content="article">

  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet">

  <style>
${baseStyles}
    .hero-badge.badge-custom {
      background: ${b.bg};
      border-color: ${b.border};
      color: ${b.color};
    }
    .hero-badge.badge-custom .pulse {
      background: ${b.dot};
    }
  </style>
</head>
<body>

<div class="backdrop"></div>

<!-- HERO -->
<header class="hero">
  <div class="hero-badge badge-custom">
    <span class="pulse"></span>
    ${badgeText}
  </div>

  <h1>
    ${titleHtml}
  </h1>

  <p class="hero-sub">
    ${subtitle}
  </p>

  <div class="hero-meta">
    <span>${date}</span>
    <span>By Pushpendra Dev</span>
    <span>OverflowByte Engineering</span>
  </div>

  <div class="scroll-hint">
    <div class="arrow"></div>
    SCROLL TO EXPLORE
  </div>
</header>

<main class="container">
${sectionsHtml}

  <div class="divider"></div>

  <!-- SOURCES / REFERENCES -->
  <section class="section" id="references">
    <div class="section-label">08 — REFERENCES & DOCUMENTATION</div>
    <h2>Verified engineering sources</h2>
    <ul class="sources-list">
      ${sourcesHtml}
    </ul>
  </section>

  <div class="divider"></div>

  <!-- FOOTER -->
  <footer class="footer">
    <div class="footer-brand">Overflow<span class="ob">Byte</span></div>
    <div class="footer-tag">DevOps · Cloud · Linux Internals</div>
    <div class="footer-links">
      <a href="/" target="_blank" rel="noopener">Home</a>
      <a href="/blog" target="_blank" rel="noopener">Blog</a>
      <a href="/learn" target="_blank" rel="noopener">Interactive Decks & Labs</a>
      <a href="https://github.com/Push1697" target="_blank" rel="noopener">GitHub</a>
      <a href="https://overflowbyte.medium.com/" target="_blank" rel="noopener">Medium</a>
    </div>
  </footer>

</main>

<script>
${baseScript}
</script>

</body>
</html>`;
}

// Load data generator functions from separate module
export { renderHtmlPage, STATIC_DIR, POSTS_DIR };
