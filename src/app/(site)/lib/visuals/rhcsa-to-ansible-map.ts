import type { Visual } from '../visuals';

export const VISUALS: Visual[] = [
  {
    id: 'ansible-translation-stages',
    kind: 'stages',
    title: 'The daily command-to-automation bridging cycle',
    caption:
      'Rather than learning Ansible as a separate subject, build the bridge daily on the exact same topic.',
    stages: [
      {
        title: 'Morning: Master the manual Linux command',
        body: 'Execute useradd, firewall-cmd, semanage, or lvextend manually. Understand arguments and config side effects on disk.',
        arrow: 'manual competence proven',
        tone: 'info',
      },
      {
        title: 'Afternoon: Search module via ansible-doc',
        body: 'Run ansible-doc -l | grep <keyword> and ansible-doc -s <module> to retrieve ready-to-paste YAML skeletons offline.',
        arrow: 'module and collection identified',
        tone: 'accent',
      },
      {
        title: 'Evening: Author declarative task and test idempotence',
        body: 'Write the playbook task. Execute twice: the first run must be changed, the second run MUST report changed=0 (green ok).',
        arrow: 'idempotence verified',
        tone: 'ok',
      },
      {
        title: 'Night: Sabotage target and rebuild via playbook',
        body: 'Deliberately alter configurations or delete resources by hand. Re-run playbook to confirm automated restoration.',
        arrow: 'self-healing verified',
        tone: 'accent',
      },
    ],
  },
  {
    id: 'ansible-module-traps-compare',
    kind: 'compare',
    title: 'The three module parameter choices that cost exam marks',
    caption:
      'Subtle parameter distinctions that appear correct on the first run but fail strict requirement grading.',
    columns: [
      {
        title: 'Zero-mark parameter choices',
        subtitle: 'Subtle mistakes that fail automated grading',
        lines: [
          'dnf: name=pkg state=latest (Upgrades existing packages when task asked to install)',
          'mount: path=/data state=present (Writes /etc/fstab but fails to mount now)',
          'firewalld: service=http permanent=true (Permanent only; fails on running system)',
          'seboolean: name=httpd_can_network_connect state=on (Missing persistent: true; resets on boot)',
        ],
        mark: 'state=latest',
        markTone: 'bad',
        outcome: 'Disqualified on reboot or strict requirement check',
        ok: false,
      },
      {
        title: 'Exam-accurate parameter choices',
        subtitle: 'Idempotent and persistent across reboots',
        lines: [
          'dnf: name=pkg state=present (Ensures package presence without unrequested upgrades)',
          'mount: path=/data state=mounted (Writes /etc/fstab AND mounts active filesystem now)',
          'firewalld: service=http permanent=true immediate=true (Configures BOTH states)',
          'seboolean: name=httpd_can_network_connect state=on persistent=true (Survives reboot)',
        ],
        mark: 'state=mounted',
        markTone: 'ok',
        outcome: 'Full marks awarded; survives grader reboots and health sweeps',
        ok: true,
      },
    ],
  },
  {
    id: 'ansible-collections-matrix',
    kind: 'matrix',
    title: 'The collections map: where crucial modules actually live',
    caption:
      'Many essential modules for storage, networking, and security do not ship in ansible.builtin.',
    headers: ['Administrative Domain', 'Target Capabilities', 'Ansible Module', 'Required Collection'],
    rows: [
      { cells: ['Firewall Management', 'Ports, services, zones, rich rules', 'firewalld', 'ansible.posix'], emphasis: true },
      { cells: ['SELinux Mode & Booleans', 'Enforcing mode, runtime booleans', 'selinux, seboolean', 'ansible.posix'], emphasis: true },
      { cells: ['SELinux Contexts & Ports', 'Persistent fcontext regex, port labels', 'sefcontext, seport', 'community.general'], emphasis: true },
      { cells: ['Persistent Storage & Fstab', 'UUID mounts, fstab persistence', 'mount', 'ansible.posix'], emphasis: true },
      { cells: ['LVM Storage Pools', 'Volume groups, logical volumes', 'lvg, lvol', 'community.general'], emphasis: true },
      { cells: ['Partitions & Filesystems', 'Disk partitioning, mkfs formats', 'parted, filesystem', 'community.general'] },
      { cells: ['POSIX ACLs', 'Granular user/group access and defaults', 'acl', 'ansible.posix'] },
      { cells: ['Core User & Package Admin', 'Accounts, groups, dnf, systemd', 'user, group, dnf, systemd_service', 'ansible.builtin'] },
    ],
  },
];

export const POST_VISUALS: Record<string, Visual[]> = {
  '07-every-rhcsa-task-translated-to-ansible': VISUALS,
};
