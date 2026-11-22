import type { Visual } from '../visuals';
import { assertCascadeComplete } from '../visuals';

export const VISUALS: Visual[] = [
  {
    id: 'ansible-precedence-ladder',
    kind: 'stages',
    title: 'The Ansible variable precedence ladder (lowest to highest)',
    caption:
      'Ansible evaluates variables across 22 distinct levels. Role defaults lose to everything; command-line extra vars (-e) beat everything unconditionally.',
    stages: [
      {
        title: 'Role defaults (defaults/main.yml)',
        body: 'Rank 1: Lowest precedence. Designed as fallbacks easily overridden by inventory or playbooks.',
        arrow: 'overridden by inventory',
        tone: 'neutral',
      },
      {
        title: 'Inventory group_vars (group_vars/all.yml)',
        body: 'Rank 6: Global estate baselines. More specific child groups override parent groups.',
        arrow: 'overridden by host variables',
        tone: 'info',
      },
      {
        title: 'Inventory host_vars (host_vars/<host>.yml)',
        body: 'Rank 7: Per-host customizations (e.g. unique IP, custom SSH port).',
        arrow: 'overridden by playbook scope',
        tone: 'info',
      },
      {
        title: 'Playbook vars (play header vars:)',
        body: 'Rank 12: Playbook-level variables, including vars_files and vars_prompt.',
        arrow: 'overridden by role definitions',
        tone: 'accent',
      },
      {
        title: 'Role vars (roles/<role>/vars/main.yml)',
        body: 'Rank 16: High-precedence role constants. Intentionally overrides inventory host_vars!',
        arrow: 'overridden by runtime facts',
        tone: 'warn',
      },
      {
        title: 'Set_fact and registered variables',
        body: 'Rank 19: Dynamically discovered host state cached in memory across subsequent plays.',
        arrow: 'overridden by CLI arguments',
        tone: 'accent',
      },
      {
        title: 'Extra vars (-e / --extra-vars)',
        body: 'Rank 22: Absolute highest precedence. Overrides all files, roles, inventories, and facts.',
        arrow: 'final applied value',
        tone: 'ok',
      },
    ],
  },
  {
    id: 'precedence-resolution-cascade',
    kind: 'cascade',
    title: 'Precedence resolution for http_port across conflicting sources',
    caption:
      'Evaluation cascade showing how Ansible resolves the final variable value when multiple tiers define the same variable name.',
    checks: [
      { id: 'c1', title: 'Check Extra Vars (-e)', test: 'Passed on CLI via -e http_port=...?' },
      { id: 'c2', title: 'Check Role Vars', test: 'Defined in roles/<name>/vars/main.yml?' },
      { id: 'c3', title: 'Check Host Vars', test: 'Defined in host_vars/<hostname>.yml?' },
      { id: 'c4', title: 'Check Group Vars', test: 'Defined in group_vars/<group>.yml?' },
      { id: 'c5', title: 'Check Role Defaults', test: 'Defined in roles/<name>/defaults/main.yml?' },
    ],
    subjects: [
      {
        id: 'cli-override',
        label: 'CLI execution with -e http_port=9999',
        detail: 'Operator runs ansible-playbook site.yml -e http_port=9999',
        results: {
          c1: { state: 'pass', note: 'matches -e (rank 22) — evaluation immediately locks' },
          c2: { state: 'skip', note: 'not evaluated' },
          c3: { state: 'skip', note: 'not evaluated' },
          c4: { state: 'skip', note: 'not evaluated' },
          c5: { state: 'skip', note: 'not evaluated' },
        },
        granted: true,
        verdict: 'Value is 9999 (Extra Vars win)',
      },
      {
        id: 'host-specific-config',
        label: 'Host rhel01 defined in host_vars/rhel01.yml',
        detail: 'host_vars sets 8443, group_vars sets 8000, defaults set 8080',
        results: {
          c1: { state: 'fail', note: 'no -e argument supplied' },
          c2: { state: 'fail', note: 'no variable in role vars/main.yml' },
          c3: { state: 'pass', note: 'matches host_vars/rhel01.yml (rank 7) — beats group and defaults' },
          c4: { state: 'skip', note: 'overridden by host_vars' },
          c5: { state: 'skip', note: 'overridden by host_vars' },
        },
        granted: true,
        verdict: 'Value is 8443 (host_vars win over group and defaults)',
      },
      {
        id: 'fallback-to-defaults',
        label: 'Generic host rhel02 with no host or group vars',
        detail: 'Only role defaults/main.yml contains http_port: 8080',
        results: {
          c1: { state: 'fail', note: 'no -e argument' },
          c2: { state: 'fail', note: 'no role vars' },
          c3: { state: 'fail', note: 'no host_vars entry' },
          c4: { state: 'fail', note: 'no group_vars entry' },
          c5: { state: 'pass', note: 'falls back to baseline in defaults/main.yml (rank 1)' },
        },
        granted: true,
        verdict: 'Value is 8080 (Role Defaults applied)',
      },
    ],
  },
  {
    id: 'rhcsa-to-ansible-module-matrix',
    kind: 'matrix',
    title: 'RHCSA manual tasks translated to Ansible modules and collections',
    caption:
      'The definitive translation matrix for EX200 to EX294 automation. Watch for modules outside ansible.builtin.',
    headers: ['RHCSA Task', 'Manual Command', 'Ansible Module', 'Collection', 'Idempotence Check'],
    rows: [
      { cells: ['User management', 'useradd -m -s /bin/bash', 'ansible.builtin.user', 'builtin', 'native state check'], emphasis: true },
      { cells: ['Package installation', 'dnf install -y nginx', 'ansible.builtin.dnf', 'builtin', 'checks RPM database'] },
      { cells: ['Systemd daemons', 'systemctl enable --now httpd', 'ansible.builtin.systemd', 'builtin', 'checks unit symlinks & state'] },
      { cells: ['Firewall rules', 'firewall-cmd --add-service=http --perm', 'ansible.posix.firewalld', 'ansible.posix', 'needs permanent & immediate'], emphasis: true },
      { cells: ['Storage LVM', 'lvextend -L +5G /dev/vg/lv', 'community.general.lvol', 'community.general', 'requires resizefs: true'] },
      { cells: ['POSIX ACLs', 'setfacl -m u:auditor:rx /srv', 'ansible.posix.acl', 'ansible.posix', 'inspects existing xattr'] },
      { cells: ['SELinux contexts', 'semanage fcontext -a ...', 'ansible.posix.sefcontext', 'ansible.posix', 'requires target reload'], emphasis: true },
      { cells: ['Filesystem mounts', 'mount -a (/etc/fstab)', 'ansible.posix.mount', 'ansible.posix', 'state: mounted persists in fstab'] },
    ],
  },
];

for (const viz of VISUALS) {
  if (viz.kind === 'cascade') {
    const problems = assertCascadeComplete(viz);
    if (problems.length > 0) throw new Error(problems.join('; '));
  }
}

export const POST_VISUALS: Record<string, Visual[]> = {
  '07-every-rhcsa-task-translated-to-ansible': VISUALS,
  '09-ansible-variable-precedence-drawn': VISUALS,
};
