import type { Deck } from '../questions';

export const DECK: Deck = {
  slug: 'incident-drills',
  title: 'Production incident triage & host break-fix drills',
  summary:
    'Ten high-stakes scenarios covering live troubleshooting under a clock: unlinked deleted files consuming disk space, self-healing decoys via systemd timers, NetworkManager overwriting resolv.conf, uninterruptible D-state processes, and socket backlog exhaustion.',
  series: 'Incident Drills',
  cards: [
    {
      id: 'df-vs-du-unlinked-leak',
      tag: 'Scenario 1',
      topic: 'The unlinked open file trap',
      difficulty: 'core',
      scenario:
        'The root filesystem is at 100% according to `df -h /`. A junior admin runs `rm -f /var/log/application.log` (which was 15GB). `df -h` still reports 100% full, but `du -sh /*` accounts for only 4GB of disk usage.',
      question:
        'Why did rm not free the disk space, how do you locate the culprit, and how do you free the blocks immediately without rebooting?',
      answer: [
        '**The process still holds an open file descriptor to the deleted inode.** In Linux, `rm` (unlink) unlinks the filename from the directory, but the kernel only frees the data blocks when the inode link count is 0 *and* all open file descriptors are closed.',
        '**Locate the process:** Run `lsof +L1` (or `lsof | grep \\\'(deleted)\\\'`). This reveals the PID and the file descriptor.',
        '**Free the space immediately:** Truncate the open file via the proc filesystem: `> /proc/<PID>/fd/<FD_NUM>`. The blocks are immediately reclaimed by the filesystem without terminating or restarting the service.',
      ],
    },
    {
      id: 'self-healing-malware-timer',
      tag: 'Scenario 2',
      topic: 'The recurring break & systemd timers',
      difficulty: 'trap',
      scenario:
        'During an incident, you notice `/etc/hosts` contains a poisoned DNS redirect. You edit and correct the file. Exactly 3 minutes later, the poisoned entry reappears. You check `crontab -l` for root and `/etc/cron.*` — both are empty.',
      question:
        'Where is the persistent trigger hiding, and how do you audit all active scheduled executions on modern systemd hosts?',
      answer: [
        '**It is running as a systemd timer.** Cron is no longer the sole scheduler on modern Linux distributions; systemd timers (`.timer` units triggering `.service` units) are standard.',
        '**Audit command:** Run `systemctl list-timers --all`. This shows the next run time, left time, last trigger, and the corresponding service unit.',
        'Once identified, stop and mask both units: `systemctl stop rogue.timer && systemctl mask rogue.timer rogue.service`.',
      ],
    },
    {
      id: 'dns-reboot-wipe',
      tag: 'Scenario 3',
      topic: 'NetworkManager resolv.conf overwrite',
      difficulty: 'core',
      scenario:
        'You manually edit `/etc/resolv.conf` to add corporate DNS servers `nameserver 10.0.0.2`. Name resolution works immediately. After a scheduled reboot, `/etc/resolv.conf` reverts to the DHCP provider’s DNS, breaking all internal services.',
      question:
        'Why was the file overwritten, and what is the proper configuration to prevent NetworkManager from overwriting DNS?',
      answer: [
        '**`/etc/resolv.conf` is dynamically managed by NetworkManager (or systemd-resolved).** Any manual edits are overwritten when the network interface re-negotiates its DHCP lease at boot.',
        '**The permanent fix:** Configure NetworkManager to ignore DNS updates in `/etc/NetworkManager/conf.d/99-dns.conf` with:\n```ini\n[main]\ndns=none\n```\nOr configure DNS servers directly on the connection profile: `nmcli con mod "eth0" ipv4.dns "10.0.0.2" ipv4.ignore-auto-dns yes && nmcli con up "eth0"`.',
      ],
    },
    {
      id: 'uninterruptible-d-state-hang',
      tag: 'Scenario 4',
      topic: 'Uninterruptible sleep (D state)',
      difficulty: 'deep',
      scenario:
        'The host shows a load average of 14.00, yet `top` shows 99% idle CPU and plenty of free RAM. Several `backup.sh` processes show process state `D`. Running `kill -9 <PID>` has zero effect; the process remains.',
      question:
        'What does state D mean, why can kill -9 not terminate it, and what is the root cause?',
      answer: [
        '**State `D` is Uninterruptible Sleep (TASK_UNINTERRUPTIBLE).** The process is blocked inside a kernel syscall waiting on hardware or network I/O (most commonly an unresponsive NFS share or failing SAN/disk).',
        '**Why kill -9 fails:** The kernel will not deliver any signal (including SIGKILL) to a process in D state until the pending I/O syscall returns or times out.',
        '**Resolution:** Restore network connectivity to the NFS server, unmount the hung mount with `umount -f -l /mnt/nfs` (lazy unmount), or reboot if a local block device driver is deadlocked.',
      ],
    },
    {
      id: 'time-drift-auth-failure',
      tag: 'Scenario 5',
      topic: 'NTP drift & clock step failures',
      difficulty: 'core',
      scenario:
        'Suddenly, all Kerberos tickets fail, TLS certificates fail validation with "certificate is not yet valid", and S3 uploads are rejected with RequestTimeTooSkewed. The host clock is 25 minutes fast.',
      question:
        'Why does chronyd not adjust the clock immediately by default, and how do you force an instant time step?',
      answer: [
        '**By default, NTP daemons slew (gradually adjust frequency) time drift** rather than stepping (jumping) it, to prevent database transactions and system timers from going backwards.',
        'When drift exceeds a safety threshold (e.g. 1000 seconds), slewing would take hours or days to correct.',
        '**Force instant step:** Run `chronyc makestep`. In `/etc/chrony.conf`, ensure `makestep 1.0 3` is configured so the clock steps on boot if the offset is larger than 1 second within the first 3 clock updates.',
      ],
    },
    {
      id: 'conntrack-table-exhaustion',
      tag: 'Scenario 6',
      topic: 'Netfilter conntrack table full',
      difficulty: 'deep',
      scenario:
        'A high-traffic web server suddenly drops new inbound TCP connections. `netstat -an` shows CPU and RAM are low, and the web server is listening, but dmesg reports: `nf_conntrack: table full, dropping packet`.',
      question:
        'What caused this drop, and how do you inspect and expand the table online?',
      answer: [
        '**The netfilter connection tracking table is full.** Every stateful iptables/nftables firewall rule requires a slot in `nf_conntrack` to track TCP states. Once `nf_conntrack_count == nf_conntrack_max`, all new connections are dropped.',
        '**Check current count:** `sysctl net.netfilter.nf_conntrack_count` vs `sysctl net.netfilter.nf_conntrack_max`.',
        '**Enlarge online:** `sudo sysctl -w net.netfilter.nf_conntrack_max=262144`. Also tune `net.netfilter.nf_conntrack_tcp_timeout_established` down from the default 432000s (5 days) to 3600s.',
      ],
    },
    {
      id: 'overmounted-ghost-directory',
      tag: 'Scenario 7',
      topic: 'The overmounted directory leak',
      difficulty: 'trap',
      scenario:
        'A backup job mistakenly writes 50GB of archives to `/mnt/storage` while the external disk is detached. Later, the admin mounts the external drive to `/mnt/storage`. `df -h /` shows the root partition is full, but examining `/mnt/storage` only reveals the external drive contents.',
      question:
        'Where did the 50GB go, and how do you access the hidden files without unmounting the live drive?',
      answer: [
        '**The files are trapped underneath the mount point on the underlying root filesystem.** Mounting a filesystem over an existing non-empty directory hides its previous contents without freeing the blocks.',
        '**Access hidden files without unmounting:** Use a bind mount to expose the root filesystem root in another location: `mount --bind / /mnt/root_inspect`.',
        'Now navigate to `/mnt/root_inspect/mnt/storage` to see, delete, or move the 50GB of hidden files.',
      ],
    },
    {
      id: 'zombie-process-buildup',
      tag: 'Scenario 8',
      topic: 'Zombie processes (Z state)',
      difficulty: 'core',
      scenario:
        'An alert triggers for PID exhaustion. Running `ps aux` reveals thousands of `[python] <defunct>` processes. Running `kill -9` on the defunct PIDs does nothing.',
      question:
        'What is a zombie process, why does kill -9 fail, and how do you clear them?',
      answer: [
        '**A zombie is an already-dead process.** It has terminated and released its memory and file descriptors, but its exit status remains in the process table because its parent has not called `wait()` or `waitpid()`.',
        '**Why kill fails:** You cannot kill a process that is already dead.',
        '**Resolution:** You must terminate or restart the **parent process** (PPID). When the parent dies, the zombies are reparented to PID 1 (systemd/init), which immediately reaps them with `wait()`.',
      ],
    },
    {
      id: 'systemd-unit-restart-hang',
      tag: 'Scenario 9',
      topic: 'D-Bus & PID file restart deadlocks',
      difficulty: 'deep',
      scenario:
        'You run `systemctl restart custom-api`. The command blocks for 90 seconds and fails with "Job for custom-api.service failed because a timeout was exceeded".',
      question:
        'What common unit file misconfigurations cause this timeout, and how do you diagnose it?',
      answer: [
        '**Mismatched `Type=` directive.** If `Type=forking` is set, systemd expects the daemon to fork and write a valid PID file matching `PIDFile=`. If the daemon runs in the foreground or writes to a different path, systemd waits for the timeout before killing it.',
        '**Diagnostics:** Run `systemctl status custom-api` and `journalctl -u custom-api -e --no-pager`. Check whether the process actually started in `ps aux` and compare its PID with `cat /run/custom-api.pid`.',
        'For foreground applications, change to `Type=simple` or `Type=exec`.',
      ],
    },
    {
      id: 'tcp-somaxconn-listen-overflow',
      tag: 'Scenario 10',
      topic: 'SYN backlog & somaxconn drops',
      difficulty: 'trap',
      scenario:
        'A high-concurrency microservice experiences random connection timeouts during traffic spikes. The CPU is at 30%, firewall rules are open, and the port is listening. `netstat -s | grep -i listen` shows "times the listen queue of a socket overflowed".',
      question:
        'What kernel parameters govern this queue, and how do you eliminate socket listen overflows?',
      answer: [
        '**The TCP listen backlog queue (`somaxconn`) is saturated.** When new TCP SYN packets arrive faster than the application can call `accept()`, connections overflow the backlog and are dropped.',
        '**The two bottlenecks:** Both the OS kernel limit and the application listen argument must be increased.',
        '**Tune OS:** `sysctl -w net.core.somaxconn=4096` and `sysctl -w net.ipv4.tcp_max_syn_backlog=4096`.',
        '**Tune Application:** Increase the `backlog` argument in your web server/framework (e.g. `listen 80 backlog=4096` in Nginx).',
      ],
    },
  ],
};
