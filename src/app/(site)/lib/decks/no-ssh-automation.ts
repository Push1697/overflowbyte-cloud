import type { Deck } from '../questions';

export const DECK: Deck = {
  slug: 'no-ssh-automation',
  title: 'The No-SSH Rule: Automating the EX294 Exam Environment',
  summary:
    'Ten hard-won production & exam scenarios enforcing strict zero-SSH disciplines: ad-hoc verification patterns, batch smoke-testing, syntax and sanity linter commands, and building self-healing automation loops.',
  series: 'Ansible & RHCE',
  cards: [
    {
      id: 'no-ssh-philosophy',
      tag: 'Scenario 1',
      topic: 'Why interactive SSH breaks automation exams',
      difficulty: 'core',
      scenario:
        'A candidate encounters a failed web service task on `node01`. They instinctively run `ssh node01`, manually edit `/etc/httpd/conf/httpd.conf` with vim, run `systemctl restart httpd`, and verify `curl localhost` works.',
      question:
        'Why does this manual hotfix guarantee a score of 0 on that task during official grading?',
      answer: [
        '**Official grading runs in a clean, re-imaged test environment.** Grading scripts tear down test VMs or re-run candidate playbooks against fresh snapshots.',
        'Any manual changes made via interactive SSH exist only on that live ephemeral instance. Because the change was never codified into the playbook, the grading engine’s fresh run encounters the exact original failure and awards 0 marks.',
        '**The No-SSH Rule:** You may only SSH to inspect read-only logs when debugging. Every single change, fix, and configuration must be committed to your playbook and executed through `ansible-playbook`.',
      ],
    },
    {
      id: 'adhoc-audit-loop',
      tag: 'Scenario 2',
      topic: 'Ad-hoc command verification',
      difficulty: 'core',
      scenario:
        'You just ran a playbook creating local users across 5 nodes. Rather than SSHing to each host, you need to verify all users exist and have UID >= 2000 in a single command line.',
      question:
        'What ad-hoc command inspects state across all inventory nodes simultaneously?',
      answer: [
        'Run: `ansible all -m command -a "getent passwd alice"`.',
        'Ansible executes the module in parallel across all inventory nodes and prints color-coded host outputs with stdout/stderr.',
        'You can also inspect with `ansible all -m shell -a "id -u alice"`.',
      ],
    },
    {
      id: 'ansible-playbook-syntax-check',
      tag: 'Scenario 3',
      topic: 'Fast syntax & task listing validation',
      difficulty: 'core',
      scenario:
        'Before running a 30-task playbook that takes several minutes, you want to ensure there are no YAML indentation flaws, unresolved variables in headers, or misspelled module names.',
      question:
        'What two CLI flags perform rapid non-destructive static validation without connecting to target nodes?',
      answer: [
        '1. `ansible-playbook --syntax-check site.yml` (validates YAML parser, playbook structure, and module names without establishing SSH connections).',
        '2. `ansible-playbook --list-tasks site.yml` (verifies play target hosts, tags, and displays the exact task sequence).',
        'Running `--syntax-check` should become muscle memory before every single playbook execution.',
      ],
    },
    {
      id: 'ansible-inventory-graph',
      tag: 'Scenario 4',
      topic: 'ansible-inventory inspection',
      difficulty: 'core',
      scenario:
        'You have defined nested groups `[webservers]`, `[dbservers]`, and parent group `[production:children]`. You suspect a node is missing from the production group.',
      question:
        'What command visualizes your complete inventory tree without opening the inventory file?',
      answer: [
        'Run: `ansible-inventory --graph`.',
        'It outputs an ASCII tree showing `@all`, `@production`, child groups, and individual hosts.',
        'To see all variables assigned to a specific host, run `ansible-inventory --host node01`.',
      ],
    },
    {
      id: 'serial-execution-rolling-updates',
      tag: 'Scenario 5',
      topic: 'serial execution & batching',
      difficulty: 'deep',
      scenario:
        'In a production cluster of 6 nodes behind a load balancer, updating all nodes simultaneously causes total service outage. You need Ansible to update 2 nodes at a time.',
      question:
        'What play directive controls the batch execution size, and how does failure handling interact with it?',
      answer: [
        'Set `serial: 2` (or `serial: "30%"`) in the play header.',
        'Ansible divides the target host list into batches of 2. It executes the entire play from start to finish on batch 1 before starting batch 2.',
        'If any host in batch 1 fails, Ansible halts the entire play by default, protecting the remaining 4 nodes from the broken update.',
      ],
    },
    {
      id: 'block-rescue-always-error-handling',
      tag: 'Scenario 6',
      topic: 'block, rescue, and always for resilient playbooks',
      difficulty: 'deep',
      scenario:
        'A critical task imports a database dump. If the task fails, an automated rollback script must execute, and in all cases (success or failure) temporary files in `/tmp` must be wiped.',
      question:
        'How does Ansible’s `block / rescue / always` structure implement structured exception handling?',
      answer: [
        '`block:` contains the primary tasks to attempt.',
        '`rescue:` executes only if a task inside the `block` fails (analogous to Python’s `except`).',
        '`always:` runs unconditionally regardless of whether the block succeeded or failed (analogous to Python’s `finally`).',
        'This allows automated recovery and cleanup without halting the playbook run with a fatal error.',
      ],
    },
    {
      id: 'failed-when-custom-conditions',
      tag: 'Scenario 7',
      topic: 'failed_when and changed_when directives',
      difficulty: 'trap',
      scenario:
        'You run a command task `command: /opt/bin/check_license.sh` which exits with return code 1 when a license is expiring, but exits with code 2 on actual internal failure. By default, Ansible considers rc=1 a fatal error.',
      question:
        'How do you instruct Ansible to only fail on rc >= 2, and prevent it from reporting changed state on read-only queries?',
      answer: [
        'Use `failed_when: license_result.rc >= 2` and `changed_when: false`.',
        'Register the result: `register: license_result`.',
        'Setting `changed_when: false` ensures the task reports `ok` (green) rather than `changed` (yellow), preserving accurate idempotency metrics.',
      ],
    },
    {
      id: 'loop-controls-label-optimization',
      tag: 'Scenario 8',
      topic: 'loop_control label for clean console output',
      difficulty: 'core',
      scenario:
        'A task loops over a large list of 50 dictionaries containing user objects with nested keys (`keys`, `passwords`, `metadata`). The task output floods your terminal screen with thousands of lines of raw JSON.',
      question:
        'How do you condense loop console output to show only the username being processed?',
      answer: [
        'Use `loop_control.label`: `loop: "{{ users }}" loop_control: { label: "{{ item.name }}" }`.',
        'Ansible will only print the extracted label string (e.g. `item: alice`) in the task status output instead of the entire dictionary payload.',
        'This dramatically cleans up exam logs and CI/CD pipeline output.',
      ],
    },
    {
      id: 'assert-module-for-test-driven-automation',
      tag: 'Scenario 9',
      topic: 'ansible.builtin.assert for TDD playbooks',
      difficulty: 'core',
      scenario:
        'To follow the No-SSH rule strictly, your playbooks must verify their own work at the end of the run before you submit your exam.',
      question:
        'What module provides automated test assertions inside the playbook itself?',
      answer: [
        'Use `ansible.builtin.assert`.',
        'Example: `ansible.builtin.assert: that: [ "http_port == 80", "ansible_facts[\'os_family\'] == \'RedHat\'" ] fail_msg: "Configuration assertion failed!"`.',
        'Writing verification tasks using `uri`, `stat`, or `assert` at the end of each play gives instant confirmation that the objective was met without interactive logins.',
      ],
    },
    {
      id: 'ansible-doc-terminal-reference',
      tag: 'Scenario 10',
      topic: 'ansible-doc as your offline documentation bible',
      difficulty: 'core',
      scenario:
        'In the EX294 exam, there is zero internet access and no Google or ChatGPT. You cannot remember the exact parameter name for setting SELinux context in the `ansible.builtin.copy` module.',
      question:
        'What command line tool gives instant offline access to module schemas and example task snippets?',
      answer: [
        'Run: `ansible-doc ansible.builtin.copy`.',
        'To see just practical, copy-paste ready task examples, jump to the end with `ansible-doc -s ansible.builtin.copy` or press `G` in less inside the full doc.',
        '`ansible-doc -l` lists all installed modules; `ansible-doc -t lookup -l` lists lookup plugins.',
        'Mastering `ansible-doc` is the single most important skill for passing EX294 without external references.',
      ],
    },
  ],
};
