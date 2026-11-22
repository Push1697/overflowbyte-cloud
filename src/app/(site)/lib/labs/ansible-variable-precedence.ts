import type { Lab } from '../labs';

export const NEW_LABS: Lab[] = [
  {
    id: 'ansible-precedence-hierarchy',
    title: 'Validate Ansible variable precedence across role defaults and host_vars',
    series: 'Ansible & RHCE',
    difficulty: 'core',
    estMinutes: 20,
    scenario:
      'EX294 scenario: You are deploying an internal HTTP service across two nodes using role `web_service`. The role defines a default listen port of 8080 in `defaults/main.yml`. However, node `rhel01` requires port 8443 via `host_vars/rhel01.yml`, while `rhel02` must inherit group-level port 8000 from `group_vars/webservers.yml`. An operator tests an emergency override with `-e http_port=9999`.',
    tasks: [
      'Create the inventory with `rhel01` and `rhel02` under group `webservers`.',
      'Configure `defaults/main.yml`, `group_vars/webservers.yml`, and `host_vars/rhel01.yml`.',
      'Run an ad-hoc or debug task proving `rhel01` takes 8443, `rhel02` takes 8000, and `-e` overrides both.',
    ],
    requirements: [
      'Use proper YAML structure under the project directory `~/ansible`.',
      'Do not place variables in `roles/web_service/vars/main.yml`.',
      'Ensure the playbook passes with 0 syntax warnings.',
    ],
    solution: `mkdir -p ~/ansible/{group_vars,host_vars,roles/web_service/defaults}
cat << 'EOF' > ~/ansible/inventory
[webservers]
rhel01 ansible_host=192.168.124.11
rhel02 ansible_host=192.168.124.12
EOF

echo "http_port: 8080" > ~/ansible/roles/web_service/defaults/main.yml
echo "http_port: 8000" > ~/ansible/group_vars/webservers.yml
echo "http_port: 8443" > ~/ansible/host_vars/rhel01.yml

cat << 'EOF' > ~/ansible/test_precedence.yml
- name: Verify Variable Precedence
  hosts: webservers
  gather_facts: false
  roles:
    - web_service
  tasks:
    - name: Print resolved http_port
      ansible.builtin.debug:
        msg: "Host {{ inventory_hostname }} resolved http_port to {{ http_port }}"
EOF

ansible-playbook -i ~/ansible/inventory ~/ansible/test_precedence.yml
ansible-playbook -i ~/ansible/inventory ~/ansible/test_precedence.yml -e http_port=9999`,
    explanation: [
      '**The precedence ladder in action:** `host_vars/rhel01.yml` (rank 7) beats `group_vars/webservers.yml` (rank 6). `group_vars/webservers.yml` beats `defaults/main.yml` (rank 1).',
      'When `-e http_port=9999` is supplied on the CLI, it evaluates at rank 22 and unilaterally overrides all inventory and role variables for all target hosts.',
      'Placing variables in `roles/web_service/vars/main.yml` would have broken `host_vars` customization because role vars evaluate at rank 16.',
    ],
    verify: [
      'ansible-inventory -i ~/ansible/inventory --host rhel01 | grep http_port   # shows 8443',
      'ansible-inventory -i ~/ansible/inventory --host rhel02 | grep http_port   # shows 8000',
      'ansible-playbook -i ~/ansible/inventory ~/ansible/test_precedence.yml | grep -E "resolved http_port"',
    ],
  },
  {
    id: 'ansible-idempotent-firewall',
    title: 'Implement an idempotent firewall and service deployment using ansible.posix',
    series: 'Ansible & RHCE',
    difficulty: 'advanced',
    estMinutes: 25,
    scenario:
      'Write a production-grade playbook that deploys Nginx, enables port 80/tcp permanently in firewalld, and starts the service. The playbook must pass the strict idempotence check: running it twice against the target estate must report exactly `changed=0` on the second pass.',
    tasks: [
      'Install package `nginx` using `ansible.builtin.dnf`.',
      'Configure firewalld to permanently allow `http` using `ansible.posix.firewalld`.',
      'Enable and start `nginx` using `ansible.builtin.systemd`.',
      'Verify zero changes on the immediate re-run.',
    ],
    requirements: [
      'Do not use `ansible.builtin.shell` or `ansible.builtin.command`.',
      'Specify `immediate: true` and `permanent: true` on the firewalld task.',
      'Declare the collection `ansible.posix` in the play header.',
    ],
    solution: `cat << 'EOF' > ~/ansible/deploy_web.yml
- name: Deploy Idempotent Web Tier
  hosts: webservers
  become: true
  collections:
    - ansible.posix
  tasks:
    - name: Ensure nginx is installed
      ansible.builtin.dnf:
        name: nginx
        state: present

    - name: Permit HTTP traffic through firewall
      ansible.posix.firewalld:
        service: http
        permanent: true
        immediate: true
        state: enabled

    - name: Ensure nginx service is running and enabled
      ansible.builtin.systemd:
        name: nginx
        state: started
        enabled: true
EOF

ansible-playbook -i ~/ansible/inventory ~/ansible/deploy_web.yml
# Second pass for idempotence verification:
ansible-playbook -i ~/ansible/inventory ~/ansible/deploy_web.yml`,
    explanation: [
      '**The idempotence trap:** Using `ansible.posix.firewalld` without `immediate: true` applies the rule to disk only and requires a firewall reload (or leaves live traffic blocked). Omitting `permanent: true` loses the rule upon host reboot.',
      'By using native declarative modules instead of shell scripts (`firewall-cmd --add-service=http`), Ansible inspects live state first; on pass 2, nothing has drifted, yielding `changed=0 failed=0`.',
      'This two-pass test is the automated grading check on the Red Hat Certified Engineer (EX294) practical exam.',
    ],
    verify: [
      'firewall-cmd --list-services | grep http',
      'systemctl is-active nginx',
      'systemctl is-enabled nginx',
    ],
  },
];
