import type { Visual } from '../visuals';

export const VISUALS: Visual[] = [
  {
    id: 'no-ssh-loop-stages',
    kind: 'stages',
    title: 'The No-SSH verification and automation loop',
    caption:
      'The strict workflow enforced throughout Week 6: configure N fresh nodes from zero without ever establishing a manual repair session.',
    stages: [
      {
        title: 'Step 1: Revert all managed nodes to baseline',
        body: 'Execute virsh snapshot-revert rhel01 clean and virsh snapshot-revert rhel02 clean. Ensure nodes are completely pristine.',
        arrow: 'clean state restored',
        tone: 'info',
      },
      {
        title: 'Step 2: Run declarative playbook from control node',
        body: 'Execute ansible-playbook -i inventory site.yml. Provision users, sudo rules, storage, and security policies.',
        arrow: 'first pass executes',
        tone: 'accent',
      },
      {
        title: 'Step 3: Enforce strict idempotence check',
        body: 'Rerun ansible-playbook site.yml immediately. If changed > 0 on any host, the playbook is non-idempotent and fails.',
        arrow: 'idempotence confirmed',
        tone: 'ok',
      },
      {
        title: 'Step 4: Sabotage host and verify automated assertion',
        body: 'Disturb configuration (e.g. break firewall). Run verification tag. If verification reports success on a broken machine, score is 0.',
        arrow: 'verification integrity proven',
        tone: 'warn',
      },
    ],
  },
  {
    id: 'no-ssh-troubleshooting-compare',
    kind: 'compare',
    title: 'Interactive SSH hotfixes vs versioned declarative remediation',
    caption:
      'Logging in to fix things by hand creates snowflake servers. The No-SSH rule forces discipline and true infrastructure-as-code.',
    columns: [
      {
        title: 'Interactive SSH hotfix habit',
        subtitle: 'SSH in -> tweak config -> restart -> forget',
        lines: [
          'SSH into rhel01 to fix a missing firewall port',
          'Run firewall-cmd --add-port=8080/tcp (Forgot --permanent)',
          'Edit /etc/sudoers with nano without syntax checking',
          'Server reboot wipes hotfix; next deploy fails',
          'Impossible to replicate cleanly on 10 other nodes',
        ],
        mark: 'Forgot --permanent',
        markTone: 'bad',
        outcome: 'Configuration drift, unrepeatable states, exam failure',
        ok: false,
      },
      {
        title: 'The No-SSH playbook discipline',
        subtitle: 'Fix playbook -> validate template -> rerun from control',
        lines: [
          'Identify failure from ansible-playbook error output',
          'Correct firewalld task with permanent=true immediate=true',
          'Deploy sudoers with validate: visudo -cf %s',
          'Re-execute playbook against reverted clean node',
          'Playbook is tested, idempotent, and scales to 1,000 nodes',
        ],
        mark: 'validate: visudo -cf %s',
        markTone: 'ok',
        outcome: 'Bulletproof automation, zero configuration drift, 100% exam score',
        ok: true,
      },
    ],
  },
  {
    id: 'no-ssh-labs-matrix',
    kind: 'matrix',
    title: 'Week 6 automation milestones and validation checks',
    caption:
      'Every manual RHCSA foundation task reconstructed as production-grade Ansible automation.',
    headers: ['Lab', 'Domain', 'Acceptance Requirement', 'Grading Verification Method'],
    rows: [
      { cells: ['Lab 6.1', 'Users & Sudoers', 'Developers group, accounts, sudoers validated via visudo', 'Deliberately corrupt template; assert deployment fails'], emphasis: true },
      { cells: ['Lab 6.2', 'Services & Handlers', 'Custom repo, unit templating, daemon_reload on change', 'Disturb unit; verify handler fires on change, silent on run 2'] },
      { cells: ['Lab 6.3', 'LVM Storage from Scratch', 'Partitions, XFS, swap, LVs, fstab mounts by UUID', 'Extend variable to 9GB; verify safe online filesystem expansion'], emphasis: true },
      { cells: ['Lab 6.4', 'Security & SELinux', 'SELinux contexts, booleans, firewalld rich rules', 'Survives node reboot triggered by the playbook itself'] },
      { cells: ['Lab 6.5', '10 Hosts, Zero Logins', 'End-to-end multi-tier pipeline on fresh nodes', 'Sabotage host; verify assert task catches and fails loudly'], emphasis: true },
    ],
  },
];

export const POST_VISUALS: Record<string, Visual[]> = {
  '08-the-no-ssh-rule-automating-exam-set': VISUALS,
};
