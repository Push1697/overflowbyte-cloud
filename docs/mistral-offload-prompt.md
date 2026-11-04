# Offload prompt for code tasks (Mistral)

Paste everything below the line, then fill in the TASK block. Keep one task
per run; split anything that touches more than one area (UI, CMS, scripts).

Why it looks like this: the last hand-off reported "tsc clean, build green"
while the admin could not load (missing `'use server'`, two nested `<html>`
roots, empty import map), the sync script threw on its first item (`.then()`
on a string) and pointed at a 404 feed, and `cms:push` would have duplicated
every flagship. Everything it claimed was true, and none of it showed the
features worked. The rules below make "done" mean the feature was exercised
at runtime.

---

You are working in a Next.js 16 + Payload CMS 3 repository on Windows (Git
Bash and PowerShell available, Node 24). Read `AGENTS.md`, `docs/cms.md` and
the files named in the task before writing code. This Next.js version differs
from your training data: check `node_modules/next/dist/docs/` for any API you
use.

## TASK
- Goal: <one sentence, user-visible outcome>
- Files you may change: <list>
- Files you must not change: `src/app/(site)/blog/page.tsx` FLAGSHIPS data,
  `posts/0*-*.md` (hand-written flagships), `public/assets/logo/*`,
  `payload.config.ts` db adapter, anything not listed above
- Done when: <observable checks, e.g. "GET /newsletter lists 6 issues newest
  first", "admin save of post X rewrites posts/X.md and nothing else">

## Repository facts you must respect
- Site routes live in `src/app/(site)/`, Payload in `src/app/(payload)/`.
  Each group has its own root layout. Never add `src/app/layout.tsx`.
- Content is markdown in `posts/` and `newsletters/`. The filename is the
  route slug; a `NN-` prefix marks a flagship. Frontmatter `slug` is the
  Hashnode slug, not the route.
- `src/payload/markdown.ts` is the only place that maps CMS documents to
  markdown. Change it there, never duplicate it in a script.
- Payload CLI must run with `--disable-transpile` (tsx crashes on Node 24), so
  local imports in `payload.config.ts`, `src/payload/`, `scripts/cms-*.mts`
  need explicit `.ts` extensions.
- Day/night theme: colours come from tokens in `src/app/(site)/globals.css`
  (`:root` and `:root[data-theme='light']`). No hex or rgb literals in
  components. `--accent` is for text, `--accent-fill` for solid fills. The
  logo PNGs are never recoloured.
- Never embed other sites in iframes.

## How to work
1. Before editing, write 3-6 lines: what you will change, in which files, and
   how you will prove it works. If the task needs a file outside the allowed
   list, stop and say so instead of changing it.
2. Any external URL, feed or API: fetch it first (`curl -sI`, `curl -s | head`)
   and quote the status code in your report. Never ship a URL you have not
   fetched.
3. Any script you write: run it. Use `--dry-run` first if it writes files,
   then for real, then show a sample of the output files.
4. Any route or admin change: run `npx next build`, then `npx next start -p
   3123` with `PAYLOAD_SECRET=test`, and `curl` each affected route. Report the
   status code, plus a grep that proves the content is there (e.g. a heading
   text, the count of `<html` tags = 1).
5. Anything that writes files: run `git status --short` afterwards and confirm
   only intended files changed.
6. Run `npx tsc --noEmit -p .` and `npx eslint .`. Paste the last lines.

## Report format (exactly this, nothing else)
```
CHANGED: <file> — <one line why>   (one per file)
VERIFIED:
  <command>  ->  <the actual output line that proves it>
NOT VERIFIED: <anything you could not run, and why>
RISKS: <behaviour that changed beyond the goal, or "none">
```
Do not write "should work", "will be regenerated automatically" or "untested
but". If you could not run it, it goes under NOT VERIFIED.
