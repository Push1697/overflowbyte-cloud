import type { Deck } from '../questions';

export const DECK: Deck = {
  slug: 'ansible-variable-precedence',
  title: 'Ansible variable precedence & execution mechanics',
  summary:
    'Ten production scenarios covering the 22-level precedence ladder: role defaults vs group_vars vs host_vars, vars/main.yml traps, extra vars (-e) overrides, set_fact scoping, registered variables, and collections resolution.',
  series: 'Ansible & RHCE',
  cards: [
    {
      id: 'extra-vars-override',
      tag: 'Scenario 1',
      topic: 'Extra vars (-e) precedence',
      difficulty: 'core',
      scenario:
        'A playbook defines `vars: { http_port: 8080 }` in the play header and imports a role that has `http_port: 80` in `vars/main.yml`. An operator runs `ansible-playbook -i inventory site.yml -e http_port=9090`.',
      question:
        'Which value of http_port wins during task execution, and what rank does -e hold on the 22-level precedence ladder?',
      answer: [
        '**`http_port: 9090` wins.** Extra variables passed via the command line with `-e` (or `--extra-vars`) hold the absolute highest priority on Ansible’s precedence hierarchy (rank 22 of 22).',
        'Nothing defined in inventory files, role defaults, role vars, play `vars:`, or task-level include files can override `-e`.',
        '**The trap:** Because `-e` is so powerful, operators often use it for quick hotfixes, masking misconfigured inventory vars or role defaults that later fail during unattended automated runs.',
      ],
    },
    {
      id: 'role-defaults-vs-inventory',
      tag: 'Scenario 2',
      topic: 'Role defaults vs inventory',
      difficulty: 'core',
      scenario:
        'A role `nginx` has `http_timeout: 60` in `roles/nginx/defaults/main.yml`. The inventory folder contains `group_vars/webservers.yml` setting `http_timeout: 120`. A target node `web01` is a member of `webservers`.',
      question:
        'What value is applied when the role executes on web01, and why are role defaults designed this way?',
      answer: [
        '**`http_timeout: 120` from `group_vars/webservers.yml` wins.**',
        'Role defaults (`defaults/main.yml`) occupy the very bottom of the precedence hierarchy (rank 1 of 22). Virtually any other variable definition overrides them.',
        '**Why it is designed this way:** Role authors put baseline values in `defaults/main.yml` so the role is functional out-of-the-box, but cleanly customizable by any user via inventory groups, host variables, or play parameters without modifying the role source code.',
      ],
    },
    {
      id: 'role-vars-vs-host-vars',
      tag: 'Scenario 3',
      topic: 'Role vars vs host_vars trap',
      difficulty: 'trap',
      scenario:
        'You want a custom SSH port 2222 on node `db01`, so you set `ssh_port: 2222` inside `host_vars/db01.yml`. However, the imported `sshd` role defines `ssh_port: 22` inside `roles/sshd/vars/main.yml`.',
      question:
        'Which port is configured on db01, and why is placing variables in role vars/main.yml dangerous?',
      answer: [
        '**Port 22 wins — the host_vars setting is completely ignored.**',
        'Variables placed in a role’s `vars/main.yml` (rank 16) have higher precedence than inventory `host_vars` (rank 7) and `group_vars` (rank 6). Only task vars, block vars, and `-e` can override them.',
        '**The rule of thumb:** Never place variables in `roles/<role>/vars/main.yml` unless they are immutable internal constants (e.g., OS-specific package names mapped by `ansible_os_family`). All user-tunable knobs belong in `defaults/main.yml`.',
      ],
    },
    {
      id: 'set-fact-scope-persistence',
      tag: 'Scenario 4',
      topic: 'set_fact scoping & persistence',
      difficulty: 'deep',
      scenario:
        'In Play 1, a task runs `set_fact: cache_tier="redis"` on `app01`. The playbook then executes Play 2 targeting `app01` with a different play header where `vars: { cache_tier: "memcached" }`.',
      question:
        'Which value does cache_tier hold in Play 2, and what is the scope of set_fact?',
      answer: [
        '**`cache_tier: "redis"` from `set_fact` wins.**',
        'Facts set via `set_fact` are assigned to the host in memory (`hostvars[inventory_hostname]`) and persist across all subsequent plays in that entire playbook run.',
        'Furthermore, `set_fact` has higher precedence (rank 19) than play-level `vars:` (rank 12). If you need temporary variables scoped strictly to a single task or block without altering host state across plays, use task `vars:` instead of `set_fact`.',
      ],
    },
    {
      id: 'inventory-parent-child-groups',
      tag: 'Scenario 5',
      topic: 'Inventory group inheritance',
      difficulty: 'core',
      scenario:
        'In inventory, group `all` sets `ntp_server: 0.pool.ntp.org`. Group `apac` (child of all) sets `ntp_server: 1.asia.pool.ntp.org`. Group `apac_database` (child of apac) does not define `ntp_server`. Target host `db-tokyo` is in `apac_database`.',
      question:
        'Which NTP server does db-tokyo inherit, and what determines order between sibling groups of the same depth?',
      answer: [
        '**`1.asia.pool.ntp.org` from child group `apac` wins.** In Ansible inventory inheritance, more specific child groups always override their parent groups.',
        '**Sibling groups at the same depth:** If a host belongs to two unrelated groups that both set the same variable, the resolution defaults to alphabetical order of the group names (last alphabetically loaded wins), unless explicitly controlled by `ansible_group_priority`.',
      ],
    },
    {
      id: 'registered-vars-in-loops',
      tag: 'Scenario 6',
      topic: 'Registered variables in loops',
      difficulty: 'deep',
      scenario:
        'A task iterates over three items with `loop: [itemA, itemB, itemC]` and saves the result to `register: batch_res`. In the next task, you check `batch_res.stdout`.',
      question:
        'Why does batch_res.stdout raise an undefined error, and how does Ansible structure loop register outputs?',
      answer: [
        '**When `register` is used on a task with `loop`, `batch_res` contains a `results` list**, not a top-level `stdout`. Top-level attributes are overwritten on each iteration and collapsed into `batch_res.results`.',
        'To inspect outputs, you must iterate over or map `batch_res.results`, e.g., `batch_res.results | map(attribute="stdout") | list`.',
        'Accessing `batch_res.stdout` directly fails because `stdout` only exists inside each element of `batch_res.results`.',
      ],
    },
    {
      id: 'collections-trap-in-exams',
      tag: 'Scenario 7',
      topic: 'The collections trap (EX294)',
      difficulty: 'trap',
      scenario:
        'On an EX294 exam station, you write a task using `firewalld: { service: "http", state: "enabled", permanent: true }`. When running the playbook, it fails immediately with "couldn’t resolve module/action \'firewalld\'".',
      question:
        'Why does firewalld fail out-of-the-box, and what command reveals the required Fully Qualified Collection Name (FQCN)?',
      answer: [
        '**`firewalld` is not in `ansible.builtin`.** It lives in the `ansible.posix` collection (`ansible.posix.firewalld`), alongside `mount`, `selinux`, and `acl`.',
        'In modern Ansible (Ansible Core 2.11+), bare module names are deprecated or absent if the collection is not installed or declared in `collections:` list.',
        '**The verification command:** Run `ansible-doc ansible.posix.firewalld` to verify documentation, or `ansible-galaxy collection list` to see installed collections on the control node.',
      ],
    },
    {
      id: 'idempotence-command-vs-module',
      tag: 'Scenario 8',
      topic: 'Playbook idempotence checks',
      difficulty: 'core',
      scenario:
        'A candidate passes an exam task by using `ansible.builtin.shell: "useradd -m developer"` and `ansible.builtin.shell: "chmod 755 /var/www"`. The grading script runs the playbook twice.',
      question:
        'Why does the grading script fail the playbook on the second pass, and what is the strict idempotence rule?',
      answer: [
        '**The second pass fails with `changed > 0` or a non-zero exit code.** Raw shell commands unconditionally report `changed: true` every run, and `useradd` exits with code 9 ("user already exists") on the second pass.',
        '**The idempotence rule:** Running a playbook twice against the target estate must result in `0 changed, 0 failed` on the second pass.',
        'Replace raw shell commands with declarative modules like `ansible.builtin.user` and `ansible.builtin.file`, or supply `creates:` / `removes:` arguments when shell execution is unavoidable.',
      ],
    },
    {
      id: 'block-error-handling-rescue',
      tag: 'Scenario 9',
      topic: 'Blocks, rescue, and always',
      difficulty: 'deep',
      scenario:
        'A critical configuration change in a `block` fails midway on host `node02`. A `rescue` stanza is attached to recover, followed by an `always` stanza.',
      question:
        'Does the play mark node02 as failed after rescue runs successfully, and when does always execute?',
      answer: [
        '**The play does NOT fail node02 if the `rescue` section finishes with 0 errors.** A successful rescue absorbs the failure and resets the failed state for that block.',
        '**The `always` stanza runs unconditionally**, regardless of whether the `block` succeeded, failed, or was rescued (similar to `finally` in Python/Java). It is the proper place to clean up staging directories or restore firewalls.',
      ],
    },
    {
      id: 'vars-prompt-unattended-ci',
      tag: 'Scenario 10',
      topic: 'vars_prompt in automated pipelines',
      difficulty: 'trap',
      scenario:
        'A developer commits a playbook that uses `vars_prompt: - name: db_password, prompt: "Enter password"` to a CI/CD pipeline triggered by a GitLab runner or GitHub Action.',
      question:
        'What happens when the pipeline runs, and what is the standard architecture for automated execution?',
      answer: [
        '**The pipeline hangs indefinitely or times out.** CI/CD runners do not have an interactive TTY to answer standard input prompts.',
        '**The fix:** Use Ansible Vault (`--vault-password-file`) or pass environment variables / external secret lookups (`lookup("env", "DB_PASS")`).',
        '`vars_prompt` is exclusively for ad-hoc interactive execution and must never be committed to automated deployment repositories.',
      ],
    },
  ],
};
