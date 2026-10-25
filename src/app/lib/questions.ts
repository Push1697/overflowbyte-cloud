export type Card = {
  id: string;
  /** Short label shown on the deck, e.g. "Scenario 1". */
  tag: string;
  topic: string;
  difficulty: 'core' | 'deep' | 'trap';
  /** Setup shown on the front of the card. */
  scenario: string;
  question: string;
  /** Answer paragraphs, rendered on the back. Inline `code` is supported. */
  answer: string[];
};

export type Deck = {
  slug: string;
  title: string;
  summary: string;
  series: string;
  cards: Card[];
};

export const DECKS: Deck[] = [
  {
    slug: 'linux-permissions',
    title: 'Linux permissions & kernel credentials',
    summary:
      'Five production scenarios covering stale credentials, fsuid, SGID inheritance, the 16-bit i_mode bitmask, and root override order.',
    series: 'Linux Internals',
    cards: [
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
          '**The kernel never re-reads `/etc/group`.** Supplementary groups are resolved once, by PAM at login, and written into the process `struct cred`. Every later check reads that in-memory credential, not the file. Alice’s shell is still carrying the group set it was given when the session started, so `security` simply is not in it.',
          '**`newgrp` does not fix the worker.** `newgrp` execs a *new* shell with a freshly built credential set. Credentials are per-process and are copied on `fork()`, so the Python worker in the other pane keeps its own `struct cred` untouched. Nothing retroactively rewrites the credentials of a running process.',
          'The only reliable fixes are to restart the affected process or start a fresh login session.',
        ],
      },
      {
        id: 'fsuid',
        tag: 'Scenario 2',
        topic: 'fsuid vs euid',
        difficulty: 'deep',
        scenario:
          'A fileserver daemon handles a request on behalf of a remote client. Its process has `uid=0`, `euid=0`, but `fsuid=1005` and `fsgid=1005`. It tries to read /exports/contracts.pdf, mode 0600, owned by alice (UID 1000).',
        question: 'Does the daemon get to read the file?',
        answer: [
          '**No — it gets EACCES.** Filesystem access checks use `fsuid`/`fsgid`, not `euid`. That is the entire reason `fsuid` exists: it lets a privileged daemon drop into a client’s identity for file access only, without giving up the rest of its privilege.',
          'The check runs `fsuid` 1005 against owner 1000 (no match), then `fsgid` against the file group (no match), then the other bits, which are `000`. Every branch fails.',
          '**The `euid=0` does not rescue it either.** When `fsuid` is changed away from 0, the kernel drops the filesystem-related capabilities — `CAP_DAC_OVERRIDE`, `CAP_DAC_READ_SEARCH`, `CAP_FOWNER` — from the effective set. Without `CAP_DAC_OVERRIDE` there is no override path left.',
        ],
      },
      {
        id: 'sgid-dir',
        tag: 'Scenario 3',
        topic: 'SGID inheritance',
        difficulty: 'core',
        scenario:
          'A shared repo is set up with `chown -R deploy:devops /var/repo/project.git` and `chmod -R 2775`. Developer bob (primary group `bob`, supplementary `devops`) pushes a commit, creating new files and directories under objects/.',
        question:
          'What group owns the new file — and what happens to the SGID bit on new subdirectories?',
        answer: [
          '**The new file is owned by `devops`, not `bob`.** The `2` in `2775` is the SGID bit. On a *directory* it changes the inheritance rule: new entries take their group from the parent directory rather than from the creating process’s primary group. That is exactly what makes shared collaboration directories work.',
          '**New subdirectories inherit the SGID bit itself.** So the behaviour propagates all the way down the tree without needing another `chmod`, and the whole repository stays group-writable by `devops`.',
          'Worth noting: this governs the *group*, not the permission bits. Those still come from the process umask, which is why collaborative setups usually pair SGID with a `002` umask.',
        ],
      },
      {
        id: 'imode',
        tag: 'Scenario 4',
        topic: '16-bit i_mode',
        difficulty: 'deep',
        scenario:
          'An auditor runs `stat -c "%a %A" /opt/bin/backup` and gets `4750` and `-rwsr-x---`.',
        question:
          'What do the digits 4, 7, 5, 0 mean — whose UID does a group member execute it as — and what changes in the output after `chmod u-x`?',
        answer: [
          '**The digits.** `4` is the setuid bit (`S_ISUID`); the special triad is setuid 4, setgid 2, sticky 1. Then `7` = owner `rwx`, `5` = group `r-x`, `0` = other `---`. In the 16-bit `i_mode` the top 4 bits hold the file type, the next 3 are those special bits, and the low 9 are the permission bits.',
          '**Execution identity.** A group member running it gets an effective UID of the file *owner* — root here — because of setuid. The real UID stays the caller’s, which is what lets the program know who actually invoked it.',
          '**After `chmod u-x`** the owner-execute slot shows a capital **`S`**. Lowercase `s` means "setuid *and* executable"; uppercase `S` means the setuid bit is set on a file that is not executable, which is almost always a misconfiguration.',
        ],
      },
      {
        id: 'root-order',
        tag: 'Scenario 5',
        topic: 'Root override order',
        difficulty: 'trap',
        scenario:
          'Root runs `cat /etc/shadow`, where the file is mode `0000` (`----------`) and owned by root:root. The read succeeds.',
        question:
          'Does root bypass the permission check up front, or are the mode bits evaluated first?',
        answer: [
          '**The mode bits are evaluated first.** There is no "if root, return 0" short-circuit at the top. `inode_permission()` runs the normal discretionary check, and against mode `0000` the owner, group and other branches all fail.',
          '**The override happens on the failure path.** Only after the DAC check has failed does the kernel consult capabilities — `capable_wrt_inode_uidgid()` testing `CAP_DAC_OVERRIDE` (or `CAP_DAC_READ_SEARCH` for reads). Root normally holds those, so access is granted there.',
          'The distinction matters in practice: strip `CAP_DAC_OVERRIDE` from a root process — via capability bounding sets, a container profile, or a non-zero `fsuid` — and that same `cat` starts failing, because the only thing that was ever letting it through was the capability, not the UID.',
        ],
      },
    ],
  },
];

export function getDeck(slug: string): Deck | null {
  return DECKS.find((deck) => deck.slug === slug) ?? null;
}
