import type { Deck } from '../questions';

export const DECK: Deck = {
  slug: 'rhcsa-rhce-60-day',
  title: '60-Day RHCSA to RHCE Exam Readiness & Pipeline Protocol',
  summary:
    'Ten high-yield scenarios covering the RHCSA to RHCE transition: idempotency validation, inventory structure, role scaffolding, privilege escalation in automation, Stratis/VDO automation, firewall/SELinux rules as code, and timing strategies.',
  series: 'Ansible & RHCE',
  cards: [
    {
      id: 'transition-mindset-shift',
      tag: 'Scenario 1',
      topic: 'Imperative vs Declarative Automation',
      difficulty: 'core',
      scenario:
        'A candidate transitions from EX200 (RHCSA) where tasks are verified with ad-hoc bash commands (`dnf install`, `systemctl start`) to EX294 (RHCE). In their first playbook, they run shell tasks with `cmd: systemctl restart httpd` instead of the `ansible.builtin.service` module.',
      question:
        'Why does relying on command or shell tasks violate exam grading criteria, and how does idempotency impact your test score?',
      answer: [
        '**Automated grading evaluates idempotency.** Red Hat grading engines run candidate playbooks multiple consecutive times. If subsequent runs report `changed=1` or crash because an imperative command is not idempotent, points are deducted.',
        '**Native modules guarantee target state:** `ansible.builtin.service: name=httpd state=started enabled=true` only modifies system state if the service is stopped or disabled, reporting `changed=0` on clean successive passes.',
        'Whenever an external shell command is unavoidable, you must pair it with `creates:`, `removes:`, or `changed_when:` directives to preserve idempotency.',
      ],
    },
    {
      id: 'ansible-cfg-search-order',
      tag: 'Scenario 2',
      topic: 'ansible.cfg discovery order',
      difficulty: 'core',
      scenario:
        'In an exam or lab environment, configuration files exist at `/etc/ansible/ansible.cfg` and `~/.ansible.cfg`. You create a project directory `~/ansible` and place a custom `ansible.cfg` inside it containing `inventory = ./hosts` and `remote_user = automation`.',
      question:
        'What is Ansible’s configuration discovery order, and what happens if the current project directory has world-writable permissions (`0777`)?',
      answer: [
        '**Search hierarchy:** `ANSIBLE_CONFIG` (env var) -> `./ansible.cfg` (current directory) -> `~/.ansible.cfg` (home directory) -> `/etc/ansible/ansible.cfg`.',
        '**The security trap:** If `./` or `./ansible.cfg` is world-writable (mode 0777 or 0775 with group write), Ansible **ignores** the local configuration to prevent privilege escalation from untrusted users and silently falls back to `~/.ansible.cfg` or `/etc/ansible/ansible.cfg`.',
        'Always verify permissions with `ls -ld .` and test active settings with `ansible-config dump --only-changed`.',
      ],
    },
    {
      id: 'privilege-escalation-in-playbooks',
      tag: 'Scenario 3',
      topic: 'become_method and privilege escalation',
      difficulty: 'core',
      scenario:
        'A playbook runs as non-privileged control user `automation`. A task needs to write to `/etc/hosts`. The play header specifies `become: true`, but the task fails with `sudo: a password is required`.',
      question:
        'Where should `become_user`, `become_method`, and sudo privileges be standardized for EX294?',
      answer: [
        'Target managed nodes must grant passwordless sudo to the automation user via `/etc/sudoers.d/automation`: `automation ALL=(ALL) NOPASSWD: ALL`.',
        'In `ansible.cfg`, standard privilege escalation should be configured under `[privilege_escalation]`: `become = true`, `become_method = sudo`, `become_user = root`, and `become_ask_pass = false`.',
        'Setting `become: true` globally in `ansible.cfg` ensures tasks requiring root run seamlessly without cluttering individual plays with redundant `become` flags.',
      ],
    },
    {
      id: 'adhoc-ping-vs-raw',
      tag: 'Scenario 4',
      topic: 'ansible.builtin.ping vs raw',
      difficulty: 'deep',
      scenario:
        'You provision a fresh minimal install node where Python is not yet installed. Running `ansible node01 -m ping` fails with `ModuleNotFoundError: No module named platform`.',
      question:
        'Why does `ansible.builtin.ping` require Python, and what module allows bootstrapping Python on bare nodes?',
      answer: [
        'Unlike ICMP ping, the `ansible.builtin.ping` module is a Python script pushed over SFTP/SSH to test Python runtime execution, authentication, and remote environment sanity.',
        'To bootstrap Python on an unmanaged or minimal node without Python, use the `ansible.builtin.raw` module: `ansible node01 -m raw -a "dnf install -y python3"`.',
        '`raw` bypasses the module subsystem and pushes commands directly over the raw SSH shell connection.',
      ],
    },
    {
      id: 'jinja-template-syntax-traps',
      tag: 'Scenario 5',
      topic: 'Template filters & facts handling',
      difficulty: 'core',
      scenario:
        'You are generating `/etc/motd` with a Jinja2 template (`templates/motd.j2`). The template contains `{{ ansible_facts[\'default_ipv4\'][\'address\'] }}`. On one node with no default gateway, the playbook crashes with `KeyError: \'default_ipv4\'`.',
      question:
        'How do you write resilient Jinja2 expressions to handle missing facts or undefined dictionary keys?',
      answer: [
        'Use the `default` filter or safe navigation: `{{ ansible_facts[\'default_ipv4\'][\'address\'] | default(\'127.0.0.1\', true) }}`.',
        'Alternatively, guard the task with a `when:` condition: `when: ansible_facts[\'default_ipv4\'] is defined`.',
        'In exam environments where networks may lack DHCP or external routes, hardcoding nested dictionary lookups without `default` filters frequently breaks playbooks.',
      ],
    },
    {
      id: 'rhel-system-roles-timesync',
      tag: 'Scenario 6',
      topic: 'RHEL System Roles (timesync/chrony)',
      difficulty: 'core',
      scenario:
        'EX294 requires synchronizing all managed nodes to an NTP pool `0.rhel.pool.ntp.org` using the standard `rhel-system-roles.timesync` role.',
      question:
        'What package provides Red Hat System Roles, where do they extract, and what variables configure timesync?',
      answer: [
        'Install the package via `sudo dnf install -y rhel-system-roles`.',
        'Roles are installed into `/usr/share/ansible/roles/`. Configure `roles_path = ~/.ansible/roles:/usr/share/ansible/roles` in your project `ansible.cfg`.',
        'Pass configuration via role variables: `timesync_ntp_servers: [{ hostname: "0.rhel.pool.ntp.org", iburst: true }]`.',
      ],
    },
    {
      id: 'selinux-fcontext-restorecon-sequence',
      tag: 'Scenario 7',
      topic: 'SELinux automated policy injection',
      difficulty: 'trap',
      scenario:
        'You write an Ansible task using `ansible.posix.sefcontext` to set `/web(/.*)?` to `httpd_sys_content_t`. The playbook succeeds with `changed=1`, but Apache still gives 403 Forbidden.',
      question:
        'Why does `sefcontext` alone fail to update file security contexts, and what second step is mandatory?',
      answer: [
        '`sefcontext` only modifies the persistent SELinux policy file database (`/etc/selinux/targeted/contexts/files/file_contexts.local`). It does NOT touch existing files on the filesystem.',
        'You must run a subsequent task with `ansible.builtin.command: restorecon -Rv /web` or use the `ansible.posix.selinux` / file module with `selevel/serole/setype` to apply the policy to disk.',
        'Remember: `sefcontext` updates the database; `restorecon` writes the inode extended attributes.',
      ],
    },
    {
      id: 'firewalld-rich-rule-automation',
      tag: 'Scenario 8',
      topic: 'ansible.posix.firewalld statefulness',
      difficulty: 'core',
      scenario:
        'You configure a firewalld rule using `ansible.posix.firewalld: service=http permanent=true state=enabled`. After the play finishes, `curl http://node01` fails until the server is rebooted.',
      question:
        'Why did the firewalld rule fail to take effect immediately, and which parameter was omitted?',
      answer: [
        'Setting `permanent: true` writes the rule to `/etc/firewalld/zones/` on disk, but does NOT load it into the active netfilter/nftables runtime table.',
        'You must pass `immediate: true` in the module options: `ansible.posix.firewalld: service=http permanent=true immediate=true state=enabled`.',
        'Omitting `immediate: true` means changes are invisible until the next firewalld reload or system reboot.',
      ],
    },
    {
      id: 'ansible-galaxy-offline-requirements',
      tag: 'Scenario 9',
      topic: 'ansible-galaxy install from local archives',
      difficulty: 'deep',
      scenario:
        'During an offline exam or air-gapped datacenter deployment, `ansible-galaxy install -r requirements.yml` fails because the control node cannot reach galaxy.ansible.com.',
      question:
        'How do you structure `requirements.yml` to install collections and roles from local tarball archives?',
      answer: [
        'Specify local filesystem tarball paths: `roles: - name: custom_role src: /opt/ansible/roles/custom_role.tar.gz` and `collections: - name: /opt/ansible/collections/redhat-rhel_system_roles-1.19.3.tar.gz`.',
        'Install with `ansible-galaxy install -r requirements.yml -p ./roles`.',
        'Always ensure local relative paths match the working directory of the execution context.',
      ],
    },
    {
      id: 'dry-run-check-mode-traps',
      tag: 'Scenario 10',
      topic: 'Check mode (--check) vs conditional task registration',
      difficulty: 'trap',
      scenario:
        'You run `ansible-playbook --check site.yml` to dry-run your solution. The playbook crashes on Task 4 because Task 3 (which creates a database user) was skipped, leaving `user_result` unregistered.',
      question:
        'How should tasks be designed so that registered variables remain valid during `--check` runs?',
      answer: [
        'Use `check_mode: false` on critical query/fact tasks that read current state without making system modifications.',
        'In downstream tasks, test `user_result is defined and user_result.changed` rather than blindly accessing unregistered return structures.',
        'Check mode simulates changes but does not create filesystem objects, so downstream tasks that depend on file creation will fail if not guarded.',
      ],
    },
  ],
};
