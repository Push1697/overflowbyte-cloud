import type { Lab } from '../labs';

export const NEW_LABS: Lab[] = [
  {
    id: 'no-ssh-verification-pipeline',
    title: 'Zero-SSH Automated Test & Assert Validation Harness',
    series: 'Ansible & RHCE',
    difficulty: 'core',
    estMinutes: 20,
    scenario:
      'You are building a test-driven automation harness for EX294. You need to write a verification playbook `verify_cluster.yml` that checks SSH key reachability across all nodes, confirms root logins are disabled in `/etc/ssh/sshd_config`, validates that firewalld is active, and runs `ansible.builtin.assert` to fail immediately if any cluster node violates security policy — without ever opening an interactive SSH terminal.',
    tasks: [
      'Write `verify_cluster.yml` using `setup`, `slurp`, and `assert` modules.',
      'Check that `PermitRootLogin no` is enforced.',
      'Check that active kernel distribution is RHEL 9 or RHEL 10.',
      'Print a structured JSON report with test outcomes.',
    ],
    requirements: [
      'Follow the No-SSH rule strictly — all tests must run via `ansible-playbook`.',
      'Use `ansible.builtin.assert` with descriptive `fail_msg` strings.',
      'The playbook must execute cleanly with `--check` mode.',
    ],
    solution: `cat << 'EOF' > ~/ansible/verify_cluster.yml
---
- name: Zero-SSH Automated Cluster Verification Harness
  hosts: all
  gather_facts: true
  tasks:
    - name: Assert Operating System is Enterprise Linux
      ansible.builtin.assert:
        that:
          - ansible_facts['os_family'] == 'RedHat'
          - ansible_facts['distribution_major_version'] in ['9', '10']
        fail_msg: "Host {{ inventory_hostname }} is not running supported RHEL version!"
        success_msg: "Host {{ inventory_hostname }} validated on {{ ansible_facts['distribution'] }} {{ ansible_facts['distribution_version'] }}"

    - name: Read remote sshd configuration file
      ansible.builtin.slurp:
        src: /etc/ssh/sshd_config
      register: sshd_raw

    - name: Assert PermitRootLogin is strictly disabled
      ansible.builtin.assert:
        that:
          - "'PermitRootLogin no' in (sshd_raw['content'] | b64decode)"
        fail_msg: "Security violation: PermitRootLogin is not set to 'no' on {{ inventory_hostname }}!"
        success_msg: "Security compliance verified: PermitRootLogin disabled."

    - name: Query firewalld service status
      ansible.builtin.systemd:
        name: firewalld
      register: firewalld_status

    - name: Assert firewalld is active
      ansible.builtin.assert:
        that:
          - firewalld_status.status.ActiveState == 'active'
        fail_msg: "Firewalld is inactive on {{ inventory_hostname }}!"
        success_msg: "Firewalld is active on {{ inventory_hostname }}."

    - name: Summary Test Status
      ansible.builtin.debug:
        msg: "ALL ZERO-SSH POLICY ASSERTIONS PASSED FOR {{ inventory_hostname }}"
EOF

ansible-playbook -i ~/ansible/inventory ~/ansible/verify_cluster.yml`,
    explanation: [
      '**The power of `slurp` and `assert`:** The `slurp` module safely retrieves remote configuration file contents base64-encoded over the Ansible connection. `assert` evaluates expressions and crashes with clear diagnostics if conditions fail.',
      'By baking assertions directly into your automation pipelines, you achieve 100% test coverage and compliance verification across dozens of servers in seconds, completely replacing slow, error-prone manual SSH logins.',
    ],
    verify: [
      'ansible-playbook -i ~/ansible/inventory ~/ansible/verify_cluster.yml',
      'ansible-playbook -i ~/ansible/inventory ~/ansible/verify_cluster.yml --check',
    ],
  },
];
