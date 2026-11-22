import type { Lab } from '../labs';

export const NEW_LABS: Lab[] = [
  {
    id: 'rhcsa-storage-to-ansible-pipeline',
    title: 'Automate Complete RHCSA LVM & Storage Lifecycle in Ansible',
    series: 'Ansible & RHCE',
    difficulty: 'advanced',
    estMinutes: 30,
    scenario:
      'EX294 Exam Task: An empty secondary block device `/dev/vdb` exists on all database nodes. You must write a reusable Ansible playbook `storage.yml` that creates a 20GiB partition on `/dev/vdb`, builds a Volume Group `vg_database`, allocates a 12GiB Logical Volume `lv_pgdata`, formats it with XFS, mounts it at `/var/lib/pgsql/data`, sets SELinux context `postgresql_db_t`, and creates a local user `postgres` with UID 26 and home directory `/var/lib/pgsql`.',
    tasks: [
      'Partition `/dev/vdb` with LVM flag enabled.',
      'Create VG `vg_database` and LV `lv_pgdata` with exact sizing.',
      'Format with XFS and configure persistent `/etc/fstab` mount entry.',
      'Apply persistent SELinux file context and run restorecon.',
      'Create service user `postgres` with matched home directory permissions.',
    ],
    requirements: [
      'Do not execute parted, mkfs, or mount directly via shell/command.',
      'Use `ansible.posix.sefcontext` paired with `ansible.builtin.command: restorecon`.',
      'The mount must survive system reboots (`state: mounted`).',
    ],
    solution: `cat << 'EOF' > ~/ansible/storage.yml
---
- name: Automate Complete LVM Storage Stack
  hosts: dbservers
  become: true
  tasks:
    - name: Create 20GiB partition on secondary disk
      community.general.parted:
        device: /dev/vdb
        number: 1
        part_end: 20GiB
        flags: [ lvm ]
        state: present

    - name: Create Volume Group vg_database
      community.general.lvg:
        vg: vg_database
        pvs: /dev/vdb1
        state: present

    - name: Create Logical Volume lv_pgdata
      community.general.lvol:
        vg: vg_database
        lv: lv_pgdata
        size: 12g
        state: present

    - name: Format Logical Volume with XFS filesystem
      community.general.filesystem:
        fstype: xfs
        dev: /dev/vg_database/lv_pgdata

    - name: Mount filesystem at /var/lib/pgsql/data
      ansible.posix.mount:
        path: /var/lib/pgsql/data
        src: /dev/vg_database/lv_pgdata
        fstype: xfs
        state: mounted

    - name: Define persistent SELinux context for database storage
      ansible.posix.sefcontext:
        target: '/var/lib/pgsql/data(/.*)?'
        setype: postgresql_db_t
        state: present

    - name: Apply SELinux context to existing directory tree
      ansible.builtin.command: restorecon -Rv /var/lib/pgsql/data
      changed_when: false

    - name: Create postgres service account
      ansible.builtin.user:
        name: postgres
        uid: 26
        group: postgres
        home: /var/lib/pgsql
        shell: /bin/bash
        state: present
EOF

ansible-playbook -i ~/ansible/inventory ~/ansible/storage.yml`,
    explanation: [
      '**The complete storage stack:** `parted` -> `lvg` -> `lvol` -> `filesystem` -> `mount`.',
      '`state: mounted` ensures `/etc/fstab` contains the entry with proper UUID or device path, and executes `mount` immediately.',
      '**SELinux two-step:** `sefcontext` registers `/var/lib/pgsql/data(/.*)?` as `postgresql_db_t` in the kernel targeted policy database. The non-destructive `restorecon -Rv` applies the labels to inodes on disk.',
      '`changed_when: false` ensures `restorecon` does not mark the task as modified on repeated passes.',
    ],
    verify: [
      'ansible dbservers -m command -a "lsblk -f /dev/vdb"',
      'ansible dbservers -m command -a "findmnt /var/lib/pgsql/data"',
      'ansible dbservers -m command -a "ls -ldZ /var/lib/pgsql/data"',
    ],
  },
];
