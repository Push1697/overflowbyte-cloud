import type { Lab } from '../labs';

export const NEW_LABS: Lab[] = [
  {
    id: 'triage-unlinked-disk-leak',
    title: 'Recover disk space consumed by an unlinked open log file',
    series: 'Incident Drills',
    difficulty: 'core',
    estMinutes: 15,
    scenario:
      'CRITICAL ALERT: Root partition `/` is at 98% disk capacity. An admin attempted to mitigate by running `rm -f /var/log/heavy_worker.log`, but `df -h /` still shows 98% utilization and `du -sh /*` cannot account for the missing 10GB. The worker service cannot be restarted during peak trading hours.',
    tasks: [
      'Use `lsof` to identify the running process and file descriptor holding the deleted file.',
      'Verify the unlinked inode size and file descriptor path in `/proc`.',
      'Truncate the file descriptor online to instantly release the disk blocks without restarting the daemon.',
      'Confirm `df -h /` drops to normal levels.',
    ],
    requirements: [
      'Do not kill or restart the worker process.',
      'Do not unmount or remount filesystems.',
      'Perform the truncation in a single shell command.',
    ],
    solution: `# 1. Locate the process holding unlinked files:
sudo lsof +L1

# Look for output matching:
# heavy_wo 45120 root    3u   REG  253,0 10737418240     0 1312301 /var/log/heavy_worker.log (deleted)

# 2. Inspect the file descriptor link:
ls -l /proc/45120/fd/3

# 3. Truncate the open file descriptor to 0 bytes:
sudo truncate -s 0 /proc/45120/fd/3
# Alternative: sudo sh -c '> /proc/45120/fd/3'

# 4. Verify disk space reclaimed:
df -h /`,
    explanation: [
      '`rm` merely decrements the inode’s hard link count. The Linux kernel only deallocates the underlying data blocks when the link count reaches 0 *and* the reference count of open file descriptors across all processes drops to 0.',
      '`truncate -s 0 /proc/<PID>/fd/<FD>` issues the `ftruncate()` syscall directly on the open file description, resetting the file offset and freeing the disk blocks immediately.',
      'The service continues running seamlessly and continues logging from offset 0, preventing an outage during peak business hours.',
    ],
    verify: [
      'df -h /                       # usage drops immediately',
      'sudo lsof +L1                 # deleted file is either gone or reports size 0',
    ],
  },
  {
    id: 'hunt-systemd-timer-decoy',
    title: 'Isolate and neutralize a recurring rogue script driven by a systemd timer',
    series: 'Incident Drills',
    difficulty: 'advanced',
    estMinutes: 20,
    scenario:
      'INCIDENT 20261122: Every 5 minutes, `/etc/resolv.conf` is overwritten with an invalid rogue nameserver `198.51.100.1`. You manually fix the file, but 5 minutes later name resolution breaks again. `crontab -l` and `/etc/cron.*` contain no scheduled tasks.',
    tasks: [
      'Inspect modern scheduled timers with `systemctl list-timers`.',
      'Identify the suspicious timer and its target service unit.',
      'Inspect the unit definitions under `/etc/systemd/system/` or `/usr/lib/systemd/system/`.',
      'Stop, disable, and mask both the timer and the service.',
      'Restore `/etc/resolv.conf` and prove the recurrence is terminated.',
    ],
    requirements: [
      'Mask both units so they cannot be reactivated by D-Bus or socket activation.',
      'Verify the timer no longer appears in `systemctl list-timers`.',
    ],
    solution: `# 1. List all active and inactive timers:
systemctl list-timers --all

# 2. Identify anomalous unit, e.g., 'network-health-check.timer' triggering 'network-health-check.service':
systemctl cat network-health-check.timer
systemctl cat network-health-check.service

# 3. Stop and mask the rogue timer and service:
sudo systemctl stop network-health-check.timer
sudo systemctl disable --now network-health-check.timer
sudo systemctl mask network-health-check.timer
sudo systemctl mask network-health-check.service

# 4. Remove the unit files and reload daemon:
sudo rm -f /etc/systemd/system/network-health-check.*
sudo systemctl daemon-reload

# 5. Restore resolv.conf:
echo "nameserver 1.1.1.1" | sudo tee /etc/resolv.conf`,
    explanation: [
      'Adversaries and broken legacy scripts increasingly use systemd timers rather than cron because systemd timers can trigger sub-minute intervals, survive reboots, and hide among dozens of standard system units.',
      '`systemctl mask` symlinks the unit file to `/dev/null`. This is stronger than `disable`, as it makes it impossible for any other process or dependency to start the unit accidentally.',
      '`systemctl daemon-reload` flushes systemd’s internal dependency tree and purges deleted unit configurations from memory.',
    ],
    verify: [
      'systemctl list-timers | grep network-health   # returns empty',
      'systemctl status network-health-check.timer    # shows masked',
      'cat /etc/resolv.conf                           # remains untouched',
    ],
  },
];
