/**
 * Data and pure logic behind the Linux permissions visual lab.
 *
 * This used to live inside a standalone 958-line HTML file that the article
 * embedded in an iframe. Keeping the content here means the server renders it,
 * search engines can read it, and it inherits the site's design system.
 */

/* ------------------------------------------------- 1. stale groups -------- */

export type TimelineStep = {
  title: string;
  body: string;
};

/** Why `usermod -aG` does not reach an already-open shell. */
export const STALE_GROUP_TIMELINE: TimelineStep[] = [
  {
    title: 'Interactive shell spawned (PID 1042)',
    body: 'PAM reads `/etc/passwd` and `/etc/group` at login. The kernel builds a `struct cred` and caches it in RAM.',
  },
  {
    title: 'Sysadmin runs `usermod -aG developers alice`',
    body: 'The text file `/etc/group` on disk is updated. Running processes are completely decoupled from disk text files.',
  },
  {
    title: 'Alice runs `cd /opt/projects/dev` → permission denied',
    body: "The kernel evaluates PID 1042's existing in-memory `struct cred`. The group list still holds only her old groups.",
  },
  {
    title: 'The fix: `newgrp developers`',
    body: 'Runs a setuid-root binary that verifies `/etc/group`, calls `setgroups()` and `setgid()`, then spawns a refreshed subshell.',
  },
];

/* ------------------------------------------------- 2. struct cred ---------- */

export type CredField = {
  field: string;
  name: string;
  role: string;
  /** The one that actually decides file access. */
  emphasis?: boolean;
};

export const CRED_FIELDS: CredField[] = [
  {
    field: 'uid / gid',
    name: 'Real ID',
    role: 'Identifies the user who spawned the process. Determines signal delivery permissions — who may `kill` it.',
  },
  {
    field: 'euid / egid',
    name: 'Effective ID',
    role: 'Used for general authorization, creating IPC primitives, and evaluating privileged capabilities.',
  },
  {
    field: 'suid / sgid',
    name: 'Saved set-ID',
    role: 'Preserves the prior effective ID across a setuid binary, so a process can drop and re-elevate privilege safely.',
  },
  {
    field: 'fsuid / fsgid',
    name: 'Filesystem ID',
    role: 'The ID actually used for file access. When the kernel checks inode permissions in the VFS it compares against `fsuid`, not `euid`.',
    emphasis: true,
  },
];

/* ------------------------------------------------- 3. newgrp player ------- */

/** One row of the credential table: label, UID, GID. */
export type CredRow = {
  label: string;
  uid: string;
  gid: string;
  /** Highlight colour for the changed cell, if any. */
  uidState?: 'raised' | 'changed';
  gidState?: 'raised' | 'changed';
};

export type NewgrpStep = {
  title: string;
  body: string;
  rows: CredRow[];
  groups: string;
  groupsChanged?: boolean;
};

const ALICE = '1000 (alice)';
const ROOT = '0 (root)';
const DEV = '1002 (dev)';

