---
title: "Mastering Enterprise Storage, Advanced Security (SUID/SGID/ACLs), and SELinux in RHEL 10"
subtitle: "A complete hands-on guide and interactive lab for RHCSA (EX200) and RHCE (EX294) candidates: LVM provisioning, special permission bits, POSIX ACLs and persistent SELinux policy."
tags: ["rhel","rhcsa","rhce","lvm","selinux"]
slug: "rhel10-storage-selinux-lab"
series: "Red Hat Certification"
canonical_url: "https://blog.overflowbyte.cloud/rhel10-storage-selinux-lab"
date: "3 Nov 2026"
---

# Mastering Enterprise Storage, Advanced Security (SUID/SGID/ACLs), and SELinux in RHEL 10

*A complete hands-on guide and interactive lab for RHCSA (EX200) and RHCE (EX294) candidates.*

In Red Hat Enterprise Linux 10, managing storage, fine-grained access controls, and SELinux policies forms the bedrock of both the **RHCSA (EX200)** and **RHCE (EX294)** performance-based exams. This post breaks down the core architecture concepts, walks an end-to-end hands-on lab with exact commands, and ends with review questions. A 55-card flashcard deck and three hands-on labs accompany it on the [learn page](/learn#rhel10-storage-selinux).

---

## Part 1: Architectural Foundations

### 1. Logical Volume Manager (LVM)

LVM abstracts physical storage devices into dynamic, flexible volumes:

- **Physical Volume (PV)**: initializes raw disks or partitions (e.g. `/dev/sdb`) for LVM management using `pvcreate`.
- **Volume Group (VG)**: combines one or more PVs into a unified storage pool (e.g. `vg_projects`) using `vgcreate`.
- **Logical Volume (LV)**: allocates virtual partitions from the VG pool (e.g. `lv_appdata`) using `lvcreate`.
- **File system expansion**: XFS file systems on LVM can be grown online with `lvextend --resizefs` or `xfs_growfs`. XFS **cannot** be shrunk; ext4 uses `resize2fs`.

### 2. Special file permissions (SUID, SGID, sticky bit)

Standard POSIX permissions (`rwx`) are supplemented by a leading octal digit for special execution and directory behaviors:

- **SUID (set user ID, `4` / `u+s`)**: executes a binary with the **owner's** privileges — the canonical example is `/usr/bin/passwd`.
- **SGID (set group ID, `2` / `g+s`)**: on a directory, all newly created files and subdirectories automatically inherit the parent directory's **group** ownership.
- **Sticky bit (`1` / `o+t`)**: in a world-writable shared directory such as `/tmp`, only the file owner, the directory owner, or root may delete or rename files.

### 3. POSIX Access Control Lists (ACLs)

ACLs provide granular permission assignment beyond the traditional user/group/other scheme:

- **Access ACLs**: grant specific users (`u:username:perms`) or groups (`g:groupname:perms`) tailored rights using `setfacl -m`; display them with `getfacl`.
- **Default ACLs**: rules like `d:u:username:perms` on a directory are automatically inherited by newly created files and subdirectories.

### 4. SELinux security framework

SELinux enforces Mandatory Access Control (MAC) based on security labels (`user:role:type:level`):

- **Context relabeling**: persistent rules are added to the policy database via `semanage fcontext -a -t <type> "/path(/.*)?"` and applied using `restorecon -Rv`. `chcon` alone is not persistent — it is wiped by a relabel.
- **Booleans**: toggle policy features at runtime via `setsebool -P <boolean> on/off`; query with `getsebool`.
- **Port labeling**: assign non-standard service ports using `semanage port -a -t <port_type_t> -p tcp <port_num>`.

---

## Part 2: Hands-On enterprise lab

### Lab scenario brief

Set up a shared collaboration directory `/srv/app_data` on an LVM volume with strict group inheritance, POSIX ACL read-only auditing, and persistent SELinux security rules.

### Phase A: LVM provisioning and file system setup

```bash
# 1. Initialize Physical Volume on /dev/sdb
sudo pvcreate /dev/sdb

# 2. Create Volume Group named 'vg_projects'
sudo vgcreate vg_projects /dev/sdb

# 3. Allocate 5GB Logical Volume named 'lv_appdata'
sudo lvcreate -n lv_appdata -L 5G vg_projects

# 4. Format with XFS file system
sudo mkfs.xfs /dev/vg_projects/lv_appdata

# 5. Create mount point and configure persistent mount in /etc/fstab
sudo mkdir -p /srv/app_data
echo "/dev/vg_projects/lv_appdata /srv/app_data xfs defaults 0 0" | sudo tee -a /etc/fstab
sudo mount -a
```

### Phase B: User, group and SGID configuration

```bash
# 1. Create collaboration group and users
sudo groupadd devops
sudo useradd -G devops dev_user
sudo useradd auditor_user

# 2. Set ownership and restrict access to the devops team
sudo chown root:devops /srv/app_data
sudo chmod 2770 /srv/app_data
```

The leading `2` in `2770` is the SGID bit: new entries under `/srv/app_data` inherit the `devops` group, and new subdirectories inherit the SGID bit itself.

### Phase C: POSIX ACL and SELinux persistence

```bash
# 1. Grant auditor_user read/execute on the directory and default read-only on new files
sudo setfacl -m u:auditor_user:rx /srv/app_data
sudo setfacl -m d:u:auditor_user:r /srv/app_data

# 2. Assign persistent SELinux file context type, then apply it
sudo semanage fcontext -a -t httpd_sys_rw_content_t "/srv/app_data(/.*)?"
sudo restorecon -Rv /srv/app_data
```

### Phase D: Verification and testing

```bash
# Verify SGID and ACL flags on the directory
ls -ld /srv/app_data
# Expected: drwxrws---+ root devops ...  (note the 's' and the '+')

# Check detailed ACL settings
getfacl /srv/app_data

# Check SELinux security context
ls -Zd /srv/app_data
```

---

## Part 3: Interactive Q&A and knowledge check

### Question 1: Online storage expansion

**Q:** An XFS logical volume mounted at `/srv/app_data` is running out of space. You extended the logical volume using `lvextend -L +3G /dev/vg_projects/lv_appdata`. What command must be executed next to expand the XFS file system?

**Answer:** Run `sudo xfs_growfs /srv/app_data`. Unlike `ext4` (which uses `resize2fs` on the block device), XFS resizing is performed online by passing the **mount point path**, not the device. Alternatively, `lvextend -L +3G --resizefs /dev/vg_projects/lv_appdata` performs both steps automatically.

### Question 2: Correcting `chmod` syntax errors

**Q:** Running `sudo chmod u+rwx g+rw o-rwx /srv/app_data` returns `chmod: cannot access 'g+rw': No such file or directory`. Why did this fail and how is it resolved?

**Answer:** `chmod` interprets space-separated arguments after the first mode string as file or directory names. Multiple symbolic modes must be **comma-separated without spaces**: `sudo chmod u+rwx,g+rw,o-rwx /srv/app_data` (or octal mode `sudo chmod 2770 /srv/app_data` — keep the SGID bit).

### Question 3: SELinux context vs. relabeling

**Q:** Why is running `chcon -t httpd_sys_rw_content_t /srv/app_data` considered insufficient for RHCSA/RHCE exam requirements?

**Answer:** `chcon` changes the context only in the running system; it is reset upon a system relabel (`touch /.autorelabel` + reboot, or `fixfiles`). To make the change persistent across reboots and relabels, write the rule to the SELinux policy file-context mapping with `semanage fcontext -a -t ...` and apply it with `restorecon`.

---

## Keep practicing

The full **55-card flashcard deck** (octal weights, SGID inheritance, ACL flags, LVM, polkit, Pacemaker ACLs and SELinux) and three **hands-on labs** — LVM+SGID provisioning, ACL + persistent SELinux context, and online XFS growth — are live on the [learn page](/learn#rhel10-storage-selinux). Work the labs on a RHEL 10 VM with one spare disk attached, then flip the cards until the traps (XFS never shrinks, `chcon` is not persistence, Deny beats Write beats Read in Pacemaker ACLs) feel obvious.
