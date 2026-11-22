import type { Deck } from '../questions';

export const DECK: Deck = {
  slug: 'rhcsa-to-ansible-map',
  title: 'RHCSA to Ansible Module Mapping & Idempotency Rules',
  summary:
    'Ten definitive scenarios translating imperative sysadmin commands (parted, lvm, useradd, crontab, dnf, systemctl, nmcli, posix ACLs) directly to standard Ansible collections and modules.',
  series: 'Ansible & RHCE',
  cards: [
    {
      id: 'useradd-to-ansible-user',
      tag: 'Scenario 1',
      topic: 'useradd -> ansible.builtin.user',
      difficulty: 'core',
      scenario:
        'RHCSA command: `useradd -u 2001 -g staff -G wheel,dev -c "Dev Lead" -s /bin/bash alice`. You need to convert this to an Ansible task and set a hashed password.',
      question:
        'What module and parameters are required, and why must plaintext passwords never be passed to the password parameter?',
      answer: [
        'Use `ansible.builtin.user: name=alice uid=2001 group=staff groups=wheel,dev append=true comment="Dev Lead" shell=/bin/bash password="{{ \'secret123\' | password_hash(\'sha512\') }}"`.',
        '**The plaintext trap:** The `password` parameter takes a SHA-512 shadow hash (e.g. `$6$...`). Passing plaintext writes that literal string directly to `/etc/shadow`, completely locking the user out because Linux PAM cannot authenticate against unhashed input.',
        '`append: true` is crucial; without it, `groups:` replaces existing supplementary group memberships.',
      ],
    },
    {
      id: 'parted-lvm-to-ansible-modules',
      tag: 'Scenario 2',
      topic: 'parted & lvm -> parted, lvg, lvol, filesystem, mount',
      difficulty: 'core',
      scenario:
        'RHCSA sequence: Create an LVM partition on `/dev/sdb`, create Volume Group `vg_data`, Logical Volume `lv_app` (size 10G), format with XFS, and mount persistently at `/data`.',
      question:
        'What is the exact 5-module Ansible chain required to achieve this idempotently?',
      answer: [
        '1. `community.general.parted: device=/dev/sdb number=1 flags=[lvm] state=present`',
        '2. `community.general.lvg: vg=vg_data pvs=/dev/sdb1 state=present`',
        '3. `community.general.lvol: vg=vg_data lv=lv_app size=10G state=present`',
        '4. `community.general.filesystem: fstype=xfs dev=/dev/vg_data/lv_app`',
        '5. `ansible.posix.mount: path=/data src=/dev/vg_data/lv_app fstype=xfs state=mounted`',
        'Setting `state: mounted` on the mount module handles both updating `/etc/fstab` and mounting the filesystem immediately.',
      ],
    },
    {
      id: 'cron-to-ansible-cron',
      tag: 'Scenario 3',
      topic: 'crontab -e -> ansible.builtin.cron',
      difficulty: 'core',
      scenario:
        'RHCSA requirement: Schedule a backup script `/usr/local/bin/backup.sh` to run every Monday and Thursday at 02:30 AM under user `backupuser`.',
      question:
        'How do you write the Ansible task, and why is the name parameter mandatory for idempotency?',
      answer: [
        'Use `ansible.builtin.cron: name="Biweekly backup job" user=backupuser minute="30" hour="2" weekday="1,4" job="/usr/local/bin/backup.sh" state=present`.',
        '**The name parameter:** Ansible uses `#Ansible: <name>` comments inside the user’s crontab spool to track and identify the entry. Without a distinct name, successive runs will append duplicate cron jobs instead of updating or verifying the existing entry.',
      ],
    },
    {
      id: 'nmcli-to-ansible-nmcli',
      tag: 'Scenario 4',
      topic: 'nmcli -> community.general.nmcli or rhel-system-roles.network',
      difficulty: 'deep',
      scenario:
        'RHCSA command: `nmcli con mod eth1 ipv4.addresses 192.168.124.50/24 ipv4.gateway 192.168.124.1 ipv4.dns 8.8.8.8 ipv4.method manual`.',
      question:
        'What module configures persistent network connections in Ansible without cutting off SSH access?',
      answer: [
        'Use `community.general.nmcli: conn_name=eth1 ifname=eth1 type=ethernet ip4="192.168.124.50/24" gw4="192.168.124.1" dns4="8.8.8.8" state=present`.',
        'Alternatively, production environments standardise on `redhat.rhel_system_roles.network`.',
        '**Warning:** Modifying the interface over which your active Ansible SSH connection travels requires asynchronous execution (`async: 45, poll: 0`) or configuring secondary interfaces only to prevent orphaned connections.',
      ],
    },
    {
      id: 'dnf-package-groups',
      tag: 'Scenario 5',
      topic: 'dnf groupinstall -> ansible.builtin.dnf',
      difficulty: 'core',
      scenario:
        'RHCSA task: Install the package group `"Development Tools"` and install package `httpd` with all documentation packages excluded.',
      question:
        'How do you specify package groups and exclude documentation in `ansible.builtin.dnf`?',
      answer: [
        'Prefix group names with `@`: `ansible.builtin.dnf: name="@Development Tools" state=present`.',
        'To install packages while setting DNF options, use `install_weak_deps: false` or pass extra arguments: `ansible.builtin.dnf: name=httpd state=present install_weak_deps=false`.',
        'Always pass a list of package names to a single `dnf` task rather than looping over `name: "{{ item }}"`, which invokes Python subprocesses for every item and is 10x slower.',
      ],
    },
    {
      id: 'setfacl-to-ansible-acl',
      tag: 'Scenario 6',
      topic: 'setfacl -> ansible.posix.acl',
      difficulty: 'deep',
      scenario:
        'RHCSA task: Give user `auditor` read-write permissions and set default read permissions for future files on `/shared/finance`. Imperative: `setfacl -m u:auditor:rw /shared/finance` and `setfacl -d -m u:auditor:r /shared/finance`.',
      question:
        'How do you express both access ACLs and default ACLs using `ansible.posix.acl`?',
      answer: [
        'Task 1 (Access ACL): `ansible.posix.acl: path=/shared/finance entity=auditor etype=user permissions=rw state=present`',
        'Task 2 (Default ACL): `ansible.posix.acl: path=/shared/finance entity=auditor etype=user permissions=r default=true state=present`',
        '`default: true` sets the inherited directory ACL flag. It only applies to directory paths and ensures child files inherit specified rights upon creation.',
      ],
    },
    {
      id: 'systemd-overrides-drop-ins',
      tag: 'Scenario 7',
      topic: 'systemctl daemon-reload and drop-ins',
      difficulty: 'trap',
      scenario:
        'You write a drop-in file to `/etc/systemd/system/httpd.service.d/override.conf` setting `LimitNOFILE=65536`. You immediately start Apache with `ansible.builtin.service: name=httpd state=started`.',
      question:
        'Why does systemd throw a warning about modified unit files on disk, and what parameter resolves it?',
      answer: [
        'Whenever unit files or drop-ins are added or modified under `/etc/systemd/system/`, systemd requires `systemctl daemon-reload` to recompile its internal dependency tree.',
        'In Ansible, pass `daemon_reload: true` to the service/systemd module: `ansible.builtin.systemd: name=httpd state=started daemon_reload=true`.',
        'Using `ansible.builtin.systemd` instead of `ansible.builtin.service` gives native access to `daemon_reload`, `masked`, and socket activation controls.',
      ],
    },
    {
      id: 'tar-extract-to-ansible-unarchive',
      tag: 'Scenario 8',
      topic: 'tar -xvf -> ansible.builtin.unarchive',
      difficulty: 'core',
      scenario:
        'RHCSA command: `tar -xf /tmp/app-v2.tar.gz -C /opt/app/`. The tarball is located on the control node, but needs to extract onto all managed nodes.',
      question:
        'What module handles archive extraction, and how does the remote_src parameter determine source origin?',
      answer: [
        'Use `ansible.builtin.unarchive: src=/tmp/app-v2.tar.gz dest=/opt/app/ remote_src=false`.',
        '**The `remote_src` parameter:** When `remote_src: false` (the default), Ansible looks for the archive file on the **control node** and automatically copies and unpacks it onto target nodes.',
        'When `remote_src: true`, Ansible assumes the archive already resides on the **remote managed node** and extracts it in-place.',
      ],
    },
    {
      id: 'timedatectl-to-ansible',
      tag: 'Scenario 9',
      topic: 'timedatectl -> community.general.timezone',
      difficulty: 'core',
      scenario:
        'RHCSA requirement: Set the system timezone to `Asia/Kolkata` and ensure hardware clock is synchronized.',
      question:
        'What module manages system timezone declaratively across distributions?',
      answer: [
        'Use `community.general.timezone: name="Asia/Kolkata"`.',
        'This module manages `/etc/localtime` (symlink or binary) and `/etc/timezone` without shelling out to `timedatectl`.',
        'Pair it with the `rhel-system-roles.timesync` role for end-to-end NTP client synchronization.',
      ],
    },
    {
      id: 'auditd-sysctl-automation',
      tag: 'Scenario 10',
      topic: 'sysctl -p -> ansible.posix.sysctl',
      difficulty: 'core',
      scenario:
        'RHCSA task: Enable IPv4 packet forwarding persistently (`net.ipv4.ip_forward = 1`) and reload kernel parameters.',
      question:
        'How does `ansible.posix.sysctl` guarantee persistence across reboots and immediate kernel activation?',
      answer: [
        'Use `ansible.posix.sysctl: name="net.ipv4.ip_forward" value="1" state=present reload=true sysctl_set=true`.',
        '`state: present` ensures the entry exists in `/etc/sysctl.conf` or `/etc/sysctl.d/99-sysctl.conf`.',
        '`reload: true` executes the equivalent of `sysctl -p` immediately so that running kernel state updates without a reboot.',
      ],
    },
  ],
};