export const NEWGRP_STEPS: NewgrpStep[] = [
  {
    title: 'fork()',
    body: 'Bash forks a child process. The child inherits identical copies of every credential pointer from the parent shell.',
    rows: [
      { label: 'Real', uid: ALICE, gid: ALICE },
      { label: 'Effective', uid: ALICE, gid: ALICE },
      { label: 'Saved', uid: ALICE, gid: ALICE },
      { label: 'Filesystem', uid: ALICE, gid: ALICE },
    ],
    groups: '1000 (alice)',
  },
  {
    title: "execve('/usr/bin/newgrp')",
    body: 'Executes the setuid-root binary. The kernel loads `newgrp` and raises the effective UID to 0.',
    rows: [
      { label: 'Real', uid: ALICE, gid: ALICE },
      { label: 'Effective', uid: ROOT, gid: ALICE, uidState: 'raised' },
      { label: 'Saved', uid: ROOT, gid: ALICE, uidState: 'raised' },
      { label: 'Filesystem', uid: ROOT, gid: ALICE, uidState: 'raised' },
    ],
    groups: '1000 (alice)',
  },
  {
    title: 'setgroups(developers)',
    body: '`newgrp` verifies group membership against `/etc/group`, then calls `setgroups()` to rewrite the supplementary group list.',
    rows: [
      { label: 'Real', uid: ALICE, gid: ALICE },
      { label: 'Effective', uid: ROOT, gid: ALICE },
      { label: 'Saved', uid: ROOT, gid: ALICE },
      { label: 'Filesystem', uid: ROOT, gid: ALICE },
    ],
    groups: '1000 (alice), 1002 (developers)',
    groupsChanged: true,
  },
  {
    title: 'setgid(1002)',
    body: 'With root privilege, `setgid()` sets all four GID fields — real, effective, saved and filesystem — to `developers`, not just the effective one.',
    rows: [
      { label: 'Real', uid: ALICE, gid: DEV, gidState: 'changed' },
      { label: 'Effective', uid: ROOT, gid: DEV, gidState: 'changed' },
      { label: 'Saved', uid: ROOT, gid: DEV, gidState: 'changed' },
      { label: 'Filesystem', uid: ROOT, gid: DEV, gidState: 'changed' },
    ],
    groups: '1000 (alice), 1002 (developers)',
  },
  {
    title: 'setuid(1000)',
    body: 'Drops root permanently. Effective and saved UID return to `alice`, so the shell cannot re-elevate.',
    rows: [
      { label: 'Real', uid: ALICE, gid: DEV },
      { label: 'Effective', uid: ALICE, gid: DEV },
      { label: 'Saved', uid: ALICE, gid: DEV },
      { label: 'Filesystem', uid: ALICE, gid: DEV },
    ],
    groups: '1000 (alice), 1002 (developers)',
  },
  {
    title: "execve('/bin/bash')",
    body: 'Spawns a fresh interactive shell with the new primary GID and the updated supplementary groups already active.',
    rows: [
      { label: 'Real', uid: ALICE, gid: DEV },
      { label: 'Effective', uid: ALICE, gid: DEV },
      { label: 'Saved', uid: ALICE, gid: DEV },
      { label: 'Filesystem', uid: ALICE, gid: DEV },
    ],
    groups: '1000 (alice), 1002 (developers)',
  },
];

/* ------------------------------------------------- 4. path resolution ---- */

export type LookupStage = {
  title: string;
  body: string;
  /** Edge label shown before this stage. */
  arrow?: string;
  tone: 'info' | 'accent' | 'ok';
};

export const LOOKUP_STAGES: LookupStage[] = [
  {
    title: 'Dentry cache (RAM)',
    body: 'The kernel checks its hash table of directory entries, resolving the filename string to an inode number in a sub-microsecond RAM lookup.',
    tone: 'info',
  },
  {
    title: 'Inode table (disk → VFS inode in RAM)',
    body: 'Reads the block group descriptor and inode bitmap from disk, loading a `struct inode` of 128 or 256 bytes holding `i_mode`, `i_uid`, `i_gid`, size and the extent tree.',
    arrow: 'cache miss',
    tone: 'accent',
  },
  {
    title: 'Page cache & data blocks',
    body: 'Reads the extent pointers out of the inode and streams 4 KB physical blocks into the system page cache.',
    arrow: 'access granted',
    tone: 'ok',
  },
];

/* ------------------------------------------------- 5. i_mode bit grid ---- */

/** Bit 15 down to bit 0, matching the kernel's `i_mode` layout. */
export const MODE_BIT_NAMES = [
  'FMT3',
  'FMT2',
  'FMT1',
  'FMT0',
  'SUID',
  'SGID',
  'STIK',
  'UR',
  'UW',
  'UX',
  'GR',
  'GW',
  'GX',
  'OR',
  'OW',
  'OX',
] as const;

