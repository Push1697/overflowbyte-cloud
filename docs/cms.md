# CMS & content pipeline

The site renders markdown from `posts/` and `newsletters/`. Payload CMS
(admin at **`/admin`**) is the editing surface on top of those files. The
mapping between the two lives in one place, `src/payload/markdown.ts`.

```
Hashnode ─┐                                       ┌─ /blog/<slug>
Medium  ──┴─ sync:cross-platform ─► posts/*.md ───┤
                                    newsletters/  └─ /newsletter/<slug>
                                        ▲   │
                         admin save ────┘   └──── cms:push ──► Payload DB
                         cms:pull ◄──────────────────────────── (SQLite / Turso)
```

## Commands

```sh
npm run dev                  # site on :3000, admin on :3000/admin
npm run sync:cross-platform  # mirror Hashnode posts + weekly issues + Medium into markdown
npm run cms:push             # markdown files -> CMS database (idempotent)
npm run cms:pull             # CMS database -> markdown files
npm run cms:backup           # snapshot payload.db into backups/
npm run cms:importmap        # regenerate the admin import map after adding custom admin components
npm run cms:types            # regenerate src/payload-types.ts
```

The Payload CLI runs with `--disable-transpile` (Node's own TypeScript
support). Its default `tsx` loader crashes on Node 24 inside `undici`, which
is why imports in `payload.config.ts`, `src/payload/` and `scripts/cms-*.mts`
carry explicit `.ts` extensions.

## First run (local)

1. `npm run dev`, open `/admin`, create the first admin user.
2. `npm run cms:push` to load every existing article and newsletter.
3. Edit in the admin. Saving rewrites the markdown file, so the page at
   `/blog/<slug>` updates immediately.

## Editing model

- **slug** is the filename and URL. Flagships keep their number prefix
  (`02-your-code-is-clean…`); that prefix is what marks a post as a flagship.
- **status**: drafts are written with `draft: true` and the site hides them.
  New documents start as drafts.
- **content** is markdown (code editor). The title field is the H1, so start
  the body with a paragraph or a `##` heading.
- **source** is set by the sync for mirrored posts (they appear in the
  Archive section of `/blog`). Leave it empty for articles written here.
- **media**: upload images, then reference them as `![alt](/media/<file>)`.
- The flagship cards on `/blog` (numbers, descriptions, deck links) are still
  curated in `src/app/(site)/blog/page.tsx`; new posts without a number
  prefix appear under Archive only if they have a `source`. To promote a CMS
  article to a flagship, give it the next number prefix and add a card.

## Deployment: the CMS stays on the laptop

The CMS only runs locally. Vercel never sees it: it builds the site from the
markdown in git with a plain `next build`, so it needs no database, secret or
CMS settings.

1. `npm run dev`, edit in `/admin` (saves rewrite the markdown files).
2. Commit `posts/`, `newsletters/` and any new images in `public/media/`.
3. Push; Vercel deploys.

## Backups

- The markdown in git is the content backup: `npm run cms:push` rebuilds the
  database from it at any time.
- `npm run cms:backup` snapshots `payload.db` into `backups/` (keeps the
  newest 10; `npm run cms:backup -- --keep 30` to change). Safe while the dev
  server runs. This also keeps the admin login. Restore: stop the dev server,
  copy a snapshot over `payload.db`.
- `payload.db` and `backups/` are git-ignored; copy `backups/` somewhere off
  the laptop if you want them to survive a disk failure.

If the CMS ever needs to run online, it needs a hosted database, a
`PAYLOAD_SECRET`, `npm run cms:pull && npm run build` as the build command,
and image storage such as Vercel Blob.
