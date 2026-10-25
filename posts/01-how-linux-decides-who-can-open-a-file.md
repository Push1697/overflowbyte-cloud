---
title: "How Linux Decides Who Can Open a File (A Visual Deep Dive)"
subtitle: "Kernel credentials, newgrp internals, in-memory Inodes, and the exact order of Discretionary Access Control."
tags: ["linux", "kernel", "devops", "security", "sysadmin"]
slug: "how-linux-decides-who-can-open-a-file"
series: "Linux Internals"
canonical_url: "https://blog.overflowbyte.cloud/how-linux-decides-who-can-open-a-file"
---

# How Linux Decides Who Can Open a File (A Visual Deep Dive)

You add a developer to a new group:
```bash
sudo usermod -aG developers alice
```
Alice runs `cd /opt/projects/dev` or tries opening a shared file. 

**Result: `Permission denied`.**

Why does an open interactive shell refuse to see newly assigned groups? What data structures in the Linux kernel actually govern permissions? And why do most explanations of Linux file permissions get three critical details wrong?

In this ByteByteGo-style visual architectural explainer, we trace the entire journey from `/etc/group` down to kernel `task_struct`, VFS Inodes, and the exact step-by-step logic inside `generic_permission()`.

---

## 1. The Stale Groups Problem: Why Open Shells Never Re-read `/etc/group`

To understand why `usermod -aG` fails open shells, we must look at how credentials enter the kernel:

```
[Login / SSH] ---> PAM reads /etc/passwd & /etc/group
                         │
                         ▼
             Kernel allocates struct cred in RAM
                         │
                         ▼
             PID 1042 (bash) points to struct cred
```

1. **Authentication Step**: When Alice logs in via SSH or a terminal display manager, PAM reads `/etc/passwd` and `/etc/group`.
2. **Kernel Initialization**: The kernel allocates a reference-counted `struct cred` in memory and attaches it to the shell process (`task_struct`).
3. **Decoupling from Disk**: Once allocated, **running processes never re-read disk files like `/etc/group`**. Modifying `/etc/group` updates bytes on your disk block, but PID 1042 still references its existing in-memory `struct cred`.

---

## 2. Kernel Architecture: `task_struct` → `struct cred`

Inside `<linux/sched.h>`, every running thread is tracked by a `struct task_struct`. Inside that struct lies a pointer to `struct cred`:

```
+-------------------------------------------------------+
|                 struct task_struct                    |
|  pid_t pid;                                           |
|  const struct cred __rcu *real_cred; /* Real creds */ |
|  const struct cred __rcu *cred;      /* Eff. creds */ |
+-------------------------------------------------------+
                           │
                           ▼
+-------------------------------------------------------+
|                     struct cred                       |
|  atomic_t usage;                                      |
|  kuid_t   uid;   /* Real UID */                       |
|  kgid_t   gid;   /* Real GID */                       |
|  kuid_t   suid;  /* Saved UID */                      |
|  kgid_t   sgid;  /* Saved GID */                      |
|  kuid_t   euid;  /* Effective UID */                  |
|  kgid_t   egid;  /* Effective GID */                  |
|  kuid_t   fsuid; /* Filesystem UID (USED FOR FILES!)*/|
|  kgid_t   fsgid; /* Filesystem GID (USED FOR FILES!)*/|
|  struct group_info *group_info; /* Supplementary */   |
+-------------------------------------------------------+
```

### The 4 UIDs and GIDs: What Each Actually Does

| Credential | Role | Why It Exists |
| :--- | :--- | :--- |
| **Real ID (`uid`/`gid`)** | Process Ownership | Identifies who invoked the process. Governs signal delivery (`kill`). |
| **Effective ID (`euid`/`egid`)** | General Authorization | Evaluates capabilities, creating IPC message queues, shared memory. |
| **Saved ID (`suid`/`sgid`)** | State Preservation | Allows setuid binaries to drop root privileges and re-elevate them safely. |
| **Filesystem ID (`fsuid`/`fsgid`)** | **File Checks** | **The actual ID evaluated during VFS file checks!** |

> [!IMPORTANT]
> **Technical Correction #1:** File permission checks do **not** compare the inode owner against `euid`. Linux specifically compares against `fsuid`. Linux introduced `fsuid` so NFS and network daemons could check file access on behalf of a remote user without granting that remote user permission to signal or kill the daemon process.

---

## 3. What `newgrp` Actually Does: The 6-Step Syscall Sequence

When Alice runs `newgrp developers`, here is the exact syscall sequence:

```
[PID 1042: bash]
      │
      ├─ 1. fork() ─────────────► [PID 1080: Child Process]
      │                                 │
      │                                2. execve("/usr/bin/newgrp") (SetUID Root)
      │                                 │  --> euid becomes 0 (root)
      │                                 │
      │                                3. setgroups(developers, ...)
      │                                 │  --> Updates supplementary list
      │                                 │
      │                                4. setgid(developers_gid)
      │                                 │  --> Privileged call sets ALL 4 GIDs!
      │                                 │
      │                                5. setuid(alice_uid)
      │                                 │  --> Drops root permanently
      │                                 │
      │                                6. execve("/bin/bash")
      │                                 │  --> Replaces PID 1080 with refreshed shell!
      ▼                                 ▼
[Suspended Parent]             [New Active Shell with Developers Group]
```

