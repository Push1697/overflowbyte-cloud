# Offload pipeline — turning articles into site content

Converts an existing article into the three things the site renders beyond
prose: **flashcards**, **hands-on labs**, and **visualizations**.

## Read this before you paste anything

**One article per run.** The instinct is to hand Mistral the whole corpus and
ask for everything. Do not. A model given 27 articles produces 27 shallow
outputs — generic cards, labs with no failure mode, diagrams that restate the
headings. The unit of work is one article, and the pipeline scales by
repetition, not by batch size. Twenty-seven good runs beat one enormous one.

**Mistral cannot read your disk or the web.** Paste the article body into the
run, or attach the file if your client supports it. "Scrape the site" is not a
thing it can do; `scripts/corpus.mjs` (below) is what collects the sources.

**Sanitization is not Mistral's job to be trusted with.** It is a checklist you
run, and the model is a second pair of eyes, never the only pair. See §1.

## The corpus

| Source | Path | Count |
| --- | --- | --- |
| Main site posts | `posts/*.md` | 2 |
| Garden (learning.overflowbyte.cloud) | `../quartz_blog/content/blog/*.md` | 26 |
| M365 device-lock doc | `~/Downloads/M365-Device-Lock-Solution-Blog-markdown/` | 1 + 27 images |

## Where the output goes

| Output | File | Wire it into |
| --- | --- | --- |
| Deck | `src/app/lib/decks/<slug>.ts` | the `DECKS` array in `src/app/lib/questions.ts` |
| Labs | `src/app/lib/labs/<slug>.ts` | the `LABS` array in `src/app/lib/labs.ts` |
| Visuals | `src/app/lib/visuals/<slug>.ts` | `<VisualBlock viz={...} />` on the article or lab page |

Mistral emits standalone exports and never rewrites the aggregate arrays, so a
bad batch can never clobber content that is already live.

**After every run:**

```sh
npx tsc --noEmit        # must exit 0
npm run build           # must stay clean
npm run lint
```

Then **read the answers**. A fluent, confident, wrong kernel explanation is the
one failure this hand-off cannot catch for you — it compiles perfectly.

---

# 1. Sanitization

Run this before the content prompt, on anything derived from real work.

## What I already checked in the M365 document

- **The markdown is clean.** It uses `contoso.com`, `alex@contoso.com`,
  `it-admin@contoso.com` and placeholder GUIDs (`11111111-…`, `00000000-…`).
- The two real-looking GUIDs in it — `0000000a-0000-0000-c000-000000000000`
  and `d4ebce55-015a-49b5-a083-c84d1797ae8c` — are Microsoft's **published
  first-party app IDs** for Intune Enrollment and Intune. Public constants, not
  secrets. Keep them; the runbook is useless without them.
- **The 27 screenshots were deliberately redacted** and are mostly fine.
- **One residual leak.** In `images/signin_log_ca.png` the filter chip reads
  `User contains 59abdcc7…` in clear text while everything around it is
  blurred. Crop or blur that chip before publishing.

## The rule for images

**No language model can redact a PNG.** Every screenshot needs a human or a
vision pass before it ships. Check each one for: the tenant name in the portal
header and breadcrumb, UPNs and display names, device names and serials, object
IDs, IP addresses, licence and seat counts, and the browser's own tab title,
URL bar and bookmarks bar.

## The rule for text

Replace, never merely abbreviate — a truncated identifier is still an
identifier, which is exactly how the leak above survived.

| Replace | With |
| --- | --- |
| Employer / client / tenant name | `Contoso` |
| Domains, UPNs, email | `contoso.com`, `alex@contoso.com`, `it-admin@contoso.com` |
| Real person or display names | `Alex Chen`, `Priya Nair` |
| Object IDs, device IDs, non-public GUIDs | `11111111-1111-1111-1111-111111111111` |
| Device names, serials, IMEIs | `LAPTOP-01`, `PHONE-01` |
| Public IPs, internal hostnames, subnets | `203.0.113.0/24`, `host01.internal` |
| Seat counts, licence counts, headcount | drop, or "a few hundred seats" |
| Ticket / incident / change IDs | drop |
| Physical addresses, office names, floor plans | drop |

**Keep** documented vendor constants: Microsoft first-party app IDs, well-known
SIDs, published port numbers, CVE IDs, RFC numbers, default paths.

## The judgement call that is not a find-and-replace

