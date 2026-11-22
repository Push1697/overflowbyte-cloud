import type { Lab } from '../labs';

export const NEW_LABS: Lab[] = [
  {
    id: 'rhcsa-rhce-idempotent-stack',
    title: 'Deploy an Idempotent Multi-Tier Web Stack with RHEL System Roles',
    series: 'Ansible & RHCE',
    difficulty: 'core',
    estMinutes: 25,
    scenario:
      'EX294 Benchmark: Build a fully automated web stack playbook. The playbook must synchronize system time via rhel-system-roles.timesync, install Apache and firewalld, deploy a custom vhost template with dynamic port and admin email from group_vars, open firewalld port 80/tcp permanently and immediately, and prove idempotency on second run with 0 changed tasks.',
    tasks: [
      'Create `ansible.cfg` with `roles_path = /usr/share/ansible/roles:~/.ansible/roles`.',
      'Create group_vars/all.yml with NTP server and webserver parameters.',
      'Write `stack.yml` incorporating the timesync role and httpd tasks with handlers.',
      'Execute the playbook twice to verify total idempotency (`changed=0` on pass 2).',
    ],
    requirements: [
      'Use native Ansible modules only (no raw shell or command unless strictly required).',
      'Trigger web service reload only when the configuration template changes using handlers.',
      'Ensure firewalld changes take effect immediately without a reboot.',
    ],
    solution: `mkdir -p ~/exam_prep/{group_vars,templates}
cd ~/exam_prep

cat << 'EOF' > ansible.cfg
[defaults]
inventory = ./inventory
roles_path = /usr/share/ansible/roles:~/.ansible/roles
remote_user = automation
host_key_checking = False

[privilege_escalation]
become = True
become_method = sudo
become_user = root
become_ask_pass = False
EOF

cat << 'EOF' > inventory
[webservers]
node01 ansible_host=192.168.124.11
node02 ansible_host=192.168.124.12
EOF

cat << 'EOF' > group_vars/all.yml
timesync_ntp_servers:
  - hostname: 0.rhel.pool.ntp.org
    iburst: true
http_port: 80
web_admin: "admin@overflowbyte.tech"
EOF

cat << 'EOF' > templates/vhost.conf.j2
# Managed by Ansible - do not edit manually
<VirtualHost *:{{ http_port }}>
    ServerAdmin {{ web_admin }}
    DocumentRoot /var/www/html
    ErrorLog /var/log/httpd/error_log
    CustomLog /var/log/httpd/access_log combined
</VirtualHost>
EOF

cat << 'EOF' > stack.yml
---
- name: Configure Idempotent Web Stack
  hosts: webservers
  roles:
    - role: rhel-system-roles.timesync
  tasks:
    - name: Install Apache and Firewalld packages
      ansible.builtin.dnf:
        name:
          - httpd
          - firewalld
        state: present

    - name: Deploy custom virtual host configuration
      ansible.builtin.template:
        src: templates/vhost.conf.j2
        dest: /etc/httpd/conf.d/vhost.conf
        owner: root
        group: root
        mode: '0644'
      notify: Restart Apache

    - name: Ensure firewalld service is started and enabled
      ansible.builtin.service:
        name: firewalld
        state: started
        enabled: true

    - name: Permit HTTP traffic through firewall
      ansible.posix.firewalld:
        service: http
        permanent: true
        immediate: true
        state: enabled

    - name: Ensure Apache service is started and enabled
      ansible.builtin.service:
        name: httpd
        state: started
        enabled: true

  handlers:
    - name: Restart Apache
      ansible.builtin.service:
        name: httpd
        state: restarted
EOF

ansible-playbook stack.yml
ansible-playbook stack.yml`,
    explanation: [
      '**Handlers guarantee idempotency:** By triggering service restarts via `notify: Restart Apache`, the service is only cycled if the configuration template was modified. Subsequent runs do not restart httpd.',
      '**`immediate: true`:** Directly applies the firewall rule to active nftables chains while `permanent: true` writes it to `/etc/firewalld/zones/public.xml`.',
      'The second pass of `ansible-playbook stack.yml` completes with `ok=6 changed=0 failed=0`, satisfying the strict zero-drift criteria of automated grading.',
    ],
    verify: [
      'ansible-playbook stack.yml | grep -E "changed=0.*failed=0"',
      'ansible all -m uri -a "url=http://localhost return_content=no"',
      'ansible all -m command -a "firewall-cmd --list-services"',
    ],
  },
];
