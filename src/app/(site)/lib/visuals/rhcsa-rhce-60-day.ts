import type { Visual } from '../visuals';

export const VISUALS: Visual[] = [
  {
    id: 'rhcsa-rhce-roadmap-timeline',
    kind: 'timeline',
    title: 'The 8-week requirement-driven certification path',
    caption:
      'Eight weeks split cleanly into two months: core RHEL administration (RHCSA) followed by declarative Ansible automation (RHCE).',
    steps: [
      {
        title: 'Week 1: Core Linux Administration',
        body: 'Files, permissions, UIDs/GIDs, SUID/SGID, sticky bit, POSIX ACLs, sudoers with visudo validation, and SSH key management.',
      },
      {
        title: 'Week 2: Storage & Services',
        body: 'systemd service units, timer units, dnf repositories, LVM stack (PV, VG, LV), online XFS resizing, swap, and persistent NFS mounts.',
      },
      {
        title: 'Week 3: Security & Boot Recovery',
        body: 'SELinux enforcing mode, persistent booleans and fcontext rules, firewalld runtime vs permanent, and rescuing the 4 boot failures.',
      },
      {
        title: 'Week 4: Containers & RHCSA Mock Exams',
        body: 'Rootless Podman containers, quadlets, tuned system tuning profiles, and two timed 2.5-hour mock exam papers with offline graders.',
      },
      {
        title: 'Week 5: Ansible Fundamentals',
        body: 'Ansible configuration, inventories, ad-hoc administration, loops, conditionals, handlers, and verifying changed=0 idempotence.',
      },
      {
        title: 'Week 6: The No-SSH Automation Rule',
        body: 'Re-automating every Month 1 task through Ansible against reverted nodes. Zero manual SSH repairs permitted.',
      },
      {
        title: 'Week 7: Enterprise Roles & Secrets',
        body: 'Monolithic playbook decomposition into roles, Jinja2 templating with facts, Ansible Vault with multi-vault IDs, and no_log security.',
      },
      {
        title: 'Week 8: Multi-Host Scenarios & EX294 Mock',
        body: 'Rolling batch updates with serial and max_fail_percentage, the Ansible saboteur, and a complete timed EX294 mock exam.',
      },
    ],
  },
  {
    id: 'rhcsa-rhce-method-compare',
    kind: 'compare',
    title: 'Passive video courses vs requirement-driven lab method',
    caption:
      'Video comprehension feels productive but collapses when sitting alone in an exam terminal. The lab method tests actual outcome delivery.',
    columns: [
      {
        title: 'Traditional tutorial method',
        subtitle: 'Watch video -> copy-paste commands -> move on',
        lines: [
          'Watch 45 hours of video walkthroughs',
          'Copy-paste lvextend and firewall-cmd from slides',
          'Test only on running system; skip reboot test',
          'Symptom-driven: assume one known fault',
          'Exam day: blank screen when man/docs are needed',
        ],
        mark: 'Skip reboot test',
        markTone: 'bad',
        outcome: 'Fails exam on un-persisted configurations (score: 0)',
        ok: false,
      },
      {
        title: 'Requirement-driven lab method',
        subtitle: 'Read requirement -> build -> break -> rebuild automatically',
        lines: [
          'Read acceptance criteria (outcome only, no commands)',
          'Consult only exam-legal docs: man and ansible-doc',
          'Automated checker evaluates criteria after reboot',
          'Saboteur injects random failures to train triage',
          'Automate outcome via Ansible playbook for RHCE',
        ],
        mark: 'Automated checker evaluates criteria after reboot',
        markTone: 'ok',
        outcome: 'Passes both RHCSA (EX200) and RHCE (EX294) with confidence',
        ok: true,
      },
    ],
  },
  {
    id: 'rhcsa-rhce-curriculum-matrix',
    kind: 'matrix',
    title: 'The 60-day milestone and grading breakdown',
    caption:
      'Structured progression ensuring you never gamble both certifications on a single marathon test.',
    headers: ['Phase', 'Focus Area', 'Primary Tooling & Labs', 'Milestone Gate'],
    rows: [
      { cells: ['Month 1 (Weeks 1-2)', 'Core Linux & Storage', 'Files, permissions, LVM, systemd, mounts', 'Clean 14-lab acceptance test'], emphasis: true },
      { cells: ['Month 1 (Weeks 3-4)', 'Hardening & Boot Recovery', 'SELinux, firewalld, emergency target, Podman', 'Pass RHCSA (EX200) Certification'], emphasis: true },
      { cells: ['Month 2 (Weeks 5-6)', 'Ansible Fundamentals & No-SSH', 'Inventories, playbooks, idempotence, automated labs', '10 fresh nodes built with zero SSH logins'] },
      { cells: ['Month 2 (Weeks 7-8)', 'Enterprise Automation & Vault', 'Roles, Jinja2 templates, multi-vault IDs, rolling batches', 'Pass RHCE (EX294) Certification'], emphasis: true },
    ],
  },
];

export const POST_VISUALS: Record<string, Visual[]> = {
  '06-60-day-plan-rhcsa-to-rhce': VISUALS,
};
