---
title: "Weekly DevOps & Cloud Intelligence Report – Week 4, February 2026"
subtitle: "DevOps weekly updates for Feb 23–Mar 1 2026: AWS EKS open-source agent, AKS Kubernetes 1.34 GA, RHEL kernel CVEs, Terraform Enterprise 1.2.0, and AI i"
tags: ["devops-weekly-updates","kubernetes-updates-2026","linux-security-updates","cloud-computing-news","cloud-computing","weekly-dev-journal"]
slug: "weekly-devops-cloud-intelligence-report-week-4-february-2026"
series: "OverflowByte Weekly"
canonical_url: "https://blog.overflowbyte.cloud/weekly-devops-cloud-intelligence-report-week-4-february-2026"
date: "1 Mar 2026"
cover: "https://cdn.hashnode.com/uploads/covers/6087f0a6aaea092e0faa6232/5ef699f6-96a9-43af-93fb-f41b2583defe.png"
source: "hashnode"
---

* * *

## Introduction

If you spent the last week heads-down in tickets and deployments, here is what you missed. The period from February 23 to March 1, 2026 was unusually dense with infrastructure-layer changes across all three major clouds, a meaningful IaC release, and a wave of Linux kernel and userland security patches that cannot be deferred indefinitely.

More importantly, the underlying direction is becoming clearer: AI agents are no longer confined to code assistants. They are being wired directly into cluster management, observability pipelines, and deployment systems. That shift is not purely theoretical anymore. This week gave us concrete product releases from AWS, Azure, and Google that make it real.

Whether you run Kubernetes workloads, manage RHEL servers, or are planning your next certification, there is something here that affects your work. Let us break it down.

* * *

## Cloud & DevOps Updates

## AWS: EKS Node Monitoring Agent Goes Open Source