> [!IMPORTANT]
> **Technical Correction #2:** `newgrp` changes much more than just `egid` or `fsgid`. Because it runs with root privilege, its `setgid()` syscall sets **all four GIDs** (`gid`, `egid`, `sgid`, `fsgid`) to the target group, and its `setgroups()` syscall adds the group to the supplementary group array.

---

## 4. Inodes in Memory: How Path Lookup Works

When a process requests an `open("/var/log/app.log", O_RDWR)`:

1. **Dentry Cache Lookup**: The kernel checks the in-memory Directory Entry (`dentry`) cache. If cached, it immediately retrieves the in-memory `struct inode`.
2. **Inode Table Resolution**: If not in cache, the kernel reads the filesystem block group descriptor and inode table from physical storage, allocating an in-memory `struct inode`.
3. **Metadata Inspection**: The inode contains:
   - `i_uid`: Numerical owner user ID.
   - `i_gid`: Numerical owner group ID.
   - `i_mode`: A 16-bit integer encoding file type, special bits, and permissions.

---

## 5. Decoding the 16-Bit `i_mode` Grid

Every file permission in Linux is stored as a single 16-bit unsigned integer:

```
+---------------+---------------+---------------+---------------+
| 15 14 13 12   |  11  10   9   |   8   7   6   |   5   4   3   |   2   1   0   |
|   File Type   | Special Bits  |  Owner (User) |     Group     |     Other     |
+---------------+---------------+---------------+---------------+---------------+
| 1  0  0  0    |  0   1   0    |  1   1   1    |  1   1   1    |  0   0   0    |
+---------------+---------------+---------------+---------------+---------------+
  Regular (010)     SGID (2)         r w x (7)       r w x (7)       - - - (0)
```
*Octal representation: `0102770` → File mode `2770` (`drwxrws---`).*

---

## 6. DAC Flowchart: How `generic_permission()` Evaluates Access

When testing whether Alice, Bob, or Carol can access a file, the kernel calls `generic_permission()` in `fs/namei.c`:

```
                 Does fsuid == inode.i_uid?
                       /         \
                     YES          NO
                     /              \
         Check Owner Bits            Does fsgid == inode.i_gid OR
        (User r/w/x bits)            in supplementary group list?
              /     \                         /         \
         MATCH       NO MATCH               YES          NO
          /             \                   /              \
       GRANT             \          Check Group Bits    Check Other Bits
                          \         (Group r/w/x)       (Other r/w/x)
                           \              /     \            /     \
                            \        MATCH    NO MATCH    MATCH   NO MATCH
                             \        /            \       /           \
                              \    GRANT            \   GRANT           \
                               \                     \                   \
                                └──────────────────────┴───────────────────┘
                                                       │
                                      Are mode bits refusing access?
                                                       │
                                                       ▼
                                      Does process have CAP_DAC_OVERRIDE
                                      or CAP_DAC_READ_SEARCH?
                                                    /     \
                                                  YES      NO
                                                  /          \
                                              GRANT          DENY (-EACCES)
```

> [!IMPORTANT]
> **Technical Correction #3:** Root's override comes **last**! The kernel does not short-circuit root at the very beginning of standard DAC checks. The mode bits are evaluated first. Only if the mode bits refuse the requested access does `generic_permission()` invoke capability checks like `capable_wrt_inode_uidgid(CAP_DAC_OVERRIDE)`.

---

## 7. The Collaborative Directory: SGID in Action

When collaborating in a team directory:

```bash
# Set SGID on shared directory
sudo chmod 2770 /opt/projects/dev
sudo chown root:developers /opt/projects/dev
```

- Any file created inside `/opt/projects/dev` automatically inherits the group `developers` rather than the author's primary group.
- Any subdirectory created automatically inherits both the group and the `SGID` bit!

---

## 8. Verify It on Your Machine Right Now

Open your terminal and run:

```bash
# 1. Inspect your current shell's four UIDs and GIDs:
grep -E 'Uid|Gid|Groups' /proc/$$/status

# 2. Inspect Inode metadata, raw octal, and ownership of /etc/passwd:
stat -c "Inode: %i | Mode: %a (%A) | Owner: %U(%u):%G(%g)" /etc/passwd

# 3. Test newgrp and observe GIDs updating in real-time:
newgrp <your-group>
grep -E 'Gid|Groups' /proc/$$/status
exit
```

---

*Interactive visual models, the 16-bit live calculator, and step-by-step state animations are available on our [Live Interactive Visual Lab on OverflowByte](https://overflowbyte.cloud/visuals/linux-permissions).*

*Full lab setups, EX294 exam drills, and low-level Linux administration guides live in my [Learning Notes](https://learning.overflowbyte.cloud) →*
