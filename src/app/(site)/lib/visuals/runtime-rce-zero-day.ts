import type { Visual } from '../visuals';

export const VISUALS: Visual[] = [
  {
    id: 'runtime-exploit-stages',
    kind: 'stages',
    title: 'PHP2Shell & Node2Shell exploit path through C runtime layers',
    caption:
      'The attack bypasses application validation entirely, triggering memory corruption in the native parser before reaching user code.',
    stages: [
      {
        title: 'Stage 1: Malformed chunked HTTP request arrives',
        body: 'Attacker sends crafted transfer-encoding chunks with negative or overflowing size headers over TCP port 443.',
        arrow: 'packet enters runtime socket listener',
        tone: 'warn',
      },
      {
        title: 'Stage 2: Native C parser integer overflow',
        body: 'The C-level protocol parser calculates buffer allocation using unsigned 32-bit math, causing heap buffer overflow.',
        arrow: 'heap memory boundary corrupted',
        tone: 'crit',
      },
      {
        title: 'Stage 3: Function pointer hijacking / ROP chain',
        body: 'Attacker overwrites execution control flow, redirecting instruction pointer RIP towards system() or execve().',
        arrow: 'syscall invoked from memory',
        tone: 'crit',
      },
      {
        title: 'Stage 4: Kernel security boundary evaluation',
        body: 'Linux kernel evaluates seccomp filters, capabilities, and filesystem write bits. If unconfined, shell spawns.',
        arrow: 'defensive controls decide outcome',
        tone: 'accent',
      },
    ],
  },
  {
    id: 'runtime-containment-compare',
    kind: 'compare',
    title: 'Standard unhardened container vs hardened immutable runtime',
    caption:
      'Defense in depth stops the exploit at the OS/kernel boundary even when the native runtime engine is fully compromised.',
    columns: [
      {
        title: 'Standard container (Default Docker/K8s)',
        subtitle: 'Root UID, writable rootfs, default capabilities',
        lines: [
          'USER root (UID 0)',
          'Writable root filesystem',
          'Attacker drops /tmp/dropper.elf',
          'Attacker runs execve("/bin/sh")',
          'Attacker dials outbound reverse shell: 198.51.100.25:4444',
        ],
        mark: 'Attacker runs execve("/bin/sh")',
        markTone: 'bad',
        outcome: 'Full unauthenticated root shell compromise',
        ok: false,
      },
      {
        title: 'Hardened runtime sandbox',
        subtitle: '--read-only, noexec tmpfs, cap-drop=ALL, seccomp',
        lines: [
          'USER 1001:1001 (Unprivileged UID)',
          'Read-only rootfs: open(/etc/backdoor, O_WRONLY) -> EROFS',
          'Tmpfs mounted noexec: execve(/tmp/dropper) -> EPERM',
          'Seccomp filter: execve() halted with SIGSYS',
          'Egress firewall drops outbound connect() to foreign IP',
        ],
        mark: 'Seccomp filter: execve() halted with SIGSYS',
        markTone: 'ok',
        outcome: 'Exploit fails; process crashes and triggers safe reboot',
        ok: true,
      },
    ],
  },
  {
    id: 'kernel-containment-matrix',
    kind: 'matrix',
    title: 'Linux kernel runtime isolation mechanisms',
    caption:
      'Layered defenses providing boundary enforcement when application code and runtimes fail.',
    headers: ['Defensive Layer', 'Kernel Subsystem', 'What it Enforces', 'Exploit Neutralized'],
    rows: [
      { cells: ['Read-only rootfs', 'VFS mount flags', 'Blocks writes to binaries, libraries, and web assets', 'Web shells & disk-based malware persistence'], emphasis: true },
      { cells: ['Seccomp-BPF', 'BPF syscall engine', 'Whitelists allowed system calls; kills unknown calls', 'execve, ptrace, and arbitrary process execution'], emphasis: true },
      { cells: ['Capability dropping', 'POSIX capabilities', 'Strips administrative primitives (CAP_SYS_ADMIN, etc.)', 'Container escape & raw socket hijacking'] },
      { cells: ['SELinux / AppArmor', 'LSM (Security Modules)', 'Type-enforcement access control independent of UID', 'Credential scraping in /etc/shadow or /proc'] },
      { cells: ['Egress filtering', 'Netfilter / Conntrack', 'Allows only explicit internal destination CIDRs/ports', 'Reverse shell callbacks to external C2 nodes'], emphasis: true },
    ],
  },
];

export const POST_VISUALS: Record<string, Visual[]> = {
  '02-your-code-is-clean-attackers-still-got-a-shell': VISUALS,
};
