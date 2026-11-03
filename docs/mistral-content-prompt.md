# Offload prompt — learning content for OverflowByte

Paste everything inside the fence into Mistral. Replace the two bracketed
placeholders first.

Why this task and not the UI: the output is pure data behind a fixed TypeScript
interface, so it either compiles or it does not, and a wrong answer is caught by
reading it rather than by hunting a rendering bug. Design and component work
needs the whole token system in context, which does not survive a copy-paste
hand-off.

**After it replies**, save the file, then run:

```sh
npx tsc --noEmit        # must exit 0
npm run build           # must stay clean
npm run lint
```

Never merge a deck without reading the answers. A plausible, confidently wrong
kernel explanation is the one failure mode this hand-off cannot catch for you.

---

```text
You are writing practice content for OverflowByte, a deep-dive systems
engineering site. The audience is working Linux/cloud engineers and people
sitting RHCSA/RHCE. They have seen the beginner explanation already and are
here for the mechanism underneath it.

TASK
Write [N] flashcards as one new deck on the topic: [TOPIC].

Output a single TypeScript file and nothing else. No commentary before or
after, no markdown fence around it, no explanation of what you did.

THE EXACT SHAPE
The file must satisfy these types, which already exist in the project. Do not
redeclare them, do not add fields, do not rename anything, do not reorder the
union members.

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
    slug: string;                                // kebab-case
    title: string;
    summary: string;                             // one sentence naming what is covered
    series: string;                              // e.g. "Linux Internals"
    cards: Card[];
  };

Emit exactly this, with your deck as the only element:

  import type { Deck } from './questions';

  export const DECK: Deck = { /* ... */ };

MARKUP RULES — THESE ARE STRICT
The renderer understands only two inline forms: `backtick code` and **bold**.
Anything else ships as literal characters to the reader.

  - No markdown links, images, headings, bullet lists or tables.
  - No emoji. No decorative arrows.
  - No "\n" inside a string to fake a paragraph break. Each paragraph is its
    own element of the answer array.
  - Use typographic apostrophes (') in prose, never ASCII ' — the strings are
    single-quoted TypeScript, and a straight apostrophe breaks the file.
  - Put every command, path, flag, syscall, struct, field and errno in
    backticks: `fsuid`, `struct cred`, `-EACCES`, `chmod 2775`, `/etc/group`.

DIFFICULTY MEANS SOMETHING
  core  — the mechanism everyone should know but most explain imprecisely.
  deep  — requires naming an actual kernel structure, syscall or capability.
  trap  — the card is built around a specific widespread misconception. State
          the wrong answer explicitly, then dismantle it. At least one card in
          every deck must be a trap.

HOW TO WRITE A SCENARIO
Concrete, operational, and the way it would actually reach you — a ticket, an
on-call hand-off, a developer's message. Give real values: UID 1000, mode 0640,
`root:security`, a named file. Never "suppose a user does something".

The scenario must contain every fact needed to answer. The reader cannot ask a
follow-up.

HOW TO WRITE AN ANSWER
  - Open each paragraph with the claim in **bold**, then justify it.
  - Name the mechanism. "The kernel checks permissions" is worthless; "the
    check runs `fsuid` against `inode->i_uid` in `generic_permission()`" is the
    content.
  - State the order of operations where order is what makes it surprising.
  - Say what the fix is, and say what does NOT fix it and why. The second half
    is usually the valuable half.
  - End the last paragraph on something the reader can act on or verify.

ACCURACY — THE ONLY RULE THAT MATTERS
Everything you assert about kernel behaviour must be true of mainline Linux.

If you are not certain a specific detail is correct — a struct field name, a
capability name, a flag value, which release changed something — leave that
detail out and make the point at the level you are sure of. A vaguer true
answer is fine. A specific false one destroys the point of the site.

Do not invent: struct field names, errno values, capability names, syscall
argument orders, version numbers, CVE IDs, or file paths.

WHAT A BAD CARD LOOKS LIKE
  scenario: 'A user cannot access a file.'            // no facts
  question: 'What are some reasons for permission issues?'  // not one question
  answer:   ['Permissions in Linux are controlled by the owner, group and
             other bits. You can use chmod to change them.']
            // textbook recital, no mechanism, nothing surprising

WHAT A GOOD CARD LOOKS LIKE
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

Begin. Output only the TypeScript file.
```

---

## Variant: hands-on labs

Same preamble, but swap the TASK and shape sections for this. Everything under
MARKUP RULES, ACCURACY and the scenario guidance still applies.

```text
TASK
Write [N] hands-on labs on the topic: [TOPIC].

  export type Lab = {
    id: string;                                   // kebab-case
    title: string;                                // imperative, lowercase after word 1
    series: string;
    difficulty: 'intro' | 'core' | 'advanced';
    estMinutes: number;                           // realistic, 5-25
    scenario: string;                             // reads like an on-call hand-off
    tasks: string[];                              // what to achieve, not how
    requirements: string[];                       // the constraints that force the shape
    solution: string;                             // shell only, newline-separated
    explanation: string[];                        // why it is shaped that way
    verify: string[];                             // commands proving it worked
  };

Emit:

  import type { Lab } from './labs';

  export const NEW_LABS: Lab[] = [ /* ... */ ];

RULES SPECIFIC TO LABS
  - `tasks` state the goal. `requirements` state the constraints. Keep them
    separate: the requirements are what make one particular command correct.
  - `solution` is a plain shell transcript with no prompt characters and no
    comments. Use a template literal for multi-line solutions.
  - `explanation` must include at least one paragraph on a way to get this
    wrong that still appears to work. That is the reason the lab exists.
  - `verify` commands must be read-only and must actually demonstrate the
    result. An inline `# comment` after a command is fine here.
  - Everything must run on a stock RHEL or Ubuntu box with no extra packages.
    Never require network access or a specific hostname.
```

## Topic backlog

Decks and labs still wanted, roughly in priority order:

- systemd units, dependency ordering, and why `Restart=always` hides bugs
- SELinux contexts, `restorecon` vs `chcon`, and booleans
- `firewalld` zones versus raw nftables
- LVM, filesystem growth, and recovering a full `/`
- journald retention, rate limiting, and lost messages
- Ansible variable precedence and the 22-level ladder
- Ansible Vault with multiple vault IDs
- AWS NACL versus security group packet path, ephemeral ports
- container namespaces and cgroup v2 limits
- `io_uring` versus epoll for network I/O
