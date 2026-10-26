# Hashnode-ready mirrors of the learning.overflowbyte.cloud posts

Generated from `../../../quartz_blog/content/blog/` by `scripts/hashnode-prep.mjs`
and checked word for word by `scripts/hashnode-verify.mjs`.

## Blocked: the Hashnode API needs Pro

Every publication-scoped operation on `blog.overflowbyte.cloud` currently returns:

```
Publication does not have an active Pro plan. Upgrade in your dashboard to
access this via the API. (FORBIDDEN)
```

That covers `post create`, `draft create`, `post list`, `publication get`,
`series list` and `image upload` — reads as well as writes. Hashnode moved all
API access behind Pro (~$5/mo) in May 2026, which is also the month the
publication's newest post dates from. Authentication is fine; the plan is the
only blocker (`hashnode whoami` → `@deepdev`).

Two ways forward:

1. **Upgrade the publication to Pro**, then run the commands below. Nothing else
   needs to change.
2. **Paste by hand** into the Hashnode editor. The `.md` files here are already
   in Hashnode's flavour of markdown — paste the body, then copy the metadata
   out of the matching `.json`.

## Publishing once Pro is active

```sh
npm run hashnode:publish -- dist/hashnode/nacl-vs-security-groups-on-aws.json \
  dist/hashnode/nacl-vs-security-groups-on-aws.md \
  --cover https://learning.overflowbyte.cloud/attachments/nacl-vs-sg-01-title.webp

npm run hashnode:publish -- dist/hashnode/php2shell-and-node2shell-runtime-rce.json \
  dist/hashnode/php2shell-and-node2shell-runtime-rce.md
```

Add `--dry` to print the argv without calling the API, or `--draft` to create a
draft instead of publishing. Hashnode caps posts at 5 tags; `php2shell` carries
7 in the garden, so pass `--tags security,php,nodejs,cve,devops` if the full set
is rejected.

## Regenerating after an edit in the garden

```sh
npm run hashnode:prep -- ../quartz_blog/content/blog/<slug>.md <images.json|-> out.md out.json
npm run hashnode:verify -- ../quartz_blog/content/blog/<slug>.md out.md
```

`hashnode:verify` compares word multisets. A clean run reports only:

- image filenames moving to full URLs, and
- the words of a leading `# Title` that became the Hashnode title field.

Anything else in `MISSING` means prose was dropped.

## What the converter rewrites, and why

The prose is copied verbatim. Only constructs Hashnode cannot render are
touched, and none of them drop a word:

| Garden source | Hashnode output | Reason |
| --- | --- | --- |
| YAML frontmatter | metadata `.json` | Hashnode takes these as API fields |
| leading `# Title` | removed | Hashnode renders the title field; it would appear twice |
| `![[file.webp\|alt]]` | `![alt](https://learning.overflowbyte.cloud/attachments/file.webp)` | Obsidian embeds are not markdown |
| `[[slug\|Label]]` | `[Label](https://learning.overflowbyte.cloud/blog/slug)` | same |
| `> [!danger] Heading` | `> **🚨 Heading**` | Hashnode prints the literal `[!danger]` |
| `%% comment %%` | removed | Obsidian-only, invisible in the garden too |
| `<style>` blocks | removed | sanitised by Hashnode; contains no prose |
| inline-styled `<div>` / `<iframe>` chrome | markdown keeping every word it held | sanitised by Hashnode, which would silently eat the text inside |
| `href="/static/…"` | absolute garden URL | relative links would 404 on Hashnode |

### Images are hotlinked, not uploaded

`hashnode image upload` is Pro-gated too, so the 19 NACL diagrams point at the
garden's own `/attachments/` paths. All 19 were verified to return HTTP 200 with
a byte count matching the local original. The trade-off: Hashnode's copy depends
on the garden staying up, and these URLs must keep working. Re-run the uploads
through `image upload` after going Pro if you would rather Hashnode's CDN served
them.

### The PHP2Shell interactive lab

That post embeds an animated simulation in an `<iframe>`. Hashnode strips
iframes, so the mirror links to the real thing at
`https://learning.overflowbyte.cloud/static/php2shell-node2shell.html`
(confirmed loading) and keeps the surrounding words — "CRITICAL RUNTIME
ZERO-DAY · CVSS 9.2 · EXPLOITED IN THE WILD" and the lab heading — as markdown.
The sentence "The animated attack simulation is interactive and cannot be
embedded here." is the only prose added by the conversion.

## Metadata

### nacl-vs-security-groups-on-aws

- **Title:** NACL vs Security Groups on AWS: Which Firewall Actually Stops Your Traffic?
- **Tags:** `aws` `vpc` `networking` `security` `firewall`
- **Canonical:** https://learning.overflowbyte.cloud/blog/nacl-vs-security-groups-on-aws
- **Published at:** 2026-10-19
- **Cover:** https://learning.overflowbyte.cloud/attachments/nacl-vs-sg-01-title.webp

### php2shell-and-node2shell-runtime-rce

- **Title:** PHP2Shell and Node2Shell: The Runtime-Level RCE You Can't Code Around
- **Tags:** `security` `php` `nodejs` `cve` `devops` `incident-response` `runbook`
- **Canonical:** https://learning.overflowbyte.cloud/blog/php2shell-and-node2shell-runtime-rce
- **Published at:** 2026-10-23
- **Cover:** none in the source post
