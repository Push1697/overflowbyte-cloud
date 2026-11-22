import type { Lab } from '../labs';

export const NEW_LABS: Lab[] = [
  {
    id: 'systemd-sandboxing-rce-defense',
    title: 'Harden a public web service against runtime RCE using systemd directives',
    series: 'Security & Exploitation',
    difficulty: 'advanced',
    estMinutes: 20,
    scenario:
      'CVE-2026-109618 / 111497 disclosure: Public-facing runtime parsers have unauthenticated memory corruption flaws. While upstream vendors prepare patches, you must construct an airtight systemd sandbox around the `payment-gateway.service` unit so that even if an attacker executes arbitrary code via heap overflow, they cannot write to the filesystem, access private user homes, or invoke dangerous system binaries.',
    tasks: [
      'Create a systemd drop-in override for `payment-gateway.service`.',
      'Enforce `ProtectSystem=strict` and `ProtectHome=yes`.',
      'Lock down temporary directories with `PrivateTmp=yes`.',
      'Prevent setuid escalation with `NoNewPrivileges=yes`.',
      'Apply `SystemCallFilter=@system-service` and drop all Linux capabilities.',
      'Reload systemd and verify security score with `systemd-analyze security`.',
    ],
    requirements: [
      'Use `systemctl edit` or a drop-in file under `/etc/systemd/system/payment-gateway.service.d/override.conf`.',
      'Ensure the daemon can still write to its required log path `/var/log/payment-gateway` using `ReadWritePaths=`.',
    ],
    solution: `sudo mkdir -p /etc/systemd/system/payment-gateway.service.d
cat << 'EOF' | sudo tee /etc/systemd/system/payment-gateway.service.d/override.conf
[Service]
# File system isolation
ProtectSystem=strict
ProtectHome=yes
PrivateTmp=yes
PrivateDevices=yes
ProtectKernelTunables=yes
ProtectKernelModules=yes
ProtectControlGroups=yes

# Explicit writable paths
ReadWritePaths=/var/log/payment-gateway

# Privilege mitigation
NoNewPrivileges=yes
CapabilityBoundingSet=
AmbientCapabilities=

# System call filtering
SystemCallFilter=@system-service
SystemCallErrorNumber=EPERM
EOF

sudo systemctl daemon-reload
sudo systemctl restart payment-gateway.service
systemd-analyze security payment-gateway.service`,
    explanation: [
      '`ProtectSystem=strict` mounts `/usr`, `/boot`, `/etc`, and the root filesystem read-only for that specific process tree. The process cannot drop ELF malware or alter configurations.',
      '`CapabilityBoundingSet=` (empty) strips all 41 Linux capabilities, ensuring even if the process runs as UID 0, it has no root superpowers.',
      '`SystemCallFilter=@system-service` restricts system calls to an allowed standard set. Prohibited calls like `kexec_load` or kernel module alterations fail instantly with `EPERM`.',
      '`systemd-analyze security` audits the effective exposure and gives numerical ratings from 0.0 (safest) to 10.0 (exposed).',
    ],
    verify: [
      'systemctl show -p ProtectSystem payment-gateway.service   # shows ProtectSystem=strict',
      'systemctl show -p NoNewPrivileges payment-gateway.service # shows NoNewPrivileges=yes',
      'systemd-analyze security payment-gateway.service         # reports "OK" green score',
    ],
  },
  {
    id: 'container-readonly-containment',
    title: 'Deploy an immutable read-only container with restricted tmpfs and dropped capabilities',
    series: 'Security & Exploitation',
    difficulty: 'core',
    estMinutes: 15,
    scenario:
      'Containerize a vulnerable legacy microservice with defensive runtime flags. The container must have a completely immutable root filesystem, ephemeral storage restricted to 32MB without execution bits, and run as an unprivileged UID.',
    tasks: [
      'Launch a container using `podman` or `docker` with `--read-only`.',
      'Mount a non-executable RAM tmpfs on `/tmp` with `--tmpfs /tmp:rw,noexec,nosuid,size=32m`.',
      'Drop all Linux capabilities using `--cap-drop=ALL`.',
      'Prove that attempting to create a file or compile a binary in `/tmp` fails.',
    ],
    requirements: [
      'The container must remain operational for serving HTTP requests.',
      'No files may be written to `/var` or `/etc`.',
    ],
    solution: `podman run -d --name secure-web \\
  --read-only \\
  --tmpfs /tmp:rw,noexec,nosuid,size=32m \\
  --cap-drop=ALL \\
  --security-opt=no-new-privileges:true \\
  --user 1001:1001 \\
  -p 8080:8080 \\
  docker.io/library/nginx:alpine

# Verify containment:
podman exec secure-web touch /etc/hacked.txt || echo "Rootfs write denied!"
podman exec secure-web sh -c 'echo "#!/bin/sh" > /tmp/test.sh && chmod +x /tmp/test.sh && /tmp/test.sh' || echo "Execution blocked on tmpfs!"`,
    explanation: [
      '`--read-only` disables filesystem modifications at the kernel VFS layer. Even if an attacker has code execution, `open(..., O_WRONLY|O_CREAT)` fails with `EROFS`.',
      'The `noexec` flag on `/tmp` causes the kernel to reject `execve()` on any binary or script located inside `/tmp`, neutralizing downloaded droppers.',
      'Combining `--cap-drop=ALL` with `--user 1001` ensures the attacker has no administrative leverage to bypass namespaces or inspect host devices.',
    ],
    verify: [
      'podman inspect secure-web --format "{{.HostConfig.ReadonlyRootfs}}"   # returns true',
      'podman inspect secure-web --format "{{.HostConfig.CapDrop}}"          # returns [ALL]',
    ],
  },
];