export const MODE_PRESETS: { label: string; mode: number }[] = [
  { label: '0755 exec file', mode: 0o100755 },
  { label: '0644 read/write', mode: 0o100644 },
  { label: '2770 SGID collab dir', mode: 0o042770 },
  { label: '4755 setuid root exec', mode: 0o104755 },
  { label: '1777 sticky /tmp', mode: 0o041777 },
];

export const DEFAULT_MODE = 0o100755;

const S_IFMT = 0o170000;

/* The full S_IFMT table from include/uapi/linux/stat.h. The original widget
   only knew three of these, so toggling the four FMT bits — the whole point of
   the grid — could land on "Unknown". */
const FILE_TYPES: { mask: number; label: string; char: string }[] = [
  { mask: 0o140000, label: 'Socket', char: 's' },
  { mask: 0o120000, label: 'Symlink', char: 'l' },
  { mask: 0o100000, label: 'Regular file', char: '-' },
  { mask: 0o060000, label: 'Block device', char: 'b' },
  { mask: 0o040000, label: 'Directory', char: 'd' },
  { mask: 0o020000, label: 'Character device', char: 'c' },
  { mask: 0o010000, label: 'FIFO', char: 'p' },
];

export type DecodedMode = {
  octal: string;
  ls: string;
  type: string;
  specials: string;
};

/**
 * Decodes an `i_mode` value the way `ls -l` and `stat` do.
 *
 * The execute column carries two meanings at once: a set-id or sticky bit
 * replaces `x` with `s`/`t`, and uppercases it when the execute bit underneath
 * is clear — which is how `ls` shows a set-id bit that cannot actually fire.
 */
export function decodeMode(mode: number): DecodedMode {
  const fmt = mode & S_IFMT;
  const match = FILE_TYPES.find((t) => t.mask === fmt);

  const triad = (read: number, write: number, exec: number, extra: number, extraChar: string) => {
    const x = mode & extra ? (mode & exec ? extraChar : extraChar.toUpperCase()) : mode & exec ? 'x' : '-';
    return `${mode & read ? 'r' : '-'}${mode & write ? 'w' : '-'}${x}`;
  };

  const specials = [
    mode & 0o4000 && 'SetUID',
    mode & 0o2000 && 'SetGID',
    mode & 0o1000 && 'Sticky',
  ].filter(Boolean);

  return {
    octal: (mode & 0o7777).toString(8).padStart(4, '0'),
    ls:
      (match?.char ?? '?') +
      triad(0o400, 0o200, 0o100, 0o4000, 's') +
      triad(0o040, 0o020, 0o010, 0o2000, 's') +
      triad(0o004, 0o002, 0o001, 0o1000, 't'),
    type: match?.label ?? 'Unknown',
    specials: specials.length ? specials.join(', ') : 'None',
  };
}

/* ------------------------------------------------- 6. DAC flowchart ------ */

export type DacStage = 'owner' | 'group' | 'other' | 'root';
export type DacState = 'pass' | 'fail' | 'skip';

export type DacActor = {
  id: string;
  label: string;
  detail: string;
  steps: Record<DacStage, { state: DacState; note: string }>;
  granted: boolean;
  verdict: string;
};

export const DAC_STAGES: { id: DacStage; title: string; test: string }[] = [
  { id: 'owner', title: 'Check owner', test: 'current->fsuid == inode->i_uid' },
  { id: 'group', title: 'Check group', test: 'current->fsgid == inode->i_gid, or in supplementary groups' },
  { id: 'other', title: 'Check others', test: 'fall through to the last three mode bits' },
  { id: 'root', title: 'Root override', test: 'capable_wrt_inode_uidgid(CAP_DAC_OVERRIDE)' },
];