Even with every name scrubbed, do not publish the **current, specific security
posture of one identifiable organisation**. A runbook saying "here is how to
build this control" is a contribution. One saying "here are the four accounts
we exclude from MFA and the gap we have not closed yet" is a map for an
attacker, and anonymising the names does not change that.

Generalise exclusions to the pattern (`a break-glass account excluded from the
policy`) and never state an unresolved weakness as a current fact about a real
deployment.

```text
SANITIZATION PASS

Below is a technical document derived from real production work. Rewrite it so
nothing identifies the organisation, its people, or its specific deployment,
while keeping every technical instruction intact and correct.

Apply these substitutions consistently throughout:
  organisation            -> Contoso
  domains / UPNs / email  -> contoso.com, alex@contoso.com, it-admin@contoso.com
  person names            -> Alex Chen, Priya Nair
  object/device GUIDs     -> 11111111-1111-1111-1111-111111111111
  device names / serials  -> LAPTOP-01, PHONE-01
  public IPs / hostnames  -> 203.0.113.0/24, host01.internal
  seat and licence counts -> remove, or "a few hundred seats"
  ticket and change IDs   -> remove
  addresses, office names -> remove

KEEP, do not replace: documented vendor constants — Microsoft first-party
application IDs, well-known SIDs, standard port numbers, CVE IDs, RFC numbers,
default install paths. These are public and the document is useless without
them.

Replace identifiers whole. Never truncate one — a partial GUID is still a
GUID.

Then do two more things:

1. List every remaining item you are unsure about, as "REVIEW: <item> — <why>".
   Err toward listing it. A false positive costs me ten seconds.

2. Flag any passage that, even fully anonymised, would reveal the current
   security posture of one identifiable organisation — exclusions from a
   control, an unclosed gap, a compensating control that is not yet in place.
   Rewrite those as the general pattern rather than as a statement of fact
   about a live deployment, and list what you changed.

I will check images separately. Do not claim you have reviewed them.

DOCUMENT:
[paste the article]
```

---

# 2. Flashcards

```text
You are writing practice content for OverflowByte, a deep-dive systems
engineering site. The audience is working Linux, cloud and identity engineers,
and people sitting RHCSA/RHCE or MS-102. They have read the beginner
explanation already and are here for the mechanism underneath it.

TASK
Read the article below. Write [N] flashcards drawn from it as one deck.

Output a single TypeScript file and nothing else. No commentary before or
after, no markdown fence around it, no summary of what you did.

THE EXACT SHAPE
These types already exist in the project. Do not redeclare them, do not add
fields, do not rename anything, do not reorder the union members.

  export type Card = {
    id: string;                                  // kebab-case, unique in the deck
    tag: string;                                 // "Scenario 1", "Scenario 2", ...
    topic: string;                               // 2-4 words, the mechanism at issue
    difficulty: 'core' | 'deep' | 'trap';
    scenario: string;                            // the setup
    question: string;                            // one question, ending in ?
    answer: string[];                            // 2-4 paragraphs
  };

  export type Deck = {
    slug: string;                                // kebab-case, matches the article
    title: string;
    summary: string;                             // one sentence naming what is covered
    series: string;                              // e.g. "Linux Internals", "Cloud & Identity"
    cards: Card[];
  };

Emit exactly this:

  import type { Deck } from '../questions';

  export const DECK: Deck = { /* ... */ };

MARKUP RULES — STRICT
The renderer understands two inline forms only: `backtick code` and **bold**.
Anything else ships to the reader as literal characters.

  - No markdown links, images, headings, bullet lists or tables.
  - No emoji, no decorative arrows.
  - No "\n" inside a string. Each paragraph is its own array element.
  - Use typographic apostrophes (') in prose, never ASCII ' — the strings are
    single-quoted TypeScript and a straight apostrophe breaks the file.
  - Backtick every command, path, flag, syscall, struct, field, errno, portal
    blade and policy name: `fsuid`, `struct cred`, `-EACCES`, `chmod 2775`,
    `Conditional Access`, `Require device to be marked as compliant`.

DIFFICULTY MEANS SOMETHING
  core  — the mechanism everyone should know but most explain imprecisely.
  deep  — requires naming an actual structure, syscall, capability or claim.
  trap  — built around a specific widespread misconception. State the wrong
          answer explicitly, then dismantle it.

At least one card per deck must be a trap. Traps come from the part of the
article where something did not work the obvious way — that section is the
reason the article exists.

HOW TO WRITE A SCENARIO
Concrete and operational: a ticket, an on-call hand-off, a developer's message.
Real values — UID 1000, mode 0640, `root:security`, a named file, a named
policy. Never "suppose a user does something".

The scenario must contain every fact needed to answer it. The reader cannot ask
a follow-up.

HOW TO WRITE AN ANSWER
  - Open each paragraph with the claim in **bold**, then justify it.
  - Name the mechanism. "The kernel checks permissions" is worthless; "the
    check runs `fsuid` against `inode->i_uid` in `generic_permission()`" is the
    content. For identity: name the claim, the grant control, the token.
  - State the order of operations wherever order is what makes it surprising.
  - Say what the fix is, and what does NOT fix it, and why. The second half is
    usually the valuable half.
  - End on something the reader can act on or verify.

ACCURACY — THE ONLY RULE THAT MATTERS
Everything you assert must be true of mainline Linux, or of the vendor product
as currently documented.

If you are not certain a specific detail is right — a struct field, a
capability name, a blade path, which release changed something — leave the
detail out and make the point at the level you are sure of. A vaguer true
answer is fine. A specific false one destroys the point of the site.

Never invent: struct fields, errno values, capability names, syscall argument
order, version numbers, CVE IDs, file paths, portal navigation paths, or
licence requirements.

Draw only on the article. If it does not support [N] good cards, write fewer
and say so in a trailing comment. Padding is the failure mode here.

BAD CARD
  scenario: 'A user cannot access a file.'                  // no facts
  question: 'What are some reasons for permission issues?'  // not one question
  answer:   ['Permissions are controlled by owner, group and other bits.
              You can use chmod to change them.']           // recital

GOOD CARD
{
  id: 'phantom-group',
  tag: 'Scenario 1',
  topic: 'Stale credentials',
  difficulty: 'core',
  scenario:
    'You run `sudo usermod -aG security alice`. Alice already has an SSH session open running a long-lived Python worker. In another tmux pane of that same session she runs `cat /data/audit.log` (root:security, mode 0640) and gets Permission denied.',
  question:
    'Why is she denied even though /etc/group was updated — and would `newgrp security` fix the already-running worker?',
  answer: [
    '**The kernel never re-reads `/etc/group`.** Supplementary groups are resolved once, by PAM at login, and written into the process `struct cred`. Every later check reads that in-memory credential, not the file.',
    '**`newgrp` does not fix the worker.** `newgrp` execs a *new* shell with a freshly built credential set. Credentials are per-process and are copied on `fork()`, so the Python worker keeps its own `struct cred` untouched.',
    'The only reliable fixes are to restart the affected process or start a fresh login session.',
  ],
}

ARTICLE:
[paste the sanitized article]
```

