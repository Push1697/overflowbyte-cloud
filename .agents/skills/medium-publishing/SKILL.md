---
name: medium-publishing
description: Guides drafting, publishing, and cross-posting articles to Medium (https://overflowbyte.medium.com/) using the Medium API script and canonical URL handling. Use whenever the user wants to publish or cross-post articles between Hashnode and Medium.
---

# Medium Publishing & Cross-Posting Skill

This skill enables Antigravity agents to draft, publish, and cross-post technical articles to the user's Medium publication ([Pushpendra – Medium](https://overflowbyte.medium.com/)) with automated SEO canonical link handling.

## 1. Authentication

Medium uses an Integration Token (set in `.env` as `MEDIUM_TOKEN` or `MEDIUM_INTEGRATION_TOKEN`).

### Check Profile
```bash
node scripts/medium.mjs whoami
```

---

## 2. Publishing Workflow

### A. Create a Draft on Medium (Recommended)
```bash
node scripts/medium.mjs publish ./sample-post.md --status draft --tags "javascript,webdev"
```

### B. Publish Live to Medium
```bash
node scripts/medium.mjs publish ./sample-post.md --status public --tags "javascript,webdev"
```

### C. Cross-Posting Between Hashnode & Medium (SEO Canonical Link)

#### Option 1: Hashnode First -> Cross-post to Medium (Recommended)
1. Publish the post to Hashnode:
   ```bash
   hashnode post create --title "Title" --content-file ./post.md --tag javascript
   ```
2. Get the published Hashnode URL (e.g. `https://yourblog.hashnode.dev/article-slug`).
3. Cross-post to Medium with canonical URL pointing back to Hashnode:
   ```bash
   node scripts/medium.mjs publish ./post.md --status draft --canonical "https://yourblog.hashnode.dev/article-slug"
   ```
   *This ensures Google attributes 100% of the SEO juice to your primary Hashnode blog.*

#### Option 2: Medium First -> Cross-post to Hashnode
1. Publish on Medium:
   ```bash
   node scripts/medium.mjs publish ./post.md --status public
   ```
2. Cross-post to Hashnode with the Medium canonical URL:
   ```bash
   hashnode post create --title "Title" --content-file ./post.md --tag javascript --original-article-url "https://overflowbyte.medium.com/article-slug"
   ```

#### Option 3: Medium Web Story Importer
Navigate to `https://medium.com/p/import` and paste your Hashnode article URL. Medium automatically imports the content and adds the canonical tag.