/** All four actors attempt a write to alice:developers 0640 (-rw-r-----). */
export const DAC_ACTORS: DacActor[] = [
  {
    id: 'alice',
    label: 'Alice',
    detail: 'owner, UID 1000',
    steps: {
      owner: { state: 'pass', note: "Match: fsuid 1000 == i_uid 1000, and the owner bits carry 'w' (rw-)." },
      group: { state: 'skip', note: 'Skipped — the owner already matched.' },
      other: { state: 'skip', note: 'Skipped.' },
      root: { state: 'skip', note: 'Skipped.' },
    },
    granted: true,
    verdict: 'Access granted — owner write permitted',
  },
  {
    id: 'bob',
    label: 'Bob',
    detail: 'in developers',
    steps: {
      owner: { state: 'fail', note: 'No match: fsuid 1001 != 1000. Proceeding to the group check.' },
      group: { state: 'fail', note: "Match: fsgid is in developers — but the group bits are 'r--', with no write." },
      other: { state: 'skip', note: 'Skipped: once the group matches, the kernel cannot fall through to other.' },
      root: { state: 'fail', note: 'Not root, so no CAP_DAC_OVERRIDE.' },
    },
    granted: false,
    verdict: 'Access denied — EACCES: the group has no write permission',
  },
  {
    id: 'carol',
    label: 'Carol',
    detail: 'other, UID 1002',
    steps: {
      owner: { state: 'fail', note: 'No match: fsuid 1002 != 1000.' },
      group: { state: 'fail', note: 'No match: not in developers. Falling through to others.' },
      other: { state: 'fail', note: "The other bits are '---'. Access refused." },
      root: { state: 'fail', note: 'Not root.' },
    },
    granted: false,
    verdict: 'Access denied — EACCES: the other bits are 0',
  },
  {
    id: 'root',
    label: 'Root',
    detail: 'UID 0, CAP_DAC_OVERRIDE',
    steps: {
      owner: { state: 'fail', note: 'No natural owner match.' },
      group: { state: 'fail', note: 'No natural group match.' },
      other: { state: 'fail', note: 'The mode bits refuse access. Proceeding to the capability check.' },
      root: { state: 'pass', note: 'CAP_DAC_OVERRIDE present — the bypass is enforced here, and only here.' },
    },
    granted: true,
    verdict: 'Access granted via CAP_DAC_OVERRIDE',
  },
];

/* ------------------------------------------------- 7. SGID comparison ---- */

export const SGID_COMPARISON = [
  {
    title: 'Standard directory (0775)',
    subtitle: 'owned by `alice:developers`',
    lines: ['$ touch /data/plain/report.txt', '$ ls -l /data/plain/report.txt', '-rw-r--r-- 1 bob bob 0 Oct 25 10:00 report.txt'],
    mark: 'bob',
    markTone: 'bad' as const,
    outcome:
      "The file's group defaults to Bob's primary group, so team members in `developers` cannot write to it.",
    ok: false,
  },
  {
    title: 'SGID directory (2775, `drwxrwsr-x`)',
    subtitle: 'owned by `alice:developers`, SGID set',
    lines: ['$ touch /data/collab/report.txt', '$ ls -l /data/collab/report.txt', '-rw-r--r-- 1 bob developers 0 Oct 25 10:00 report.txt'],
    mark: 'developers',
    markTone: 'ok' as const,
    outcome:
      "The kernel inherits the parent directory's GID. New subdirectories inherit the SGID bit as well.",
    ok: true,
  },
];

/* ------------------------------------------------- 8. verification ------- */

export const VERIFY_SCRIPT = `# 1. Inspect all four UIDs and GIDs of your current shell process
grep -E 'Uid|Gid|Groups' /proc/$$/status

# 2. Inspect inode metadata, permissions and the raw octal mode
stat -c "File: %n | Inode: %i | Octal: %a | Access: %A | Owner: %U(%u):%G(%g)" /etc/passwd

# 3. Simulate newgrp and observe the subshell's GIDs
newgrp developers
grep -E 'Gid|Groups' /proc/$$/status
exit`;
