# Deep Dive: Linux Kernel Credential Management, `newgrp`, and Inode Permission Resolution

---

## 1. Executive Summary

This document explains the internal mechanisms of:
1. **Process credential management and the `newgrp` command** at the Linux OS and kernel level.
2. **Metadata persistence and permission resolution** (Inodes, Superblocks, and the Virtual File System - VFS).

---

## 2. Anatomy of `newgrp developers`

### 2.1 The Problem It Solves
When a system administrator assigns a user to a supplementary group via `/etc/group` (e.g., using `usermod -aG developers labex`), existing processes (such as an open interactive Bash shell) do **not** dynamically reread `/etc/group`. 

Process credentials in Linux are initialized during login by `login`, `sshd`, or a display manager, which calls PAM (Pluggable Authentication Modules). PAM reads `/etc/passwd` and `/etc/group`, configures the process credentials, and calls `execve()` to spawn the user's initial shell. Any already running process retains its cached kernel credential descriptor until modified or replaced.

---

### 2.2 Kernel Data Structure: `struct task_struct` and `struct cred`

Every thread and process in the Linux kernel is represented by a `struct task_struct` (defined in `<linux/sched.h>`). Within this structure lies a reference-counted pointer to `struct cred` (defined in `<linux/cred.h>`):

```
+-------------------------------------------------------+
|                 struct task_struct                    |
|  pid_t pid;                                           |
|  char comm[TASK_COMM_LEN];                            |
|  ...                                                  |
|  const struct cred __rcu *real_cred; /* Real creds */ |
|  const struct cred __rcu *cred;      /* Eff. creds */ |
+-------------------------------------------------------+
                           |
                           v
+-------------------------------------------------------+
|                     struct cred                       |
|  atomic_t usage;                                      |
|  kuid_t   uid;   /* Real UID */                       |
|  kgid_t   gid;   /* Real GID */                       |
|  kuid_t   suid;  /* Saved UID */                      |
|  kgid_t   sgid;  /* Saved GID */                      |
|  kuid_t   euid;  /* Effective UID (DAC checks) */     |
|  kgid_t   egid;  /* Effective GID (DAC checks) */     |
|  kuid_t   fsuid; /* UID for VFS filesystem checks */  |
|  kgid_t   fsgid; /* GID for VFS filesystem checks */  |
|  struct group_info *group_info; /* Supp. groups */    |
+-------------------------------------------------------+
```

#### Key Identity Fields:
* **RGID (Real Group ID):** Identifies the real owner of the process.
* **EGID (Effective Group ID):** Used by the kernel to determine access permissions for system resources (IPC, signals).
* **FSGID (Filesystem Group ID):** Specific to Linux; directly evaluated during filesystem permissions evaluation (usually matches EGID).
* **Supplementary Group List (`group_info`):** An array of auxiliary groups assigned to the user.

---

### 2.3 Execution Flow of `newgrp`

When you type `newgrp developers`:

```
User Space                                     Kernel Space
==========                                     ============

1. User invokes `newgrp developers`
   |
2. Looks up "developers" in /etc/group
   to fetch GID (e.g., GID=1002)
   |
3. If password required & user not
   in group, prompts for group pass.
   |
4. Calls setgid(1002) / setresgid(...) -------> sys_setresgid()
                                                   |
                                                Updates task_struct->cred:
                                                  - egid  = 1002
                                                  - fsgid = 1002
                                                   |
5. Calls execve("/bin/bash", ...) ------------> sys_execve()
   |                                               |
   v                                            Replaces current process image 
Spawns fresh shell with new EGID/FSGID          with a new shell holding updated
                                                `cred` pointers.
```

1. **User Space Authentication:** `newgrp` is typically an executable binary with SUID permissions or standard execution privileges that queries `/etc/group`.
2. **System Calls:** It calls `setgid()` / `setresgid()` to adjust group credentials.
3. **Subshell Creation:** Instead of altering the running shell in place, `newgrp` replaces or overlays the current process via `execve()` to spawn a brand new subshell session where:
   * The primary GID (`egid` & `fsgid`) is set directly to the GID of `developers`.
   * Files newly created by default in this shell will now belong to `developers` without needing SGID on the parent directory.

---

## 3. How the OS Stores and Resolves Permissions

When you run `chmod 2770 phoenix_project` or access a file, where does the operating system store this state, and how does the kernel retrieve it?

### 3.1 Metadata Architecture: Inodes vs. Directory Entries (dentries)

File permissions are **not** stored within file content, nor are they stored in directory lists. They are stored inside an on-disk and in-memory data structure called an **Inode** (Index Node).

