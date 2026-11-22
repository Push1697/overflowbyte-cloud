---
title: "AWS–Azure Interconnect, Azure Cobalt 200 and NoisyTCP Flaw — OverflowByte Weekly, Nov 16 – 22, 2026"
subtitle: "AWS-Azure multicloud connectivity, Microsoft Ignite infrastructure announcements, NoisyTCP remote DoS (CVE-2026-99288), Puppet RCE added to CISA KEV, and AZ-401 Agentic DevOps certification."
tags: ["devops-weekly-updates", "aws", "azure", "linux-security-updates", "kubernetes", "ai-agents", "newsletter"]
series: "OverflowByte Weekly"
date: "22 Nov 2026"
cover: "/static/newsletter/2026-11-22-banner.svg"
---

![OverflowByte Weekly #11 — Nov 16 – 22, 2026](/static/newsletter/2026-11-22-banner.svg)

*A blockbuster week across hyperscaler infrastructure, Linux kernel triage, and enterprise AI operations. AWS and Microsoft Azure officially launched private cross-cloud interconnect, Microsoft Ignite 2026 unveiled Cobalt 200 custom silicon and HorizonDB, the decade-old NoisyTCP Linux vulnerability demands kernel updates, Puppet faces active exploitation in CISA's KEV, and AZ-400 is officially retired for Agentic DevOps.*

---

## In this issue

1. **Cloud & DevOps**: AWS–Azure Interconnect GA, Microsoft Ignite 2026 releases (Cobalt 200, HorizonDB, Monitor Health Models), Kubernetes lifecycle deadlines
2. **Linux & Server Management**: "NoisyTCP" Kernel Vulnerability (CVE-2026-99288), Critical Puppet RCE in CISA KEV (CVE-2026-115731)
3. **Career & Learning**: Microsoft retires AZ-400 for AZ-401 (Agentic DevOps), CNCF State of Cloud Native Report (93% adoption)
4. **Tech News & Strategy**: Hyperscaler Outage Scrutiny & Cyber Investigation Board, Enterprise Agent Governance (Microsoft IQ & Agent 365)
5. **AI / Automation in DevOps**: Azure Catalyst & SRE Agent, 50% GCP Cost Reduction for Background AI Agents

---

## 1. Cloud & DevOps

- **AWS–Azure Multicloud Connectivity (General Availability)**:
  On November 17, AWS officially announced the GA of [AWS Interconnect – Multicloud connectivity with Microsoft Azure](https://aws.amazon.com/about-aws/whats-new/2026/11/aws-announces-AWS-interconnect-multicloud-azure-ga/). The service establishes dedicated, redundant private connectivity between AWS Direct Connect and Azure ExpressRoute without requiring third-party colocation facilities or complex overlay VPNs. Cross-cloud traffic stays entirely on private fiber with guaranteed bandwidth and reduced transfer latency.
- **Microsoft Ignite 2026 Infrastructure Releases**:
  Microsoft unveiled massive infrastructure milestones:
  - **Azure Cobalt 200 VMs**: Built on second-generation custom Arm-based silicon, delivering up to **50% higher CPU performance** over Cobalt 100 for scale-out cloud-native and agentic AI workloads.
  - **Azure HorizonDB**: A distributed, millisecond-latency database engine offering full PostgreSQL compatibility with native vector indexing and distributed ACID transactions.
  - **Azure Monitor Health Models (GA)**: Real-time dynamic dependency maps that provide architectural health modeling across microservices and cloud resources.
- **Kubernetes Hyperscaler Upgrade Deadlines**:
  Lifecycle cutoffs are tightening across managed Kubernetes providers:
  - **Amazon EKS**: Extended support for **Kubernetes 1.31** ends on **November 26, 2026** (triggering automatic cluster upgrades to 1.32), and extended support billing for **Kubernetes 1.34** begins on **December 2**.
  - **Azure AKS**: Community support for **Kubernetes 1.34** concludes this month.
  - **CNCF Graduation**: Following KubeCon Salt Lake City, both **KubeVirt** (virtual machines in Kubernetes) and **Kubeflow** (cloud-native machine learning) officially graduated from the Cloud Native Computing Foundation.

---

## 2. Linux & Server Management

- **"NoisyTCP" Remote Kernel Denial-of-Service (CVE-2026-99288)**:
  A severe remote race condition was uncovered in the Linux TCP receive path. Present in the kernel codebase since version 4.4, an unauthenticated remote attacker can crash the entire host (taking down every container and VM on the machine) by transmitting crafted TCP packets to any open listening port.
  - *Vendor Patches*: [AlmaLinux released patched testing kernels](https://almalinux.org/blog/2026-11-16-noisytcp-cve-2026-99288/) for versions 8, 9, and 10. [Oracle Linux 9 shipped updated UEK kernel packages](https://linuxsecurity.com/advisories/oracle/oracle9-elsa-2026-500643-kernel) (ELSA-2026-500643) on November 20.
  - *Emergency Temporary Mitigation*: If an immediate server reboot cannot be scheduled, administrators can temporarily close the primary crash path by disabling SYN cookies:
    ```bash
    sudo sysctl -w net.ipv4.tcp_syncookies=0
    ```
    *Note: Disabling SYN cookies removes protection against volumetric SYN flood attacks; prioritize applying the patched kernel package and rebooting.*
- **Critical Puppet Deserialization RCE in CISA KEV (CVE-2026-115731)**:
  The US Cybersecurity and Infrastructure Security Agency (CISA) added a critical remote code execution vulnerability in Perforce Puppet Enterprise to its [Known Exploited Vulnerabilities (KEV) Catalog](https://www.cisa.gov/news-events/alerts/2026/11/17/cisa-adds-one-known-exploited-vulnerability-catalog) on November 17. The flaw also impacts Puppet Core and OpenVox.
  - *Immediate Action*: Upgrade immediately to Puppet Enterprise `2026.0.1`, `2025.12.1`, or `2023.8.13` (or Puppet Core `9.1.3` / `8.22.2`). As an operational hardening step, disable Certificate Authority auto-signing and audit all recently issued certificates.

---

## 3. Career & Learning

- **Microsoft Retires Classic AZ-400 for Agentic DevOps (AZ-401)**:
  In a historic shift reflecting the AI era, Microsoft announced the retirement of the classic **AZ-400** (DevOps Engineer Expert) certification on **February 1, 2027**. It is being replaced by **AZ-401: Designing and Implementing Microsoft Agentic DevOps Solutions** (currently in beta, GA December 2026). The new path tests autonomous workflow orchestration, AI coding agent governance, and pipeline self-healing, paired with either AZ-104 (Azure Administrator) or GH-300 (GitHub Copilot).
- **Platform Engineering Becomes the Enterprise Standard**:
  The CNCF Q3 *State of Cloud Native Development* report revealed that **93% of backend developers** now operate within organizations with formal DevOps standardization or an Internal Developer Platform (IDP), surging from 77% last year. Core certifications like **CKA**, **CKS**, and the **CNPA** (Cloud Native Platform Engineering Associate) remain top hiring filters.

---

## 4. Tech News & Strategy

- **Hyperscaler Outage Scrutiny & The Cyber Investigation Board**:
  The Control Plane reliability tracker recorded **19 major cloud outages** across AWS, Azure, Google Cloud, and Cloudflare in 2026 through November 16. The high frequency of cross-region disruptions prompted US lawmakers this week to draft legislation proposing a federal **Cyber and AI Investigation Board** modeled after the NTSB to conduct root-cause analyses on commercial cloud failures.
- **Enterprise Agent Governance (Microsoft IQ & Agent 365)**:
  At [Microsoft Ignite 2026](https://azure.microsoft.com/en-us/blog/microsoft-ignite-2026-whats-new-in-azure-the-platform-purpose-built-for-ai/), Microsoft introduced **Microsoft IQ** for enterprise context fabric alongside **Agent 365** — providing a centralized IT control plane to track, audit, and revoke permissions for autonomous AI agents. The launch comes alongside survey telemetry showing that **92% of Indian technology enterprises** experienced AI agent security incidents this year, with only 36% capable of containment within 24 hours.

---

## 5. AI / Automation in DevOps

- **Agent-Led Modernization & Deployment on Azure**:
  Microsoft launched **Azure Catalyst**, an AI agent suite that analyzes legacy enterprise databases and application codebases to automate cloud refactoring. Microsoft also made **Azure Copilot's deployment agent** generally available, translating natural-language requirements directly into verified ARM/Bicep templates and provisioned infrastructure.
- **50% Cost Cut for Background AI Agents on GCP**:
  Google Cloud launched the [deferred service tier (GA)](https://cloud.google.com/blog/topics/inside-google-cloud/whats-new-google-cloud) for the Gemini Interactions API and Agent Development Kit (ADK). By routing latency-tolerant, multi-turn background agent loops through spare global compute capacity, GCP cuts token pricing by **50%** while providing native server-side queuing and guaranteed protection against `429 Too Many Requests` rate limits.

---

*Found this useful? Share with fellow infrastructure engineers, and join us next Sunday for the latest breakdown in cloud architecture, Linux internals, and systems reliability.*
