---
name: hashnode-publishing
description: Guides publishing, drafting, updating, and managing blog posts on Hashnode using the Hashnode MCP server and Hashnode CLI. Use whenever the user wants to draft, publish, edit, or manage Hashnode blog posts or publications.
---

# Hashnode Publishing & Management Skill

This skill enables Antigravity agents to draft, review, update, and publish blog posts to Hashnode directly from Obsidian markdown files.

## 1. Authentication & Configuration

The CLI and MCP server interact with your Hashnode account.

### Check Current Auth Status
```bash
hashnode whoami
```

### Sign In
If not logged in, run:
```bash
hashnode login
```
Or for non-interactive / CI / script workflows, set:
```bash
$env:HASHNODE_PAT="your_personal_access_token"
```

### Publication Identification
Set the default publication ID in your environment or pass `-p <id>`:
```bash
# List publications you own
hashnode publication list

# Or get details by blog domain/subdomain
hashnode --host yourblog.hashnode.dev publication get
```
You can set persistent environment variables:
```bash
$env:HASHNODE_PUBLICATION_ID="your_publication_id"
$env:HASHNODE_PUBLICATION_HOST="yourblog.hashnode.dev"
```

---

## 2. Publishing Workflow

### A. Publish a New Post Immediately
```bash
hashnode -p <publication-id> post create \
  --title "Your Post Title" \
  --content-file ./path/to/post.md \
  --tag "tag1,tag2"
```

Options:
- `--title <title>`: Post title (required).
- `--content-file <file>`: Markdown content file (required, or `-` for stdin).
- `--tag <tags>`: Comma-separated tags (e.g. `javascript,webdev`).
- `--subtitle <text>`: Optional post subtitle.
- `--cover-image <url>`: URL of cover image.
- `--slug <slug>`: Custom URL slug.
- `--original-article-url <url>`: Canonical URL if cross-posting.
- `--series-id <id>`: Add to a Hashnode series.

### B. Create a Draft First (Recommended for Review)
```bash
hashnode -p <publication-id> draft create \
  --title "Your Draft Title" \
  --content-file ./path/to/post.md \
  --tag "tag1,tag2"
```

To publish an existing draft:
```bash
hashnode draft publish <draft-id>
```

### C. Upload Images to Hashnode CDN
Before publishing, local images referenced in markdown can be uploaded to Hashnode's CDN:
```bash
hashnode image upload ./path/to/image.png
```
Returns the CDN URL to embed in markdown.

### D. Update Existing Post
```bash
hashnode post update <post-id> --title "Updated Title" --content-file ./updated.md
```

### E. List & Search Posts
```bash
# List latest posts
hashnode -p <publication-id> post list

# Search posts
hashnode -p <publication-id> post search "search query"
```

---

## 3. Obsidian Markdown Compatibility
- Frontmatter (YAML) can be parsed or converted by the agent into CLI flags (`title`, `tags`, `subtitle`, `slug`).
- Internal Obsidian wikilinks `[[Link]]` should be converted into standard Markdown links `[Link](url)` before publishing.