```
Filesystem Block Layout (e.g., ext4)
+---------------+-------------------+------------------+---------------------+
|  Superblock   | Block Group Descr |   Inode Table    |     Data Blocks     |
| (FS metadata) | (Allocation bits) | [Inode 1][Inode 2] | (Actual file text)  |
+---------------+-------------------+------------------+---------------------+
                                            |
                                            v
                                 +-----------------------+
                                 |     Disk Inode        |
                                 |-----------------------|
                                 | Mode (e.g. 02770)     |
                                 | Owner UID (e.g. 1001) |
                                 | Group GID (e.g. 1002) |
                                 | Size, Timestamps      |
                                 | Block Pointers        |
                                 +-----------------------+
```

#### The Relationship Between Directory, Dentry, and Inode:
* A **Directory** is simply a specialized file containing a table mapping human-readable names to inode numbers:
  ```text
  Filename             Inode Number
  ---------------------------------
  .                    140221
  ..                   131072
  phoenix_project      140589
  ```
* A **Dentry (Directory Entry)** is an in-memory kernel cache structure (`struct dentry`) that maps paths to inodes to eliminate disk read latency during file traversals.

---

### 3.2 Inode Permission Bit Encoding (`i_mode`)

Inside the kernel's `struct inode` (defined in `<linux/fs.h>`), file type and permissions are packed into a single 16-bit integer field: `umode_t i_mode`.

```
Bit Breakdown of i_mode (16 bits):

  15  14  13  12   11  10   9   8   7   6   5   4   3   2   1   0
+---+---+---+---+ +---+---+---+ +---+---+---+ +---+---+---+ +---+---+---+
|   File Type   | | S | S | T | | r | w | x | | r | w | x | | r | w | x |
+---+---+---+---+ +---+---+---+ +---+---+---+ +---+---+---+ +---+---+---+
  [ 4 Bits ]        [ Special ]   [  Owner  ]   [  Group  ]   [ Others  ]
                     11: SUID       8: Read       5: Read       2: Read
                     10: SGID       7: Write      4: Write      1: Write
                      9: Sticky     6: Execute    3: Execute    0: Execute
```

* **Octal Representation for `2770`:**
  * Special bits: `2` (binary `010` -> SGID enabled).
  * Owner bits: `7` (binary `111` -> `rwx`).
  * Group bits: `7` (binary `111` -> `rwx`).
  * Other bits: `0` (binary `000` -> `---`).

---

## 4. Kernel DAC (Discretionary Access Control) Algorithm

When a process initiates an operation on a file (e.g., `open("file.txt", O_RDWR)`), the kernel's VFS layer executes the DAC validation procedure via `generic_permission()` in `fs/namei.c`:

```
                    Process wants to access File
                                 |
                                 v
               +-----------------------------------+
               | Is Process EUID == Inode i_uid?   |
               +-----------------------------------+
                              /     \
                       YES   /       \   NO
                            v         v
            +--------------------+   +------------------------------------+
            | Check Owner Bits   |   | Is Process EGID / FSGID or any     |
            | (Bits 8-6 of mode) |   | Supplementary GID == Inode i_gid?  |
            +--------------------+   +------------------------------------+
                      |                                /     \
                      |                         YES   /       \   NO
                      |                              v         v
                      |              +--------------------+   +--------------------+
                      |              | Check Group Bits   |   | Check Other Bits   |
                      |              | (Bits 5-3 of mode) |   | (Bits 2-0 of mode) |
                      |              +--------------------+   +--------------------+
                      |                                |        |
                      +-------------------+------------+--------+
                                          |
                                          v
                              Permission Granted / Denied
```

### Critical Rules of DAC Evaluation:
1. **First-Match Evaluation:** The kernel evaluates identity in strict order: **Owner $\rightarrow$ Group $\rightarrow$ Others**. 
2. If the user owns the file, **only** the owner permissions apply. If the owner bits deny read access, access is denied immediately, even if group permissions permit it.
3. If the user does not own the file, the kernel scans the process's primary `fsgid` and supplementary groups list (`cred->group_info`). If any match `inode->i_gid`, **only** the group permissions apply.
4. If neither match, the "Others" bits are evaluated.
5. If the calling process has `CAP_DAC_OVERRIDE` (e.g., user `root`), standard read/write DAC restrictions are bypassed.

---

## 5. SGID Behavior on Directories

When the SGID bit (`chmod g+s` or `chmod 2xxx`) is enabled on a **directory**:

1. **Group Inheritance:** Any regular file created inside the directory ignores the creating user's primary group and instead automatically sets its `inode->i_gid` to match the directory's `inode->i_gid`.
2. **Directory Inheritance:** Any subdirectory created inside automatically inherits both the `i_gid` **and** the SGID bit (`S_ISGID`) of the parent directory.
3. This creates a persistent collaborative tree for group members.