---

# 3. Labs

Same preamble, markup rules and accuracy rules as §2. Swap the task and shape.

```text
TASK
Read the article below. Write [N] hands-on labs drawn from it.

  export type Lab = {
    id: string;                                   // kebab-case
    title: string;                                // imperative
    series: string;
    difficulty: 'intro' | 'core' | 'advanced';
    estMinutes: number;                           // realistic, 5-25
    scenario: string;                             // reads like an on-call hand-off
    tasks: string[];                              // what to achieve, not how
    requirements: string[];                       // constraints that force the shape
    solution: string;                             // shell only, newline-separated
    explanation: string[];                        // why it is shaped that way
    verify: string[];                             // commands proving it worked
  };

Emit:

  import type { Lab } from '../labs';

  export const NEW_LABS: Lab[] = [ /* ... */ ];

RULES SPECIFIC TO LABS
  - `tasks` state the goal. `requirements` state the constraints. Keep them
    separate: the requirements are what make one particular command correct.
  - `solution` is a plain shell transcript — no prompt characters, no inline
    comments. Use a template literal for multi-line solutions.
  - `explanation` must include at least one paragraph on a way to get this
    wrong that still appears to work. That is the reason the lab exists. In the
    permissions lab it is `2>&1 > file`, which silently sends stderr to the
    terminal. Find the equivalent trap in this article.
  - `verify` commands must be read-only and must actually demonstrate the
    result. A trailing `# comment` is fine here.
  - Everything must run on a stock RHEL or Ubuntu box with no extra packages,
    no network access and no specific hostname.

FOR PORTAL-DRIVEN TOPICS (Intune, Entra ID, Conditional Access)
A lab must still be executable and checkable, so prefer the scriptable path:
Microsoft Graph via `az rest` or PowerShell, not a click-path through a portal
that will be redesigned in six months. If a step genuinely has no API, write it
as a requirement rather than a solution line, and make `verify` read the
resulting state back through Graph.

