# OverflowByte Publishing Roadmap & Platform Architecture

This document defines the content strategy, distribution rules, upcoming editorial calendar, and task tracker for **OverflowByte** across our unified web ecosystem.

---

## 🏛️ Platform Architecture: The 3-Pillar Ecosystem

```
                              ┌────────────────────────────────────────┐
                              │          overflowbyte.cloud            │
                              │       Main Platform (Vercel)           │
                              │  Interactive Tools, Visual Lab, Portal │
                              └───────────────────┬────────────────────┘
                                                  │
                 ┌────────────────────────────────┴───────────────────────────────┐
                 │                                                                │
                 ▼                                                                ▼
┌─────────────────────────────────┐                             ┌─────────────────────────────────┐
│     blog.overflowbyte.cloud     │                             │   learning.overflowbyte.cloud   │
│        Hashnode Blog            │                             │          Quartz Vault           │
│  Flagship Stories, Newsletters  │                             │  40+ Lab Steps, Cheat Sheets,   │
│  Embeds Visuals from Main Site  │                             │  Exam Guides & Command Lookup   │
└────────────────┬────────────────┘                             └─────────────────────────────────┘
                 │
                 │ (Cross-posts with canonical URL)
                 ▼
┌─────────────────────────────────┐
│    overflowbyte.medium.com      │
│        Medium Syndication       │
│   Links back to primary blog    │
└─────────────────────────────────┘
```

| Site | Platform | Role & Content Rule | Examples |
| :--- | :--- | :--- | :--- |
| **Main Platform** | **Vercel** (`overflowbyte.cloud`) | **Interactive visual lab, simulators, tools hub, and brand home.** All custom Web / JS / canvas tools are hosted here with zero sanitization limits. | `/visuals/linux-permissions`, `/tools/...`, platform portal |
| **Blog** | **Hashnode** (`blog.overflowbyte.cloud`) | **Flagship stories, visual deep-dives, architectural explainers, and newsletter.** Embeds interactive tools from `overflowbyte.cloud`. | Linux Permissions, PHP2Shell, NACL vs SG, Incident Drills |
| **Learning** | **Quartz** (`learning.overflowbyte.cloud`) | **Look-up & reference material.** (Labs, cheat sheets, exam curriculum, command references, raw notes). | RHCSA/RHCE lab steps, cPanel log locations, mock exams |
| **Medium** | **Medium** (`overflowbyte.medium.com`) | **Syndication & reach.** (Cross-posted from Hashnode with `canonicalUrl` pointing to `blog.overflowbyte.cloud`). | Cross-posted flagships #1–10 |

### The "Quick Test" Rule
> **Interactive tools & simulators → Host on `overflowbyte.cloud`**  
> **LinkedIn carousel & narrative story → Publish on `blog.overflowbyte.cloud`**  
> **Bookmarkable command reference or lab step → Keep on `learning.overflowbyte.cloud`**

---

## 🗓️ 10-Flagship Editorial Calendar (Every Other Sunday)

| # | Target Date | Title | Interactive Tool (`overflowbyte.cloud`) | Blog Story (`blog.overflowbyte.cloud`) | Status |
| :- | :--- | :--- | :--- | :--- | :--- |
| **1** | **1 Nov 2026** | **How Linux Decides Who Can Open a File** | `/visuals/linux-permissions` (8 interactive sections) | `posts/01-how-linux-decides-who-can-open-a-file.md` | 🟢 Built & Ready |
| **2** | **15 Nov 2026** | **Your Code Is Clean. Attackers Still Got a Shell.** | `/visuals/php2shell` (Request-to-shell trace) | PHP2Shell & Node2Shell | ⚪ Scheduled |
| **3** | **29 Nov 2026** | **Port 443 Is Open in the Security Group. Why Does It Still Time Out?** | `/visuals/nacl-vs-sg` (Packet path simulator) | NACL vs Security Groups on AWS | ⚪ Scheduled |
| **4** | **13 Dec 2026** | **I Broke Two Servers on Purpose and Gave Myself an Hour to Fix Them** | `/visuals/incident-drills` (Incident timeline player) | Incident Drills Breakdown | ⚪ Scheduled |
| **5** | **27 Dec 2026** | **A RHEL Lab You Can Wreck and Reset in Seconds** | `/visuals/kvm-lab` (QCOW2 Overlay tree visualizer) | Building a 3-Node RHEL Lab on KVM | ⚪ Scheduled |
| **6** | **10 Jan 2027** | **My 60-Day Plan from RHCSA to RHCE** | `/visuals/rhce-roadmap` (Interactive milestone tracker) | RHCSA to RHCE 60-Day Curriculum | ⚪ Scheduled |
| **7** | **24 Jan 2027** | **Every RHCSA Task, Translated to Ansible** | `/visuals/ansible-map` (Searchable command-to-module map) | Manual to Ansible: A Module Map | ⚪ Scheduled |
| **8** | **7 Feb 2027** | **The No-SSH Rule: Automating a Whole Exam Set with Ansible** | `/visuals/exam-automation` (Automation test loop) | Automating the RHCSA Set with Ansible | ⚪ Scheduled |
| **9** | **21 Feb 2027** | **Ansible Variable Precedence, Drawn** | `/visuals/ansible-precedence` (22-level precedence ladder) | Ansible Fundamentals Labs | ⚪ Scheduled |
| **10** | **7 Mar 2027** | **Ansible Vault with Two Vault IDs, Without Typing a Password** | `/visuals/ansible-vault` (Dual-vault auth flow) | Advanced Ansible Labs | ⚪ Scheduled |

---

## 🚀 How to Deploy `overflowbyte.cloud` to Vercel

1. Link this directory to Vercel:
   ```bash
   npx vercel
   ```
2. Set your production domain in the Vercel dashboard:
   - Add `overflowbyte.cloud` and `www.overflowbyte.cloud`.
3. Done! 
   - `https://overflowbyte.cloud` serves the central portal.
   - `https://overflowbyte.cloud/visuals/linux-permissions` serves the interactive explainer.
   - Because `vercel.json` includes `Content-Security-Policy: frame-ancestors`, your Hashnode blog and Quartz site can cleanly iframe it!
