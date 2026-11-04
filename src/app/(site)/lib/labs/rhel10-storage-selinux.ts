import type { Lab } from '../labs';

export const NEW_LABS: Lab[] = [
  {
    id: 'lvm-sgid-shared-dir',
    title: 'Provision an LVM-backed shared directory with SGID inheritance',
    series: 'Red Hat Certification',
    difficulty: 'core',
    estMinutes: 20,
    scenario:
      'EX200-style task: build `/srv/app_data` on a fresh disk. A spare disk `/dev/sdb` is attached to your RHEL 10 VM, the team `devops` and users `dev_user` (member of devops) and `auditor_user` already exist or must be created, and the directory must survive reboots via fstab.',
    tasks: [
      'Create PV, VG `vg_projects` and a 5 GB LV `lv_appdata`, then format it XFS.',
      'Mount it persistently at `/srv/app_data`.',
      'Set ownership `root:devops` and a mode that gives the group full access plus SGID inheritance.',
    ],
    requirements: [
      'RHEL 10 VM with a spare disk at `/dev/sdb`.',
      'Use a single numeric chmod that includes the special bit.',
      'The mount must be registered in `/etc/fstab`, not just mounted by hand.',
      'Do not put `/srv/app_data` on the root file system.',
    ],
    solution: `sudo pvcreate /dev/sdb
sudo vgcreate vg_projects /dev/sdb
sudo lvcreate -n lv_appdata -L 5G vg_projects
sudo mkfs.xfs /dev/vg_projects/lv_appdata
sudo mkdir -p /srv/app_data
echo "/dev/vg_projects/lv_appdata /srv/app_data xfs defaults 0 0" | sudo tee -a /etc/fstab
sudo mount -a
sudo chown root:devops /srv/app_data
sudo chmod 2770 /srv/app_data`,
    explanation: [
      'The order matters: **PV then VG then LV then file system then mount** — each layer consumes the one below it. `mkfs.xfs` goes on the LV device `/dev/vg_projects/lv_appdata`, and the fstab entry must match that path exactly or `mount -a` fails at boot.',
      '**The trap is `chmod 770` instead of `2770`.** The leading `2` is the SGID bit; without it new files land in each creator’s primary group and the other teammates cannot write to them. SGID affects only the group, not the permission bits, which is why the mode is `2770` and not something exotic.',
      'Validate fstab before rebooting with `findmnt --verify` — a typo there is a classic "boots to emergency mode" exam fail. `mount -a` after appending the line proves the entry parses.',
    ],
    verify: [
      'ls -ld /srv/app_data        # expect drwxrws--- root devops (note the s)',
      'findmnt /srv/app_data       # shows the LV as source, xfs, mounted',
      'lvs                         # lv_appdata present in vg_projects',
      'sudo -u dev_user touch /srv/app_data/probe && ls -l /srv/app_data/probe   # group is devops, not the creator’s primary group',
    ],
  },
  {
    id: 'acl-selinux-persistence',
    title: 'Grant auditor read-only access with ACLs and make the SELinux context persistent',
    series: 'Red Hat Certification',
    difficulty: 'advanced',
    estMinutes: 20,
    scenario:
      'On the `/srv/app_data` volume from the previous lab, `auditor_user` must be able to read the directory and every file created in it, but must never get write access. At the same time a web service needs to write there, so the directory needs a persistent `httpd_sys_rw_content_t` label that survives a relabel.',
    tasks: [
      'Grant `auditor_user` read+execute on the directory via an access ACL.',
      'Add a default ACL so new files are automatically readable by the auditor.',
      'Write a persistent SELinux file-context rule for `/srv/app_data(/.*)?` and apply it.',
    ],
    requirements: [
      'RHEL 10 with SELinux enforcing.',
      'The SELinux change must be done through `semanage fcontext`, not `chcon`.',
      'The auditor gets read-only — never write — through the default ACL.',
    ],
    solution: `sudo setfacl -m u:auditor_user:rx /srv/app_data
sudo setfacl -m d:u:auditor_user:r /srv/app_data
sudo semanage fcontext -a -t httpd_sys_rw_content_t "/srv/app_data(/.*)?"
sudo restorecon -Rv /srv/app_data`,
    explanation: [
      '**Two different inheritance mechanisms are in play.** The default ACL (`d:u:auditor_user:r`) propagates read access to new files at creation time; the SGID bit from the previous lab propagates the *group*. They compose: a new file gets group `devops` from SGID and the auditor’s named entry from the default ACL.',
      '**The trap is using `chcon -t httpd_sys_rw_content_t /srv/app_data`.** That changes only the live label; the next `touch /.autorelabel` + reboot (or `fixfiles -F onboot`) resets it, because `chcon` writes nothing to the policy database. `semanage fcontext -a` records the rule persistently, and `restorecon -Rv` applies it now — that pair is the exam-correct answer.',
      'Note the default ACL grants `r` only, on top of the directory’s `rx`: the auditor can list and read, never write, which is exactly the read-only auditing requirement.',
    ],
    verify: [
      'getfacl /srv/app_data       # shows user:auditor_user:r-x and default:user:auditor_user:r--',
      'ls -ld /srv/app_data        # shows a trailing + (ACL present)',
      'ls -Zd /srv/app_data        # shows ...:httpd_sys_rw_content_t:...',
      'semanage fcontext -l | grep app_data   # rule listed as persistent (local, not chcon)',
      'sudo -u auditor_user cat /srv/app_data/<a file dev_user created>   # read works',
    ],
  },
  {
    id: 'grow-xfs-online',
    title: 'Grow the XFS volume online after extending the LV',
    series: 'Red Hat Certification',
    difficulty: 'core',
    estMinutes: 10,
    scenario:
      '`/srv/app_data` on `/dev/vg_projects/lv_appdata` is at 95% capacity. You already ran `sudo lvextend -L +3G /dev/vg_projects/lv_appdata` and `lvs` shows the bigger LV, but `df -h /srv/app_data` still shows the old 5 GB.',
    tasks: [
      'Expand the XFS file system to fill the enlarged LV, online, with the volume still mounted.',
      'Prove the file system now reports the larger size.',
    ],
    requirements: [
      'The volume must stay mounted the whole time (online grow).',
      'Do not reformat or unmount.',
      'Remember XFS cannot shrink — only grow commands are valid here.',
    ],
    solution: `sudo xfs_growfs /srv/app_data`,
    explanation: [
      '**The trap is passing the device instead of the mount point.** `xfs_growfs` operates on the mounted file system and takes the *mount point*: `xfs_growfs /srv/app_data`. `xfs_growfs /dev/vg_projects/lv_appdata` fails because the file system is mounted. (ext4 is the opposite: `resize2fs` takes the device.)',
      'The one-liner alternative is `lvextend -L +3G --resizefs /dev/vg_projects/lv_appdata`, which grows the LV and the file system in a single step. Both are valid; knowing both is what the exam rewards.',
      'XFS growth is online and instant because XFS allocates in AGs (allocation groups); shrinking would require rewriting those structures, which is why XFS refuses `lvreduce` on a live file system.',
    ],
    verify: [
      'df -h /srv/app_data         # now shows ~8G instead of 5G',
      'xfs_info /srv/app_data      # block counts grew, mount still active',
      'lvs -o lv_name,lv_size,vg_name | grep lv_appdata',
    ],
  },
];
