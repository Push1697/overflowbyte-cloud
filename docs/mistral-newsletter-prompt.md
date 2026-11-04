# Offload prompt: turn a weekly digest into a newsletter issue (Mistral)

Paste everything below the line, then paste the raw digest at the end. One
issue per run. The two finished examples to point it at are
`newsletters/overflowbyte-weekly-2026-10-25.md` and
`newsletters/overflowbyte-weekly-2026-11-01.md`.

Why the fact-check step exists: the Oct 25 digest called OpenTofu 1.9 a new
release candidate (it shipped in Jan 2025) and Kubernetes 1.35 "entering
feature freeze" (released Dec 2025), and the two digests disagree about
Linux 7.3. Digests are generated and can be wrong; the newsletter carries your
name.

---

You are writing one issue of **OverflowByte Weekly**, a newsletter for DevOps,
cloud and Linux engineers. Work in the repository at the current directory.

## Inputs
- Raw digest: at the end of this prompt.
- Issue number: <N> (one more than the newest file in `newsletters/`)
- Week: <e.g. Nov 2–8, 2026>, publish date <e.g. 8 Nov 2026>
- Style reference: read both example files named above first and match their
  structure, tone and depth.

## Step 1: fact-check before writing (report this table first)
For every item in the digest, fill in:

| Item | Claim | Primary source URL | Status |
| --- | --- | --- | --- |

Status is one of: `confirmed` (you opened a vendor/project/CVE page that says
it), `wrong` (a source contradicts it; say what is true), `unverified` (no
primary source found). Check version numbers and dates against the project's
own release page, and CVE IDs against nvd.nist.gov or the vendor advisory.
Also compare with earlier issues in `newsletters/`: a release "upcoming" this
week cannot have shipped in an earlier issue. If you cannot browse, mark
everything `unverified`; never guess a URL.

## Step 2: write the issue
File: `newsletters/overflowbyte-weekly-<YYYY-MM-DD>.md`

Frontmatter (exactly these keys):
```yaml
---
title: "<Headline of three hooks> — OverflowByte Weekly, <week>"
subtitle: "<one sentence, the three most useful things in the issue>"
tags: ["devops-weekly-updates", "<4-5 more lowercase-hyphenated tags>", "newsletter"]
series: "OverflowByte Weekly"
date: "<D Mon YYYY>"
draft: true
---
```

Body, in this order:
1. An HTML comment `<!-- EDITOR CHECKLIST ... -->` listing every item that is
   `wrong` or `unverified` from step 1. It is not rendered.
2. The banner: `![OverflowByte Weekly #<N> — <week>](/static/newsletter/<YYYY-MM-DD>-banner.svg)`
3. A two-sentence italic intro naming the week's theme.
4. **In this issue**: a numbered list of sections in bold, plain text (no
   `#anchor` links; headings have no ids on this site).
5. One `##` section per digest category, `###` per item. Each item gives:
   what happened (1-2 sentences), why it matters to an engineer, and **Do
   this:** with real commands or config when there is something to do.
6. A one-line sign-off linking to `/newsletter`.

Rules:
- `confirmed` items: add the source as a link in the item text.
- `wrong` items: write the corrected fact, or leave the item out and say so in
  the checklist. Never publish the wrong claim.
- `unverified` items: keep them short, use "reportedly", and add an inline
  `<!-- VERIFY: ... -->` comment.
- Commands and YAML must be real for current versions (`kubectl`, `dnf`,
  `apt`, `gh`, `aws`). If you are not sure a flag exists, leave it out.
- No placeholder text like "Lorem", "TBD" or "[link]".

## Step 3: diagrams
Add 4-6 Mermaid diagrams (```` ```mermaid ```` blocks), at most one per item,
only where a flow, sequence or decision is easier to see than to read:
attack chains, request paths, patch decision trees, before/after
architectures. Follow every diagram with 1-2 sentences saying what to notice.
Use `flowchart` or `sequenceDiagram`; put `<br/>` in long labels. Do not set
colours or themes (the site themes diagrams for day and night).

## Step 4: banner
```sh
npm run newsletter:banner -- --date <YYYY-MM-DD> --issue <N> \
  --range "<week>" --lines "<line 1>|<line 2>|<line 3>" --chips "<a>,<b>,<c>,<d>"
```
Three lines of at most ~26 characters each, at most 5 chips.

## Step 5: verify
```sh
npm run dev   # drafts are visible in dev only
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/newsletter/overflowbyte-weekly-<YYYY-MM-DD>
```
Open the page in day and night mode and confirm every diagram renders (a
diagram with a syntax error shows its source text instead).

## Report (exactly this)
```
FACT-CHECK: <the table from step 1>
WROTE: newsletters/overflowbyte-weekly-<date>.md, public/static/newsletter/<date>-banner.svg
DIAGRAMS: <count>, all rendered: yes/no (which failed)
VERIFIED: <command> -> <output line>
NOT VERIFIED: <anything you could not check>
```
Leave `draft: true`. The editor flips it after checking the sources.
