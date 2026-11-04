import { NEW_LABS as M365_DEVICE_LOCK_LABS } from './labs/m365-device-lock';
import { NEW_LABS as RHEL10_STORAGE_SELINUX_LABS } from './labs/rhel10-storage-selinux';
import { NEW_LABS as AWS_NACL_SG_LABS } from './labs/aws-nacl-security-groups';

export type Lab = {
  id: string;
  title: string;
  series: string;
  difficulty: 'intro' | 'core' | 'advanced';
  estMinutes: number;
  /** Narrative setup, written the way an on-call hand-off would read. */
  scenario: string;
  tasks: string[];
  requirements: string[];
  /** Shell solution. Revealed only when the reader asks for it. */
  solution: string;
  /** Why the solution is shaped the way it is. Inline `code` supported. */
  explanation: string[];
  /** How the reader proves it worked. */
  verify: string[];
};

export const LABS: Lab[] = [
  {
    id: 'background-nohup',
    title: 'Starting and managing background processes',
    series: 'Linux Operations',
    difficulty: 'intro',
    estMinutes: 5,
    scenario:
      'The server is stable again. Just as you are about to take a break, a developer messages you: they need a long-running script, data_processor.sh, started on the server. You cannot keep your terminal session open for hours just to babysit it, so it has to survive you logging out.',
    tasks: [
      'Start data_processor.sh so it runs in the background and is immune to hangups.',
    ],
    requirements: [
      'You must be in the ~/project directory.',
      'Use nohup to run the script.',
      'Use the & operator to send the process to the background.',
      'Redirect both standard output and standard error to processor.log.',
    ],
    solution: `cd ~/project
nohup ./data_processor.sh > processor.log 2>&1 &`,
    explanation: [
      '`nohup` makes the process ignore `SIGHUP`, the signal the kernel sends to a session’s children when the controlling terminal goes away. Without it, logging out kills the script.',
      '`&` detaches the job so the shell returns a prompt immediately instead of blocking.',
      '**The redirect order matters.** `> processor.log 2>&1` first points stdout at the file, then points stderr at *wherever stdout now goes*. Writing `2>&1 > processor.log` instead sends stderr to the original terminal and only stdout to the file — a classic way to lose exactly the error output you wanted.',
      'If you omit the redirect entirely, `nohup` quietly appends to `nohup.out` in the current directory, which is rarely what you want on a shared box.',
    ],
    verify: [
      'jobs            # shows the job while the shell lives',
      'ps -ef | grep data_processor',
      'tail -f processor.log',
    ],
  },
  {
    id: 'sgid-shared-dir',
    title: 'Build a shared directory that keeps its group',
    series: 'Linux Internals',
    difficulty: 'core',
    estMinutes: 8,
    scenario:
      'Two engineers keep creating files in a shared deploy directory that land under their own primary groups, so the other one cannot write to them. You need new files and new subdirectories to inherit the devops group automatically, without anyone remembering to run chgrp.',
    tasks: [
      'Create /srv/devops owned by deploy:devops.',
      'Make it group-writable and ensure new entries inherit the devops group.',
      'Confirm the inheritance also applies to subdirectories created later.',
    ],
    requirements: [
      'The directory must be owned by user deploy and group devops.',
      'New files inside must get group devops, not the creator’s primary group.',
      'Use a single numeric chmod that sets the special bit.',
    ],
    solution: `sudo mkdir -p /srv/devops
sudo chown deploy:devops /srv/devops
sudo chmod 2775 /srv/devops`,
    explanation: [
      'The leading `2` is the **SGID bit**. On a directory it changes the inheritance rule for anything created inside: new entries take their group from the parent directory instead of from the creating process’s primary group.',
      'New *subdirectories* also inherit the SGID bit itself, so the behaviour propagates down the tree with no further `chmod`.',
      'SGID only governs the **group**, not the permission bits — those still come from each user’s umask. Pair this with a `002` umask, or a group-writable default ACL, or you will still get `rw-r--r--` files that the other engineer cannot edit.',
    ],
    verify: [
      'ls -ld /srv/devops     # expect drwxrwsr-x, note the s',
      'sudo -u other touch /srv/devops/t && ls -l /srv/devops/t',
    ],
  },
  {
    id: 'suid-audit',
    title: 'Audit every setuid-root binary on the system',
    series: 'Security & Hardening',
    difficulty: 'advanced',
    estMinutes: 10,
    scenario:
      'Security review week. You need a written inventory of every setuid-root executable on the box, because each one is a potential privilege-escalation path if it has a bug. Noise from unreadable directories must not pollute the report.',
    tasks: [
      'Find every regular file under /usr owned by root with the setuid bit set.',
      'Write the list to suid-audit.txt in your home directory.',
      'Suppress permission-denied noise from the search itself.',
    ],
    requirements: [
      'Match the setuid bit specifically, not any arbitrary permission.',
      'Restrict results to regular files owned by root.',
      'Send find’s own stderr to /dev/null, not the results.',
    ],
    solution: `find /usr -type f -user root -perm -4000 -print 2>/dev/null \\
  > ~/suid-audit.txt`,
    explanation: [
      '`-perm -4000` uses the **leading dash**, which means "at least these bits are set". Plain `-perm 4000` would match only files whose mode is *exactly* `4000`, which is essentially nothing, and `/4000` means "any of these bits".',
      '`-type f` excludes directories, where the `4000` bit means something entirely different, and `-user root` narrows it to the binaries that actually escalate to root.',
      '`2>/dev/null` discards only **find’s** error stream, so unreadable directories stay quiet while the result list on stdout still reaches the file. Redirecting stdout instead would throw away the report.',
      'Review the output against a known-good baseline. Anything unexpected — especially an interpreter, an editor or something under a user-writable path — is worth investigating immediately.',
    ],
    verify: [
      'wc -l ~/suid-audit.txt',
      'ls -l $(head -1 ~/suid-audit.txt)   # expect -rwsr-xr-x',
    ],
  },
  ...M365_DEVICE_LOCK_LABS,
  ...RHEL10_STORAGE_SELINUX_LABS,
  ...AWS_NACL_SG_LABS,
];

export function getLab(id: string): Lab | null {
  return LABS.find((lab) => lab.id === id) ?? null;
}
