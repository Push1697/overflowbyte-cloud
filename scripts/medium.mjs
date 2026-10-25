#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

// Helper to load .env file if present
function loadEnv() {
  const envPath = path.resolve(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const idx = trimmed.indexOf('=');
      if (idx !== -1) {
        const key = trimmed.slice(0, idx).trim();
        const val = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  }
}

loadEnv();

const token = process.env.MEDIUM_TOKEN || process.env.MEDIUM_INTEGRATION_TOKEN;

function printUsage() {
  console.log(`
Medium Publishing Tool for Antigravity Agents

Usage:
  node scripts/medium.mjs whoami
  node scripts/medium.mjs publish <file.md> [options]

Options:
  --status <draft|public|unlisted>  Publish status (default: draft)
  --title <title>                   Override post title
  --tags <tag1,tag2>                Comma-separated tags (max 5)
  --canonical <url>                 Canonical URL pointing to original source (e.g. Hashnode)

Environment:
  MEDIUM_TOKEN: Your Medium Integration Token from Medium > Settings > Integration Tokens
`);
}

async function request(endpoint, options = {}) {
  if (!token) {
    console.error('Error: MEDIUM_TOKEN is not set in environment or .env');
    console.error('Obtain it from Medium: Settings -> Security and Apps / Developer -> Integration Tokens');
    process.exit(1);
  }

  const res = await fetch(`https://api.medium.com/v1${endpoint}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(options.headers || {})
    }
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.errors ? data.errors.map(e => e.message).join(', ') : `HTTP ${res.status}: ${res.statusText}`);
  }
  return data;
}

// Simple YAML frontmatter parser for markdown files
function parseMarkdown(content) {
  let metadata = {};
  let body = content;

  if (content.startsWith('---')) {
    const endIdx = content.indexOf('\n---', 3);
    if (endIdx !== -1) {
      const frontmatter = content.slice(3, endIdx).trim();
      body = content.slice(endIdx + 4).trim();
      for (const line of frontmatter.split('\n')) {
        const [k, ...v] = line.split(':');
        if (k && v.length) {
          const key = k.trim();
          let val = v.join(':').trim().replace(/^["']|["']$/g, '');
          if (val.startsWith('[') && val.endsWith(']')) {
            val = val.slice(1, -1).split(',').map(s => s.trim().replace(/^["']|["']$/g, ''));
          }
          metadata[key] = val;
        }
      }
    }
  }

  // Fallback: title from first H1 if not in frontmatter
  if (!metadata.title) {
    const h1Match = body.match(/^#\s+(.+)$/m);
    if (h1Match) {
      metadata.title = h1Match[1].trim();
    }
  }

  return { metadata, body };
}

async function whoami() {
  try {
    const result = await request('/me');
    const u = result.data;
    console.log('\n--- Medium Authenticated User ---');
    console.log(`ID:       ${u.id}`);
    console.log(`Username: ${u.username}`);
    console.log(`Name:     ${u.name}`);
    console.log(`URL:      ${u.url}`);
    return u;
  } catch (err) {
    console.error('Failed to get user profile:', err.message);
    process.exit(1);
  }
}

async function publish(filePath, args) {
  const absPath = path.resolve(process.cwd(), filePath);
  if (!fs.existsSync(absPath)) {
    console.error(`File not found: ${absPath}`);
    process.exit(1);
  }

  const raw = fs.readFileSync(absPath, 'utf8');
  const { metadata, body } = parseMarkdown(raw);

  const title = args.title || metadata.title || path.basename(filePath, path.extname(filePath));
  const status = args.status || 'draft';
  const canonicalUrl = args.canonical || metadata.canonicalUrl || metadata.canonical_url;
  
  let tags = [];
  if (args.tags) {
    tags = args.tags.split(',').map(t => t.trim());
  } else if (Array.isArray(metadata.tags)) {
    tags = metadata.tags;
  } else if (typeof metadata.tags === 'string') {
    tags = metadata.tags.split(',').map(t => t.trim());
  }
  // Medium allows max 5 tags
  tags = tags.slice(0, 5);

  const me = await request('/me');
  const userId = me.data.id;

  const payload = {
    title,
    contentFormat: 'markdown',
    content: raw, // Medium accepts full markdown including # title
    publishStatus: status,
    tags
  };

  if (canonicalUrl) {
    payload.canonicalUrl = canonicalUrl;
  }

  console.log(`\nPublishing to Medium (${status})...`);
  console.log(`Title: ${title}`);
  if (tags.length) console.log(`Tags: ${tags.join(', ')}`);
  if (canonicalUrl) console.log(`Canonical URL: ${canonicalUrl}`);

  try {
    const result = await request(`/users/${userId}/posts`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });

    const post = result.data;
    console.log('\n✅ Post created successfully!');
    console.log(`Status: ${post.publishStatus}`);
    console.log(`URL:    ${post.url}`);
    if (post.canonicalUrl) console.log(`Canonical: ${post.canonicalUrl}`);
  } catch (err) {
    console.error('Failed to publish post:', err.message);
    process.exit(1);
  }
}

// Argument parsing
const [cmd, ...rawArgs] = process.argv.slice(2);

const options = {};
let targetFile = null;

for (let i = 0; i < rawArgs.length; i++) {
  const arg = rawArgs[i];
  if (arg === '--status') options.status = rawArgs[++i];
  else if (arg === '--title') options.title = rawArgs[++i];
  else if (arg === '--tags') options.tags = rawArgs[++i];
  else if (arg === '--canonical') options.canonical = rawArgs[++i];
  else if (!arg.startsWith('--') && !targetFile) targetFile = arg;
}

if (cmd === 'whoami') {
  whoami();
} else if (cmd === 'publish' && targetFile) {
  publish(targetFile, options);
} else {
  printUsage();
}
