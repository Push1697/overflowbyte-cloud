# Blog Publishing Vault Rules (Hashnode & Medium)

This repository is an Obsidian-based vault for authoring, staging, and publishing technical articles to both **Hashnode** and **Medium** ([Pushpendra – Medium](https://overflowbyte.medium.com/)).

## Available Tools & Skills
- **Hashnode MCP & CLI**:
  - Remote MCP endpoint configured at `https://mcp.hashnode.com/mcp` via `.agents/mcp_config.json`.
  - Skill: `.agents/skills/hashnode-publishing/SKILL.md`.
- **Medium Integration Tool**:
  - Script: `scripts/medium.mjs` (uses Medium REST API with native fetch).
  - Skill: `.agents/skills/medium-publishing/SKILL.md`.

## Publishing Guidelines
1. **Draft First**: Unless the user explicitly requests immediate live publishing, default to creating a draft (`draft create` for Hashnode, `--status draft` for Medium) so the user can preview.
2. **Canonical Links (SEO Protection)**:
   - When cross-posting an article between Hashnode and Medium, **always** specify the canonical URL (`--canonical` for Medium or `--original-article-url` for Hashnode) so search engines don't penalize duplicate content.
3. **Format Cleanliness**: Ensure Obsidian wikilinks `[[note]]` are resolved to standard markdown links `[Title](url)` before publishing.
4. **Environment**: Use `.env` for publication IDs and API tokens (`HASHNODE_PAT`, `HASHNODE_PUBLICATION_ID`, `MEDIUM_TOKEN`).