AWS open-sourced the [Amazon EKS Node Monitoring Agent](https://aws.amazon.com/about-aws/whats-new/2026/02/amazon-eks-node-monitoring-agent-open-source/). This agent runs as a DaemonSet on every node in your cluster and is responsible for collecting node-level metrics and logs, which it ships into AWS observability backends like CloudWatch.\[[youtube](https://www.youtube.com/watch?v=m-wN4k_Cur8)\]​

This matters for a specific reason: until now, the agent was a black box. You could use it but not inspect, modify, or extend it. With the source available, teams running hybrid clusters or custom node configurations can fork the agent, add their own collectors, or simply audit what is being shipped out of their nodes.

A practical use case: if you run EKS with GPU nodes for ML workloads and want to add DCGM (NVIDIA's CUDA monitoring exporter) metrics alongside the default node telemetry, you can now build that directly into the agent rather than running a sidecar.\[[aws.amazon](http://aws.amazon)\]​

* * *

## AWS: Nested Virtualization, EKS Auto Mode Logging, and OpenSearch Cluster Insights

Three smaller but noteworthy AWS updates landed this week.

**Nested KVM/Hyper-V support on EC2** means you can now spin up virtual machines inside EC2 instances. This is immediately useful for CI environments where your pipeline needs to boot a full VM to test an installer, run Packer builds, or run Windows Subsystem for Linux in an isolated environment. The new high-frequency M8azn instances give you the compute headroom to make this practical.\[[youtube](https://www.youtube.com/watch?v=1l6vFSax6ac)\]​

**EKS Auto Mode now vends CloudWatch logs per capability.** If you use Auto Mode and want to understand what the control plane is actually doing with storage provisioning, load balancing, or compute scaling, those logs are now separated by capability rather than mixed into a single stream. That is a significant debugging improvement.\[[youtube](https://www.youtube.com/watch?v=m-wN4k_Cur8)\]​

**OpenSearch cluster insights** adds automated detection of hot shards and index imbalances. If you run OpenSearch for log aggregation and have seen unexplained query latency, this feature surfaces the root cause rather than leaving you to guess from slow query logs.\[[aws.amazon](http://aws.amazon)\]​

* * *

## Azure: AKS Gets Kubernetes 1.34 GA, Node Auto-Provisioning, and an MCP Server

Azure Kubernetes Service reached general availability on Kubernetes 1.34. The practical upside: Gateway API, more granular scheduling primitives, and improved networking behavior are now production-safe on AKS without needing to pin to a preview channel.\[[youtube](https://www.youtube.com/watch?v=RXje4dA9e30)\]​

Node auto-provisioning is also now GA across more regions including government cloud. It supports LocalDNS, encryption at host, and disk encryption sets. This is essentially Karpenter-style node lifecycle management baked into AKS, which means your cluster can scale up, select the right node SKU, and apply security baselines without a human making those decisions per incident.\[[reddit](https://www.reddit.com/r/AZURE/comments/1r9zwst/azure_weekly_update_20th_february_2026/)\]​

The more forward-looking announcement is the **AKS MCP server**, released on GitHub alongside an agentic CLI cluster mode. This is worth understanding. The Model Context Protocol (MCP) is a standard that lets AI agents communicate with external systems in a structured way. Microsoft's AKS MCP server exposes cluster resources through this protocol, which means an AI agent can list deployments, scale workloads, or apply manifests as a first-class operation rather than by parsing `kubectl` output.\[[youtube](https://www.youtube.com/watch?v=RXje4dA9e30)\]​

Whether you adopt this immediately or not, this architectural pattern—AI agent as cluster operator—is where managed Kubernetes is heading.

* * *

## Google Cloud: Multi-Region Cloud Run and Gemini Cloud Assist

Google Cloud preview-launched **multi-region failover for Cloud Run**. Until now, if your Cloud Run service had a regional outage, you needed custom traffic management to reroute. The new feature handles failover and failback automatically. This is a meaningful reliability improvement for serverless workloads that were previously one regional incident away from complete unavailability.\[[youtube](https://www.youtube.com/watch?v=W7CnMCsHT8c)\]​

**Gemini Cloud Assist** is entering preview for Cloud SQL and AlloyDB, analyzing slow queries and performance anomalies directly from the console. Think of it as a DBA assistant that reads your query plans and tells you what is wrong before you file a ticket.\[[docs.cloud.google](http://docs.cloud.google)\]​

Google also added a **remote MCP server for Cloud Run**, which enables AI agents to deploy and manage Cloud Run services programmatically via the Model Context Protocol. Same pattern as AKS MCP, different execution environment.\[[youtube](https://www.youtube.com/watch?v=W7CnMCsHT8c)\]​

* * *

## Terraform: v1.14.6 Released, Enterprise 1.2.0 Brings Day-2 Actions

HashiCorp shipped **Terraform v1.14.6** on February 25, continuing the 1.14.x stabilization cycle. A 1.15.0 alpha is in testing with Windows ARM64 builds and variable deprecation metadata—a sign the next minor version is getting closer to feature freeze.\[[discuss.hashicorp](https://discuss.hashicorp.com/c/release-notifications/57)\]​

The more significant release is **Terraform Enterprise 1.2.0**, which ships two production-relevant features:

**Explorer GA**: a graph-style view across all workspaces and run history in your TFE instance. Before this, getting visibility into which workspace last ran, which failed, or which resources drifted required either the CLI or the API. Explorer brings that into the UI. Note that it requires a backfill run with updated agents before historical data appears.

**Day-2 Actions GA**: this lets you encode operational procedures—think patching, certificate rotation, or maintenance mode changes—as Terraform-managed workflows triggered by lifecycle hooks or directly via:\[[discuss.hashicorp](https://discuss.hashicorp.com/t/terraform-enterprise-1-2-0-is-available/77169)\]​

```plaintext
terraform apply -invoke=<action-name>
```

Paired with **OIDC dynamic credentials** (now supported in module test runs for AWS, Azure, GCP, and Vault), you can eliminate static secrets from your CI pipelines entirely. Instead of storing an `AWS_ACCESS_KEY_ID` in your CI environment, your runner assumes a role dynamically at runtime. This should be standard practice in any CI/CD pipeline touching cloud resources.\[[discuss.hashicorp](https://discuss.hashicorp.com/t/terraform-enterprise-1-2-0-is-available/77169)\]​

* * *

## Kubernetes Version Cadence Across Clouds

A quick alignment table for planning cluster upgrades:

| Cloud | GA Version | Notes |
| --- | --- | --- |
| EKS | Kubernetes 1.35 | Supported since late January 2026 |
| AKS | Kubernetes 1.34 | GA as of this week |
| GKE | Kubernetes 1.34 | Stable channel auto-upgrade begins March 10 |

If your clusters are running 1.31 or earlier on any of these platforms, extended support charges or deprecation warnings are either already active or imminent. Upgrade planning should be on your sprint board now.

* * *

## Linux & Server Management

## RHEL 10 Kernel Security Update: RHSA-2026:3124

Red Hat issued **RHSA-2026:3124** on February 23 for RHEL 10 Extended Update Support. Two CVEs require attention:\[[access.redhat](https://access.redhat.com/errata/RHSA-2026:3124)\]​

**CVE-2025-38730** is an io\_uring bug in network buffer handling. The io\_uring subsystem is heavily used for high-performance I/O in modern application stacks. A mishandled buffer here can cause data corruption or system instability—not a remote code execution, but serious enough in any production environment doing high-throughput I/O.

**CVE-2025-39760** is an out-of-bounds read during USB configuration parsing that can trigger a denial of service. On cloud VMs or containers this seems irrelevant, but on bare-metal servers where USB devices are present (even passively), this is an exploitable path to crash the host kernel.

Both require a reboot after patching. To check your current kernel version and whether the patch applies:

```plaintext
uname -r
rpm -q kernel
sudo dnf check-update kernel
```

If you are on AlmaLinux, Rocky Linux, or another RHEL rebuild, expect equivalent advisories within the week. Do not defer this past your next maintenance window.\[[access.redhat](https://access.redhat.com/errata/RHSA-2026:3124)\]​

* * *

## Multi-Distro Patch Wave: OpenSSL, ImageMagick, freerdp, libsoup

This week's CERN Linux update log is a useful proxy for what is hitting RHEL-family estates broadly. Active patches include:\[[linux.web.cern](http://linux.web.cern)\]​

*   **ImageMagick** (CVE-2025-62171, CVE-2026-23876): image processing vulnerabilities that matter anywhere you resize or convert user-uploaded images on the server side.
    
*   **OpenSSL** (CVE-2025-9230): affects any service using OpenSSL for TLS. That is most things.
    
*   **freerdp** (multiple CVEs): relevant if you have any RDP-based remote access or broker services.
    
*   **libsoup**: an HTTP client library used widely in GNOME-stack applications and some server-side tooling.
    

Cross-distro coverage (AlmaLinux, Debian, Fedora, Oracle Linux, RHEL, Rocky, Ubuntu, SUSE) was documented in the January security roundup and continues this month. The volume alone is the argument for automated patch pipelines. Running `apt upgrade` or `dnf update` manually once a month is no longer a defensible posture.\[[linuxcompatible](https://www.linuxcompatible.org/story/linux-security-roundup-for-week-2-2026/)\]​

A simple Ansible ad-hoc command to get your patch status across a fleet:

```plaintext
ansible all -m command -a "dnf check-update" --become
```

* * *

## Patch Tuesday Spillover into Linux Environments

February's Patch Tuesday covered 59 Microsoft vulnerabilities including six actively exploited zero-days, plus critical fixes for SAP and Intel TDX.\[[thehackernews](https://thehackernews.com/2026/02/over-60-software-vendors-issue-security.html)\]​

If you run Hyper-V hosts under Linux guests, or Intel TDX-based confidential compute environments, the Intel TDX patches have direct hypervisor-layer implications. Unpatched hypervisor code sitting under a patched Linux guest is not a safe state. Align your Windows/Intel firmware patching cycle with your Linux kernel cycle.

* * *

## Career & Learning Trends

## The Job Market: Platform Engineering and MLOps Are the Premium Tiers

According to a February 21 HackerX analysis, DevOps, SRE, and Platform Engineer roles remain among the fastest-filling positions in tech. The differentiator in 2026 is specialization: generalist DevOps profiles compete on a crowded field, but engineers who combine infrastructure with ML platform experience (GPU cluster management, model serving, MLflow, Ray, etc.) command the top of the salary range—$150k–$260k base in major US markets at mid-senior level.\[[hackerx](https://hackerx.org/devops-job-market-2026-trends-and-opportunities/)\]​

Perforce's **2026 State of DevOps Report** adds a structural data point: 70% of organizations say their DevOps maturity directly affects how successful their AI initiatives are. That is not a soft correlation. Organizations that cannot reliably deploy, monitor, and roll back software struggle to operationalize models. The foundational work matters more, not less, as AI tooling advances.\[[perforce](https://www.perforce.com/press-releases/state-of-devops-2026)\]​

* * *

## Certifications: What the Market is Actually Rewarding

KodeKloud's February 2026 certification guide reflects current hiring patterns:\[[kodekloud](https://kodekloud.com/blog/top-10-devops-certifications-courses-engineers-are-choosing/)\]​

*   **Cloud** (pick your primary platform): AWS DevOps Engineer Professional, AZ-400, or Google Professional Cloud DevOps Engineer.
    
*   **Kubernetes**: CKA remains the strongest signal, with CKS increasingly required for any platform role touching production.
    
*   **IaC**: HashiCorp Terraform Associate is table stakes for infrastructure roles.
    
*   **Security**: CKS and cloud-provider security specializations are growing in weight.
    

One practical note on the CKA: the Linux Foundation updated the exam in early 2025, and the new version runs on Kubernetes 1.34. If you are preparing using older study material, you will find roughly half the exam has shifted toward Gateway API, Helm, Kustomize, CRDs, and Operators—topics that older guides barely mention. Study accordingly, and do not rely on exam dumps from the pre-2025 [version.training](http://version.training).linuxfoundation+1

The community consensus on Reddit and engineering forums remains consistent: build real projects. Deploy a multi-tier application, break the cluster, fix it under time pressure, add monitoring, write the runbook. That experience is more durable than memorizing YAML.\[[reddit](https://www.reddit.com/r/devops/comments/1qvmdvq/best_devops_course_to_start_learning_is_devops/)\]​

* * *

## Strategic Tech Moves

## Microsoft Consolidates Security Tooling Around Defender

Microsoft extended the sunset date of the **legacy Azure Sentinel portal to March 31, 2027**, while continuing to push teams toward the unified Defender portal for SIEM and XDR operations. The delay is a concession to enterprise migration timelines, but the direction is firm: if your security operations still live primarily in the classic Sentinel interface, you have roughly one year before it goes away.\[[learn.microsoft](http://learn.microsoft)\]​

More broadly, Microsoft is weaving Copilot capacity into partner benefit packages alongside Defender, Entra, and Intune. For DevOps teams that also own security posture (a combination that is increasingly common in smaller engineering organizations), this matters because your cloud portal experience is being redesigned around AI assistance. Learning to use it effectively is becoming part of the job.

* * *

## The "Always-On Cloud" Assumption Is Cracking

A theme emerging from multiple analyst pieces this week: enterprises are starting to acknowledge that cloud availability guarantees are not the same as application availability. A January 2026 analysis found that critical and major incidents across major DevOps SaaS platforms—GitHub, Jira, Azure DevOps—jumped 69% year-over-year in 2025, with total degraded time more than doubling.\[[thehackernews](https://thehackernews.com/2026/01/high-costs-of-devops-saas-downtime.html)\]​

The architectural response is not to avoid cloud SaaS, but to design for its failure. That means self-hosted mirrors for critical repositories, independent backup strategies that do not rely solely on vendor exports, and multi-region deployment patterns that actually get tested. For platform engineers, this is not theoretical: design your internal developer platform to survive a GitHub outage without a 48-hour recovery period.

* * *

## AI & Automation in DevOps

## What Is Actually Shipping This Week

Let us separate what is available now from what is still vaporware.

**Available now:**

*   **AWS Bedrock AgentCore** supports server-side tool execution. This means an agent running inside AWS can call internal APIs and trigger workflows without routing through the user's client. For DevOps, this enables patterns like: "AI agent detects a degraded service, calls an internal runbook API to restart the affected component, and logs the action to an audit trail."\[[youtube](https://www.youtube.com/watch?v=m-wN4k_Cur8)\]​
    
*   **Azure AKS MCP server** is on GitHub. You can deploy it today. AI agents that understand MCP can now perform CRUD operations on AKS resources. The blast-radius question—how much autonomy you give those agents—is yours to configure through RBAC.\[[youtube](https://www.youtube.com/watch?v=RXje4dA9e30)\]​
    
*   **Google Cloud Run MCP server** lets LLM agents deploy and manage Cloud Run services. Paired with multi-region failover, you can build an agent that detects regional degradation and triggers a redeployment to a secondary region automatically.\[[youtube](https://www.youtube.com/watch?v=W7CnMCsHT8c)\]​
    
*   **Bedrock Converse API batch inference** is available. If you run LLM pipelines for log summarization, incident triage, or documentation generation, batch mode significantly reduces cost over synchronous inference.\[[youtube](https://www.youtube.com/watch?v=m-wN4k_Cur8)\]​
    

**Worth watching but not yet production-ready for most:**

*   **Gemini Cloud Assist for Cloud SQL/AlloyDB** is in preview. Useful for experimentation, not for automated production remediation yet.\[[docs.cloud.google](http://docs.cloud.google)\]​
    

* * *

## Observability as a Control Plane, Not a Dashboard

Dynatrace's 2026 Pulse of Agentic AI survey found that 50% of organizations already have agentic AI in production somewhere, with IT operations the strongest adoption area at 70%. IBM's 2026 observability analysis describes the trajectory as "Observability-as-Code," where you define what gets monitored and at what threshold in version-controlled configuration, and AI uses that telemetry as guardrails for autonomous decisions.dynatrace+1

The practical implication for your current stack: the quality of your observability instrumentation directly determines how trustworthy your AI automation can be. An agent that triggers a rollback based on a synthetic alert misconfiguration is worse than no agent at all. Getting your metrics, logs, and traces right is now upstream work for any AI-assisted ops initiative.

A concrete starting point: ensure all your services emit structured logs with consistent field names (service, environment, trace\_id, error\_code), and that your alert thresholds are reviewed and documented. That is the foundation before any AI layer is worth configuring.

* * *

## Key Takeaways

*   **Patch your RHEL 10 kernel this maintenance window.** CVE-2025-38730 (io\_uring) and CVE-2025-39760 (USB OOB read) both require a reboot and should not be deferred. Downstream rebuilds (AlmaLinux, Rocky) will have equivalent patches shortly.
    
*   **Enable OIDC dynamic credentials in your CI pipelines.** Terraform Enterprise 1.2.0 makes this straightforward for AWS, Azure, GCP, and Vault. Static cloud credentials in CI environments are a liability that has no technical justification in 2026.
    
*   **Plan Kubernetes upgrade windows now.** EKS is at 1.35, AKS at 1.34, GKE Stable channel moves to 1.34 on March 10. Clusters two or more minor versions behind are either in extended support or approaching end-of-life.
    
*   **If you are studying for CKA, use updated material.** The exam now runs on Kubernetes 1.34 with new coverage of Gateway API, Helm, Kustomize, CRDs, and Operators. Pre-2025 guides will leave you underprepared for roughly half the exam.
    
*   **The MCP pattern (AKS, Cloud Run) is the AI-DevOps integration to understand this year.** It is a structured protocol for AI agents to interact with infrastructure. Learn how it works architecturally before you need to make a production decision about it.
    
*   **Design your toolchain to survive SaaS outages.** GitHub, Jira, and Azure DevOps had 69% more critical incidents in 2025 than in 2024. Self-hosted mirrors and independent backup strategies are worth the investment.
    
*   **Observability quality gates your AI automation.** Before adding AI agents to your ops stack, audit the quality and structure of your existing telemetry. Garbage-in still means garbage-out at any level of model sophistication.
    

* * *

## Conclusion

This week is a good illustration of why keeping up with infrastructure-layer changes matters even when your sprint is full. A kernel CVE does not wait for your planning cycle. An AKS GA feature might change how you scope your next platform migration. A Terraform Enterprise release might eliminate a security practice you have been meaning to fix for months.

The bigger pattern running through all of this is that the toolchain is becoming more autonomous. AI agents managing clusters, responding to incidents, and deploying services is no longer a research topic—it is landing in production releases from the three largest cloud providers simultaneously. The engineers who will use this well are not the ones who adopt it fastest. They are the ones who have solid foundations: clean telemetry, tested runbooks, hardened RBAC, and a genuine understanding of what the automation is doing and why.

Stay rigorous. Stay curious. The pace of change is not slowing down, and the best defense against being overwhelmed by it is building systems you actually understand.