Never write a lab whose verification is "check that it looks right in the
portal".

ARTICLE:
[paste the sanitized article]
```

---

# 4. Visualizations

The site renders diagrams from **data**, not from bespoke components. There are
five shapes and the renderer owns every pixel, which is what keeps a hundred
explainers looking like one system.

```text
TASK
Read the article below. Express its central mechanisms as [N] visualizations.

Output a single TypeScript file and nothing else.

Pick the shape that fits the mechanism. Do not force one. If the article only
supports one good diagram, emit one.

  timeline  — ordered beats in time; the reader steps through them.
              Use when the lesson is "this happened, then this".
  stages    — a top-to-bottom pipeline, with the condition for each hop.
              Use for request paths, lookups, resolution order.
  cascade   — ordered checks against a selectable subject.
              Use for ANY authorization decision: who is asking, what is
              tested, in what order, where it stops. This is the most
              valuable shape on the site and the most under-used.
  compare   — two or three ways of doing the same thing, side by side.
              Use when one token in a transcript is the whole difference.
  matrix    — a reference table, one row optionally emphasised.
              Use only when there is genuinely no sequence or decision.

THE EXACT SHAPE

  export type VisualTone = 'info' | 'accent' | 'ok' | 'warn' | 'crit' | 'neutral';

  type Base = { id: string; title: string; caption?: string };

  type TimelineViz = Base & {
    kind: 'timeline';
    steps: { title: string; body: string }[];
  };

  type StagesViz = Base & {
    kind: 'stages';
    stages: { title: string; body: string; arrow?: string; tone: VisualTone }[];
  };

  type CompareViz = Base & {
    kind: 'compare';
    columns: {
      title: string;
      subtitle?: string;
      lines: string[];        // terminal transcript
      mark?: string;          // substring of a line to highlight
      markTone?: 'ok' | 'bad';
      outcome: string;
      ok: boolean;
    }[];
  };

  type MatrixViz = Base & {
    kind: 'matrix';
    headers: string[];
    rows: { cells: string[]; emphasis?: boolean }[];
  };

  type CascadeViz = Base & {
    kind: 'cascade';
    checks: { id: string; title: string; test?: string }[];
    subjects: {
      id: string;
      label: string;
      detail?: string;
      results: Record<string, { state: 'pass' | 'fail' | 'skip'; note: string }>;
      granted: boolean;
      verdict: string;
    }[];
  };

  export type Visual = TimelineViz | StagesViz | CompareViz | MatrixViz | CascadeViz;

Emit:

  import type { Visual } from '../visuals';

  export const VISUALS: Visual[] = [ /* ... */ ];

HARD CONSTRAINTS
  - In a cascade, EVERY subject must have a `results` entry for EVERY check id.
    A missing one renders as a blank row. Check this yourself before emitting.
  - `state: 'skip'` means the check was never evaluated, and renders dimmed.
    Use it accurately — it is how the reader learns the decision short-circuits.
  - `mark` must be an exact substring of one of that column's `lines`.
  - `caption` says what the reader should take away, not what the diagram is.
    Bad: "Diagram of the login flow." Good: "The compliance check runs after
    MFA, so a non-compliant device still burns a successful MFA prompt."
  - Same markup rules as the cards: `code` and **bold** only.

A cascade is the right shape far more often than it looks. A Conditional Access
evaluation is a cascade. A DAC permission check is a cascade. A firewall rule
chain is a cascade. Reach for it before matrix.

ARTICLE:
[paste the sanitized article]
```

---

# 5. Order of operations

1. Sanitize (§1) if the source came from real work. Resolve every `REVIEW:`.
2. Audit the images by hand. No model substitutes for this.
3. Cards (§2), labs (§3), visuals (§4) — separate runs, same sanitized text.
4. `npx tsc --noEmit && npm run build && npm run lint`.
5. Read every answer and explanation for technical truth.
6. Wire the exports into the aggregate arrays and commit.

## Topic backlog

- Conditional Access evaluation order, grant vs session controls, report-only
- Intune compliance state and how it reaches the token
- Android Enterprise work profile boundaries and copy-paste controls
- systemd units, ordering, and why `Restart=always` hides bugs
- SELinux contexts, `restorecon` vs `chcon`, booleans
- `firewalld` zones versus raw nftables
- LVM growth and recovering a full `/`
- journald retention, rate limiting, lost messages
- Ansible variable precedence; Vault with multiple IDs
- AWS NACL versus security group packet path, ephemeral ports
- container namespaces and cgroup v2 limits
