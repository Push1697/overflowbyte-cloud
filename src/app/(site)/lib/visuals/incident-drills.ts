import type { Visual } from '../visuals';

export const VISUALS: Visual[] = [
  {
    id: 'incident-triage-timeline',
    kind: 'stages',
    title: 'The four-phase emergency incident triage pipeline',
    caption:
      'Methodical triage under a clock: isolate blast radius, differentiate symptoms from causes, and verify repairs stick.',
    stages: [
      {
        title: 'Phase 1: Symptom validation & alert verification',
        body: 'Validate whether the user report is genuine or a secondary decoy. Check uptime, load average, and top-level HTTP response codes.',
        arrow: 'alert confirmed real',
        tone: 'info',
      },
      {
        title: 'Phase 2: Blast radius & resource saturation audit',
        body: 'Run the triad: disk (df -h / lsof +L1), memory (free -m / dmesg -T | grep -i oom), network (ss -tulpn / conntrack).',
        arrow: 'chokepoint identified',
        tone: 'warn',
      },
      {
        title: 'Phase 3: Root cause isolation & undo-mechanism hunt',
        body: 'Check systemctl list-timers, crontab, and NetworkManager configurations for background jobs that revert changes.',
        arrow: 'recurrent trigger neutralized',
        tone: 'accent',
      },
      {
        title: 'Phase 4: Remediation, truncation, & reboot persistence test',
        body: 'Apply targeted fix, truncate open descriptors, and verify service survives daemon-reload and reboot.',
        arrow: 'service restored within SLA',
        tone: 'ok',
      },
    ],
  },
  {
    id: 'du-vs-df-divergence',
    kind: 'compare',
    title: 'Filesystem accounting divergence: du vs df on deleted files',
    caption:
      'du walks the directory hierarchy; df queries the superblock directly. An unlinked open file creates a massive discrepancy.',
    columns: [
      {
        title: 'du -sh /* (Directory tree walk)',
        subtitle: 'Walks active directory link table',
        lines: [
          '4.2G  /usr',
          '1.8G  /var',
          '320M  /etc',
          'Total accounted: 6.3 GB',
          '# The deleted 20GB log file has no directory link, so du skips it completely!',
        ],
        mark: 'Total accounted: 6.3 GB',
        markTone: 'bad',
        outcome: 'du reports only 6.3 GB utilized across entire disk',
        ok: false,
      },
      {
        title: 'df -h / (Superblock block allocation)',
        subtitle: 'Reads allocated filesystem block counters',
        lines: [
          'Filesystem      Size  Used Avail Use% Mounted on',
          '/dev/nvme0n1p2   30G   27G  3.0G  90% /',
          '# df accounts for all allocated blocks, including unlinked open inodes in /proc/<pid>/fd!',
        ],
        mark: 'Used Avail Use% Mounted on',
        markTone: 'ok',
        outcome: 'df accurately warns partition is 90% full',
        ok: true,
      },
    ],
  },
  {
    id: 'incident-command-matrix',
    kind: 'matrix',
    title: 'Emergency incident response command arsenal',
    caption:
      'High-velocity triage commands for diagnosing saturated resources during Sev 1 production incidents.',
    headers: ['Symptom', 'Triage Command', 'What it Reveals', 'Emergency Remediation'],
    rows: [
      { cells: ['Disk full, rm did nothing', 'sudo lsof +L1', 'Unlinked files held open by running processes', 'truncate -s 0 /proc/<PID>/fd/<FD>'], emphasis: true },
      { cells: ['Repairs keep reverting', 'systemctl list-timers --all', 'Hidden scheduled systemd timer triggers', 'systemctl mask <timer> <service>'], emphasis: true },
      { cells: ['High load, 0% CPU usage', 'ps aux | awk "$8 ~ /D/"', 'Processes stuck in uninterruptible disk/NFS I/O', 'umount -f -l <nfs_mount> or reboot'] },
      { cells: ['DNS fails on reboot', 'cat /etc/NetworkManager/conf.d/*.conf', 'NetworkManager overwriting /etc/resolv.conf', 'set dns=none in NetworkManager config'] },
      { cells: ['TCP packets dropping', 'sysctl net.netfilter.nf_conntrack_count', 'Stateful firewall connection tracking table full', 'sysctl -w net.netfilter.nf_conntrack_max=262144'] },
    ],
  },
];

export const POST_VISUALS: Record<string, Visual[]> = {
  '04-i-broke-two-servers-on-purpose': VISUALS,
};
