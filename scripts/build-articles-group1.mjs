import fs from 'node:fs';
import path from 'node:path';
import { renderHtmlPage, STATIC_DIR, POSTS_DIR } from './animated-page-base.mjs';

// Helper to inject banner into Markdown
export function injectBannerIntoMarkdown(mdFilename, staticSlug, badgeText, colorHex = '#6366F1') {
  const filePath = path.join(POSTS_DIR, mdFilename);
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf-8');

  // Check if banner already exists
  if (content.includes(`href="/static/${staticSlug}.html"`)) {
    return;
  }

  // Find the end of frontmatter (handling both LF and CRLF)
  const fmMatch = content.match(/^---[\s\S]*?---\r?\n/);
  if (!fmMatch) {
    console.error(`Could not match frontmatter in ${mdFilename}`);
    return;
  }

  const fmEnd = fmMatch[0].length;
  const beforeFm = content.slice(0, fmEnd);
  const afterFm = content.slice(fmEnd);

  const banner = `
<div class="overflowbyte-threat-banner" style="position: relative; margin: 1.5rem 0; padding: 1.25rem 1.5rem; border-radius: 12px; background: linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(15, 23, 42, 0.6) 100%); border: 1px solid rgba(99, 102, 241, 0.35); box-shadow: 0 0 30px rgba(99, 102, 241, 0.15);">
  <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.75rem;">
    <div style="display: flex; align-items: center; gap: 0.75rem;">
      <span style="position: relative; display: flex; height: 12px; width: 12px;">
        <span style="animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite; position: absolute; display: inline-flex; height: 100%; width: 100%; border-radius: 9999px; background-color: ${colorHex}; opacity: 0.75;"></span>
        <span style="position: relative; display: inline-flex; border-radius: 9999px; height: 12px; width: 12px; background-color: ${colorHex};"></span>
      </span>
      <span style="font-family: 'JetBrains Mono', monospace; font-size: 0.85rem; font-weight: 700; color: #a5b4fc; letter-spacing: 0.08em; text-transform: uppercase;">
        ${badgeText}
      </span>
    </div>
    <a href="/static/${staticSlug}.html" target="_blank" rel="noopener noreferrer" style="display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.4rem 0.9rem; font-size: 0.82rem; font-weight: 600; color: #5ce1ff; background: rgba(92, 225, 255, 0.12); border: 1px solid rgba(92, 225, 255, 0.3); border-radius: 6px; text-decoration: none;">
      <span>Open Fullscreen Experience ↗</span>
    </a>
  </div>
</div>
`;

  fs.writeFileSync(filePath, beforeFm + banner + afterFm, 'utf-8');
  console.log(`Updated banner in ${mdFilename}`);
}

// ════════════════════════════════════════════════════════════════
// ARTICLE 01: HOW LINUX DECIDES WHO CAN OPEN A FILE
// ════════════════════════════════════════════════════════════════
export function generateArticle01() {
  const slug = 'how-linux-decides-who-can-open-a-file';
  const mdFile = '01-how-linux-decides-who-can-open-a-file.md';

  const sectionsHtml = `
  <!-- SECTION 1: TL;DR -->
  <section class="section" id="tldr">
    <div class="section-label">01 — TL;DR & THE CORE PUZZLE</div>
    <h2>Four UIDs, one file, and why shells ignore /etc/group</h2>
    <p>
      You add a developer to a group: <code>sudo usermod -aG developers alice</code>. Alice enters the folder or opens the file.
      <strong>Permission denied.</strong> Why does an interactive shell fail to acknowledge newly assigned groups?
    </p>
    <p>
      Running processes <strong>never re-read disk files</strong> like <code>/etc/group</code>. PAM reads the files once at login,
      and the Linux kernel creates an in-memory <code>struct cred</code> assigned to the shell's <code>task_struct</code>.
      Modifying <code>/etc/group</code> alters bytes on disk, but the process continues referencing its unchanged in-memory struct.
    </p>

    <div class="cve-grid">
      <div class="cve-card">
        <div class="cve-id">VFS LEVEL</div>
        <div class="cve-name">fsuid vs euid</div>
        <div class="cve-desc">
          File checks do NOT test <code>euid</code>. Linux evaluates <code>fsuid</code> (Filesystem UID), designed so NFS daemons can verify file access on behalf of clients without granting signal (kill) privileges.
        </div>
        <span class="cve-tag rce">DAC ORDER</span>
      </div>

      <div class="cve-card">
        <div class="cve-id">SYSCALL CASCADES</div>
        <div class="cve-name">newgrp 6-Step Loop</div>
        <div class="cve-desc">
          <code>newgrp</code> is a setuid-root binary that forks, calls <code>setgroups()</code>, <code>setgid()</code> (setting ALL 4 GIDs), <code>setuid()</code>, and replaces the shell via <code>execve()</code>.
        </div>
        <span class="cve-tag disclosure">PROCESS TREE</span>
      </div>

      <div class="cve-card">
        <div class="cve-id">INODE ARCHITECTURE</div>
        <div class="cve-name">16-Bit i_mode Grid</div>
        <div class="cve-desc">
          Permissions are packed into 16 bits: 4 bits file type, 3 special bits (SUID, SGID, sticky), and 9 bits user/group/other rwx.
        </div>
        <span class="cve-tag rce">OCTAL MASKS</span>
      </div>

      <div class="cve-card">
        <div class="cve-id">CAPABILITIES</div>
        <div class="cve-name">Root Override Evaluated Last</div>
        <div class="cve-desc">
          The kernel evaluates mode bits first. Only if access is denied does <code>generic_permission()</code> consult <code>CAP_DAC_OVERRIDE</code>.
        </div>
        <span class="cve-tag disclosure">SECURITY</span>
      </div>
    </div>
  </section>

  <div class="divider"></div>

  <!-- SECTION 2: ATTACK & PROCESS FLOW -->
  <section class="section" id="process-flow">
    <div class="section-label">02 — THE CREDENTIAL PIPELINE</div>
    <h2>From login down to VFS Inode checks</h2>
    <p>
      Trace the exact lifecycle of user credentials as they flow from configuration files on physical disk through kernel memory structures:
    </p>

    <div class="diagram-wrap">
      <div class="diagram-title">⚡ CREDENTIAL LIFECYCLE PIPELINE</div>
      <div class="packet-scene">
        <div class="node-box node-attacker">
          🗄️ DISK
          <div class="node-label">/etc/passwd & group</div>
        </div>
        <div class="packet-track">
          <div class="packet-dot malicious"></div>
        </div>
        <div class="node-box node-server">
          🧠 KERNEL RAM
          <div class="node-label">struct cred allocated</div>
        </div>
        <div class="packet-track">
          <div class="packet-dot malicious"></div>
        </div>
        <div class="node-box node-runtime">
          ⚡ VFS INODE
          <div class="node-label">generic_permission()</div>
        </div>
      </div>
    </div>

    <div class="attack-flow">
      <div class="flow-step" data-danger="false">
        <div class="flow-pipe">
          <div class="flow-dot"></div>
          <div class="flow-line"></div>
        </div>
        <div class="flow-content">
          <div class="flow-title">1. Authentication & PAM Initialization</div>
          <div class="flow-desc">
            Upon login or SSH session establishment, PAM parses <code>/etc/passwd</code> and <code>/etc/group</code> to assemble primary and supplementary IDs.
          </div>
        </div>
      </div>

      <div class="flow-step" data-danger="false">
        <div class="flow-pipe">
          <div class="flow-dot"></div>
          <div class="flow-line"></div>
        </div>
        <div class="flow-content">
          <div class="flow-title">2. struct cred Allocation</div>
          <div class="flow-desc">
            The kernel allocates a reference-counted <code>struct cred</code> in kernel memory containing <code>uid</code>, <code>gid</code>, <code>suid</code>, <code>sgid</code>, <code>euid</code>, <code>egid</code>, <code>fsuid</code>, <code>fsgid</code>, and a pointer to <code>group_info</code>.
          </div>
        </div>
      </div>

      <div class="flow-step" data-danger="true">
        <div class="flow-pipe">
          <div class="flow-dot"></div>
          <div class="flow-line"></div>
        </div>
        <div class="flow-content">
          <div class="flow-title">3. The Stale Group Trap (Decoupling)</div>
          <div class="flow-desc">
            The running bash process (PID 1042) points to this struct. When a sysadmin runs <code>usermod -aG</code>, disk blocks change, but PID 1042's in-memory pointer remains untouched.
          </div>
        </div>
      </div>

      <div class="flow-step" data-danger="false">
        <div class="flow-pipe">
          <div class="flow-dot"></div>
          <div class="flow-line"></div>
        </div>
        <div class="flow-content">
          <div class="flow-title">4. Path Lookup & Dentry Cache Resolution</div>
          <div class="flow-desc">
            Calling <code>open("/file", O_RDWR)</code> resolves via dentry cache into an in-memory <code>struct inode</code> carrying <code>i_uid</code>, <code>i_gid</code>, and the 16-bit <code>i_mode</code> integer.
          </div>
        </div>
      </div>

      <div class="flow-step" data-danger="false">
        <div class="flow-pipe">
          <div class="flow-dot"></div>
          <div class="flow-line" style="opacity:0;"></div>
        </div>
        <div class="flow-content">
          <div class="flow-title">5. generic_permission() Evaluation</div>
          <div class="flow-desc">
            The kernel compares <code>cred->fsuid</code> against <code>inode->i_uid</code>. If matched, owner bits apply. Otherwise group bits, then other bits. Root capability checks occur strictly as a fallback.
          </div>
        </div>
      </div>
    </div>
  </section>

  <div class="divider"></div>

  <!-- SECTION 3: CREDENTIAL COMPARISON TABLE -->
  <section class="section" id="credentials-matrix">
    <div class="section-label">03 — CREDENTIAL ARCHITECTURE</div>
    <h2>The 4 UIDs and GIDs Explained</h2>
    <p>
      Every process has four distinct user IDs and group IDs. Understanding their separate roles clarifies why Linux security behaves the way it does:
    </p>

    <table class="exposure-table">
      <thead>
        <tr>
          <th>Credential</th>
          <th>Primary Role</th>
          <th>Kernel Evaluation Purpose</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Real ID (uid / gid)</strong></td>
          <td>Process Ownership</td>
          <td>Identifies who invoked the process. Governs signal delivery (kill).</td>
          <td><span class="status-ok">OWNERSHIP</span></td>
        </tr>
        <tr>
          <td><strong>Effective ID (euid / egid)</strong></td>
          <td>General Authorization</td>
          <td>Determines capabilities, POSIX IPC message queues, and shared memory creation.</td>
          <td><span class="status-ok">PRIVILEGE</span></td>
        </tr>
        <tr>
          <td><strong>Saved ID (suid / sgid)</strong></td>
          <td>State Preservation</td>
          <td>Enables setuid binaries to drop privileges and safely regain them later.</td>
          <td><span class="status-ok">TRANSITION</span></td>
        </tr>
        <tr>
          <td><strong>Filesystem ID (fsuid / fsgid)</strong></td>
          <td>File Access Checks</td>
          <td>The actual IDs checked by the VFS layer in generic_permission().</td>
          <td><span class="status-vuln">VFS CRUCIAL</span></td>
        </tr>
      </tbody>
    </table>

    <div class="callout info">
      <div class="callout-title">💡 Why Does fsuid Exist?</div>
      <p>
        Linux created <code>fsuid</code> so user-space NFS servers could impersonate unprivileged users during file operations without changing <code>euid</code>, preventing clients from sending signals like <code>SIGTERM</code> to the NFS daemon.
      </p>
    </div>
  </section>

  <div class="divider"></div>

  <!-- SECTION 4: ANIMATED TERMINAL -->
  <section class="section" id="terminal-demo">
    <div class="section-label">04 — LIVE KERNEL INSPECTION</div>
    <h2>Inspect process credentials and SGID inheritance</h2>
    <p>
      Live verification commands showing process credentials in <code>/proc</code> and testing directory SGID inheritance:
    </p>

    <div class="terminal">
      <div class="terminal-bar">
        <div class="terminal-dot r"></div>
        <div class="terminal-dot y"></div>
        <div class="terminal-dot g"></div>
        <span class="terminal-title">bash — credential inspection & newgrp</span>
      </div>
      <div class="terminal-body">
        <div class="term-line" data-delay="0"><span class="prompt">$</span> <span class="cmd">grep -E 'Uid|Gid|Groups' /proc/$$/status</span></div>
        <div class="term-line" data-delay="400"><span class="output">Uid:    1000    1000    1000    1000</span></div>
        <div class="term-line" data-delay="700"><span class="output">Gid:    1000    1000    1000    1000</span></div>
        <div class="term-line" data-delay="1000"><span class="output">Groups: 1000 27 998</span></div>
        <div class="term-line" data-delay="1400"><span class="prompt">$</span> <span class="cmd">stat -c 'Inode: %i | Mode: %a (%A) | Owner: %U(%u):%G(%g)' /etc/passwd</span></div>
        <div class="term-line" data-delay="1800"><span class="ok">Inode: 131073 | Mode: 644 (-rw-r--r--) | Owner: root(0):root(0)</span></div>
        <div class="term-line" data-delay="2200"><span class="prompt">$</span> <span class="cmd">newgrp developers</span> <span class="warn"># fork -> execve(newgrp) -> setgid -> execve(bash)</span></div>
        <div class="term-line" data-delay="2600"><span class="prompt">$</span> <span class="cmd">grep -E 'Gid|Groups' /proc/$$/status</span></div>
        <div class="term-line" data-delay="3000"><span class="ok">Gid:    5000    5000    5000    5000</span></div>
        <div class="term-line" data-delay="3300"><span class="ok">Groups: 1000 27 998 5000</span></div>
      </div>
    </div>
  </section>

  <div class="divider"></div>

  <!-- SECTION 5: ACTIONABLE REMEDIATION -->
  <section class="section" id="takeaways">
    <div class="section-label">05 — PRODUCTION BEST PRACTICES</div>
    <h2>Hardening shared directories and group workflows</h2>

    <div class="priority-list">
      <div class="priority-item">
        <div class="priority-title">Set SGID (2770) on Collaboration Folders</div>
        <div class="priority-desc">
          Ensure shared project directories inherit group ownership automatically: <code>chmod 2770 /opt/shared</code> and <code>chown root:devs /opt/shared</code>.
        </div>
      </div>

      <div class="priority-item">
        <div class="priority-title">Use newgrp or Re-login for Stale Shells</div>
        <div class="priority-desc">
          Do not debug permissions on open shells after <code>usermod -aG</code>. Have developers run <code>exec su - $USER</code> or <code>newgrp groupname</code>.
        </div>
      </div>

      <div class="priority-item">
        <div class="priority-title">Inspect Inodes Directly with stat</div>
        <div class="priority-desc">
          Avoid guessing octal permissions: use <code>stat -c '%a %A' filename</code> to read raw octal and symbolic representation directly from the inode.
        </div>
      </div>
    </div>
  </section>
  `;

  const sourcesHtml = `
    <li>Linux Kernel Source: <a href="https://github.com/torvalds/linux/blob/master/fs/namei.c" target="_blank" rel="noopener">fs/namei.c (generic_permission)</a></li>
    <li>Linux Kernel Credential Management: <a href="https://www.kernel.org/doc/html/latest/security/credentials.html" target="_blank" rel="noopener">Kernel.org Credentials Documentation</a></li>
    <li>VFS Inode Metadata: <a href="https://man7.org/linux/man-pages/man7/inode.7.html" target="_blank" rel="noopener">inode(7) — Linux Manual Page</a></li>
    <li>Interactive Learning Labs: <a href="/learn#linux-permissions" target="_blank" rel="noopener">OverflowByte Linux Permissions Lab & Decks</a></li>
  `;

  const html = renderHtmlPage({
    metaTitle: "How Linux Decides Who Can Open a File (A Visual Deep Dive)",
    metaDesc: "Kernel credentials, newgrp internals, in-memory Inodes, and the exact order of Discretionary Access Control.",
    metaKeywords: "linux, kernel, struct cred, task_struct, fsuid, generic_permission, newgrp, DAC, chmod, permissions",
    badgeText: "DEEP DIVE — LINUX KERNEL DAC",
    badgeColor: "indigo",
    titleHtml: '<span class="accent-php">Linux</span> File Permissions: <span class="accent-node">The Kernel</span> <span class="accent-shell">Decision Engine</span>',
    subtitle: "Kernel credentials, newgrp internals, in-memory Inodes, and the exact order of Discretionary Access Control.",
    date: "November 2026",
    sectionsHtml,
    sourcesHtml
  });

  fs.writeFileSync(path.join(STATIC_DIR, `${slug}.html`), html, 'utf-8');
  console.log(`Generated public/static/${slug}.html`);
  injectBannerIntoMarkdown(mdFile, slug, "INTERACTIVE VISUAL DEEP DIVE · KERNEL CREDENTIALS & DAC CASCADE", "#6366F1");
}

// ════════════════════════════════════════════════════════════════
// ARTICLE 03: PORT 443 IS OPEN IN SECURITY GROUP. WHY TIMEOUT?
// ════════════════════════════════════════════════════════════════
export function generateArticle03() {
  const slug = 'port-443-is-open-in-security-group-why-timeout';
  const mdFile = '03-port-443-is-open-in-security-group-why-timeout.md';

  const sectionsHtml = `
  <!-- SECTION 1: TL;DR -->
  <section class="section" id="tldr">
    <div class="section-label">01 — TL;DR & THE MYSTERY</div>
    <h2>Port 443 is open, EC2 is healthy. Why does it hang?</h2>
    <p>
      The security group allows port 443. The target group reports healthy. The web server process is listening.
      Yet browser requests spin endlessly until timing out.
    </p>
    <p>
      The culprit is almost always the VPC's <strong>Network Access Control List (NACL)</strong>.
      Security Groups are <strong>stateful</strong> firewalls at the ENI; NACLs are <strong>stateless</strong> firewalls at the subnet boundary.
      When the client connects to port 443 from a random ephemeral port (e.g. 51432), the server's reply is addressed <strong>to port 51432</strong>.
      If your NACL outbound rules do not explicitly permit ephemeral return traffic, the response is dropped silently.
    </p>

    <div class="cve-grid">
      <div class="cve-card">
        <div class="cve-id">VPC FIREWALL #1</div>
        <div class="cve-name">Security Group (SG)</div>
        <div class="cve-desc">
          Stateful. Operates at the ENI level. Tracks connections automatically — return traffic is granted without any outbound rule. Allow-only rules.
        </div>
        <span class="cve-tag rce">STATEFUL</span>
      </div>

      <div class="cve-card">
        <div class="cve-id">VPC FIREWALL #2</div>
        <div class="cve-name">Network ACL (NACL)</div>
        <div class="cve-desc">
          Stateless. Operates at the subnet boundary. Has zero memory: checks return packets as brand-new traffic. Supports explicit Allow and Deny rules.
        </div>
        <span class="cve-tag disclosure">STATELESS</span>
      </div>

      <div class="cve-card">
        <div class="cve-id">THE TRAP</div>
        <div class="cve-name">Ephemeral Port Range</div>
        <div class="cve-desc">
          Client requests originate from ephemeral ports (1024–65535). Server replies travel back TO those ephemeral ports. NACL outbound must allow them.
        </div>
        <span class="cve-tag rce">EPHEMERAL RANGE</span>
      </div>

      <div class="cve-card">
        <div class="cve-id">RULE EVALUATION</div>
        <div class="cve-name">First Match Wins</div>
        <div class="cve-desc">
          NACL rules are numbered. Lowest number wins immediately. If rule 100 allows all and rule 200 denies a bad IP, the deny never fires!
        </div>
        <span class="cve-tag disclosure">RULE ORDER</span>
      </div>
    </div>
  </section>

  <div class="divider"></div>

  <!-- SECTION 2: PACKET FLOW -->
  <section class="section" id="packet-path">
    <div class="section-label">02 — PACKET PATH ARCHITECTURE</div>
    <h2>Two firewalls, one bidirectional TCP flow</h2>

    <div class="diagram-wrap">
      <div class="diagram-title">⚡ AWS VPC PACKET INGRESS & EGRESS</div>
      <div class="packet-scene">
        <div class="node-box node-attacker">
          🌐 CLIENT
          <div class="node-label">Src: 51432 | Dst: 443</div>
        </div>
        <div class="packet-track">
          <div class="packet-dot malicious"></div>
        </div>
        <div class="node-box node-server">
          🛡️ NACL (Subnet)
          <div class="node-label">Rule 100 Allow Inbound</div>
        </div>
        <div class="packet-track">
          <div class="packet-dot malicious"></div>
        </div>
        <div class="node-box node-runtime">
          💻 EC2 / SG (ENI)
          <div class="node-label">SG Stateful Track</div>
        </div>
      </div>
      <div style="text-align: center; margin-top: 18px;">
        <div class="packet-track" style="display: inline-block; width: 60%; margin-top: 16px;">
          <div class="packet-dot leak"></div>
        </div>
        <div style="font-family: var(--font-mono); font-size: 12px; color: var(--orange); margin-top: 8px;">
          ← Return packet: Src: 443 | Dst: 51432 (NACL must permit outbound 1024-65535!)
        </div>
      </div>
    </div>

    <div class="attack-flow">
      <div class="flow-step" data-danger="false">
        <div class="flow-pipe">
          <div class="flow-dot"></div>
          <div class="flow-line"></div>
        </div>
        <div class="flow-content">
          <div class="flow-title">1. Client SYN Packet Enters IGW</div>
          <div class="flow-desc">
            Browser initiates TCP handshake to <code>203.0.113.10:443</code> from ephemeral port <code>51432</code>. Internet Gateway forwards packet through VPC Route Table.
          </div>
        </div>
      </div>

      <div class="flow-step" data-danger="false">
        <div class="flow-pipe">
          <div class="flow-dot"></div>
          <div class="flow-line"></div>
        </div>
        <div class="flow-content">
          <div class="flow-title">2. Inbound NACL Evaluation</div>
          <div class="flow-desc">
            Subnet NACL evaluates inbound rules in numeric order. Rule 100 permits TCP 443 from <code>0.0.0.0/0</code>. Packet admitted.
          </div>
        </div>
      </div>

      <div class="flow-step" data-danger="false">
        <div class="flow-pipe">
          <div class="flow-dot"></div>
          <div class="flow-line"></div>
        </div>
        <div class="flow-content">
          <div class="flow-title">3. Inbound Security Group Check</div>
          <div class="flow-desc">
            ENI Security Group inspects packet. Port 443 rule matches. Connection tracker establishes state entry: <code>(Client:51432 -> Server:443)</code>.
          </div>
        </div>
      </div>

      <div class="flow-step" data-danger="false">
        <div class="flow-pipe">
          <div class="flow-dot"></div>
          <div class="flow-line"></div>
        </div>
        <div class="flow-content">
          <div class="flow-title">4. Server SYN-ACK Egresses ENI</div>
          <div class="flow-desc">
            Web service sends SYN-ACK. Security Group checks connection tracking table: matches existing state, immediately allowed out without consulting outbound SG rules!
          </div>
        </div>
      </div>

      <div class="flow-step" data-danger="true">
        <div class="flow-pipe">
          <div class="flow-dot"></div>
          <div class="flow-line" style="opacity:0;"></div>
        </div>
        <div class="flow-content">
          <div class="flow-title">5. Outbound NACL Drops Return Packet!</div>
          <div class="flow-desc">
            NACL is stateless. It sees an outbound packet destined for port 51432. If only port 443 is allowed outbound, packet hits default Deny (*) and vanishes! Client hangs and times out.
          </div>
        </div>
      </div>
    </div>
  </section>

  <div class="divider"></div>

  <!-- SECTION 3: COMPARISON TABLE -->
  <section class="section" id="comparison">
    <div class="section-label">03 — SIDE-BY-SIDE MATRIX</div>
    <h2>Security Group vs Network ACL</h2>

    <table class="exposure-table">
      <thead>
        <tr>
          <th>Attribute</th>
          <th>Security Group</th>
          <th>Network ACL</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Layer of Operation</strong></td>
          <td>Instance / Elastic Network Interface (ENI)</td>
          <td>Subnet boundary</td>
        </tr>
        <tr>
          <td><strong>State Tracking</strong></td>
          <td><span class="status-ok">Stateful</span> (return traffic automatically allowed)</td>
          <td><span class="status-vuln">Stateless</span> (both directions require explicit rules)</td>
        </tr>
        <tr>
          <td><strong>Rule Actions</strong></td>
          <td>Allow only</td>
          <td>Allow AND Deny</td>
        </tr>
        <tr>
          <td><strong>Evaluation Order</strong></td>
          <td>All rules evaluated together</td>
          <td>Numbered, lowest number first (first match wins)</td>
        </tr>
        <tr>
          <td><strong>Cross-Referencing</strong></td>
          <td>Can reference other Security Groups & Prefix Lists</td>
          <td>CIDR IP blocks only</td>
        </tr>
        <tr>
          <td><strong>Default Behavior (Custom)</strong></td>
          <td>Inbound blocked, outbound open</td>
          <td>Denies all traffic inbound and outbound</td>
        </tr>
      </tbody>
    </table>
  </section>

  <div class="divider"></div>

  <!-- SECTION 4: ANIMATED TERMINAL -->
  <section class="section" id="terminal-demo">
    <div class="section-label">04 — CLI REMEDIATION</div>
    <h2>Fix the NACL outbound rule via AWS CLI</h2>

    <div class="terminal">
      <div class="terminal-bar">
        <div class="terminal-dot r"></div>
        <div class="terminal-dot y"></div>
        <div class="terminal-dot g"></div>
        <span class="terminal-title">aws-cli — create-network-acl-entry</span>
      </div>
      <div class="terminal-body">
        <div class="term-line" data-delay="0"><span class="prompt">$</span> <span class="cmd">aws ec2 describe-network-acls --network-acl-ids acl-0123456789abcdef0</span></div>
        <div class="term-line" data-delay="500"><span class="output">"Entries": [ { "RuleNumber": 100, "Protocol": "6", "RuleAction": "allow", "Egress": true, "PortRange": { "From": 443, "To": 443 } } ]</span></div>
        <div class="term-line" data-delay="1000"><span class="danger"># ERROR: Outbound only allows 443, dropping ephemeral return traffic (1024-65535)!</span></div>
        <div class="term-line" data-delay="1500"><span class="prompt">$</span> <span class="cmd">aws ec2 create-network-acl-entry \\
    --network-acl-id acl-0123456789abcdef0 \\
    --egress --rule-number 110 \\
    --protocol tcp --port-range From=1024,To=65535 \\
    --cidr-block 0.0.0.0/0 --rule-action allow</span></div>
        <div class="term-line" data-delay="2200"><span class="ok">✓ Rule 110 created successfully</span></div>
        <div class="term-line" data-delay="2600"><span class="prompt">$</span> <span class="cmd">curl -Iv https://app.example.com</span></div>
        <div class="term-line" data-delay="3000"><span class="ok">HTTP/2 200 OK — Connected in 18ms!</span></div>
      </div>
    </div>
  </section>

  <div class="divider"></div>

  <!-- SECTION 5: ACTIONABLE REMEDIATION -->
  <section class="section" id="best-practices">
    <div class="section-label">05 — SRE BEST PRACTICES</div>
    <h2>Rules for bulletproof VPC security design</h2>

    <div class="priority-list">
      <div class="priority-item">
        <div class="priority-title">Always Permit Ephemeral Ports Outbound on NACLs</div>
        <div class="priority-desc">
          Add an egress rule permitting TCP 1024–65535 to <code>0.0.0.0/0</code> so return packets for HTTP, HTTPS, and API calls never drop.
        </div>
      </div>

      <div class="priority-item">
        <div class="priority-title">Number NACL Rules in Increments of 100</div>
        <div class="priority-desc">
          Space out rule numbers (100, 200, 300) so emergency CIDR block rules (e.g. Rule 90 DENY) can be inserted immediately before allows.
        </div>
      </div>

      <div class="priority-item">
        <div class="priority-title">Use Security Group Chaining in Multi-Tier Apps</div>
        <div class="priority-desc">
          Do not hardcode IPs. Let <code>sg-app</code> trust <code>sg-alb</code>, and let <code>sg-db</code> trust <code>sg-app</code>.
        </div>
      </div>
    </div>
  </section>
  `;

  const sourcesHtml = `
    <li>AWS Documentation: <a href="https://docs.aws.amazon.com/vpc/latest/userguide/vpc-network-acls.html" target="_blank" rel="noopener">Control VPC Traffic with Network ACLs</a></li>
    <li>AWS Documentation: <a href="https://docs.aws.amazon.com/vpc/latest/userguide/vpc-security-groups.html" target="_blank" rel="noopener">Amazon EC2 Security Groups</a></li>
    <li>AWS VPC Quotas: <a href="https://docs.aws.amazon.com/vpc/latest/userguide/amazon-vpc-limits.html" target="_blank" rel="noopener">VPC Limits and Rule Budgets</a></li>
    <li>Hands-on Networking Lab: <a href="/learn#aws-nacl-security-groups" target="_blank" rel="noopener">OverflowByte VPC Security Lab</a></li>
  `;

  const html = renderHtmlPage({
    metaTitle: "Port 443 is open in security group. Why does it still time out?",
    metaDesc: "NACLs versus security groups on AWS: packet path, stateful vs stateless return traffic, ephemeral port trap, and three-tier architecture.",
    metaKeywords: "aws, vpc, security group, nacl, ephemeral ports, timeout, cloud networking",
    badgeText: "AWS VPC NETWORKING & SECURITY",
    badgeColor: "orange",
    titleHtml: 'Port 443 is Open: <span class="accent-php">Security Groups</span> vs <span class="accent-shell">Stateless NACLs</span>',
    subtitle: "Where each sits in the packet path, the ephemeral port trap, and why return traffic vanishes.",
    date: "November 2026",
    sectionsHtml,
    sourcesHtml
  });

  fs.writeFileSync(path.join(STATIC_DIR, `${slug}.html`), html, 'utf-8');
  console.log(`Generated public/static/${slug}.html`);
  injectBannerIntoMarkdown(mdFile, slug, "INTERACTIVE NETWORKING DEEP DIVE · STATEFUL VS STATELESS PACKET PATH", "#F2994A");
}

// ════════════════════════════════════════════════════════════════
// ARTICLE 04: I BROKE TWO SERVERS ON PURPOSE
// ════════════════════════════════════════════════════════════════
export function generateArticle04() {
  const slug = 'i-broke-two-servers-on-purpose';
  const mdFile = '04-i-broke-two-servers-on-purpose.md';

  const sectionsHtml = `
  <!-- SECTION 1: TL;DR -->
  <section class="section" id="tldr">
    <div class="section-label">01 — TL;DR & THE DRILL PHILOSOPHY</div>
    <h2>Single-fault drills are too kind: welcome to real triage</h2>
    <p>
      A break-fix drill tells you the symptom and implies there is one cause. Both of those are gifts, and neither survives contact with a real production outage.
    </p>
    <p>
      In this multi-fault incident drill across two RHEL nodes (<code>rhel01</code>, <code>rhel02</code>), you are handed a realistic work order under a 120-minute countdown:
      unrelated symptoms, a deliberate decoy, and a <strong>persistence mechanism that fights back</strong> and undoes your repairs until deleted.
    </p>

    <div class="cve-grid">
      <div class="cve-card">
        <div class="cve-id">RULE OF ENGAGEMENT #1</div>
        <div class="cve-name">No setenforce 0</div>
        <div class="cve-desc">
          Disabling SELinux even for a second fails the drill. Fix file labels with <code>semanage fcontext</code> and <code>restorecon</code>.
        </div>
        <span class="cve-tag rce">SELINUX ENFORCING</span>
      </div>

      <div class="cve-card">
        <div class="cve-id">RULE OF ENGAGEMENT #2</div>
        <div class="cve-name">No chmod 777</div>
        <div class="cve-desc">
          Widening permissions to world-writable papers over issues. Graders inspect mode bits across the entire filesystem.
        </div>
        <span class="cve-tag disclosure">DAC INTEGRITY</span>
      </div>

      <div class="cve-card">
        <div class="cve-id">THE ADVERSARY</div>
        <div class="cve-name">The Self-Healing Fault</div>
        <div class="cve-desc">
          At Severity 4, an active systemd timer reapplies damage every 3 minutes. Merely stopping it is not enough; you must disable and delete it.
        </div>
        <span class="cve-tag rce">SYSTEMD TIMERS</span>
      </div>

      <div class="cve-card">
        <div class="cve-id">EXAM PROOF</div>
        <div class="cve-name">Boot ID Verification</div>
        <div class="cve-desc">
          The grader compares <code>/proc/sys/kernel/random/boot_id</code> before and after to prove all repairs survive a real reboot.
        </div>
        <span class="cve-tag disclosure">PERSISTENCE</span>
      </div>
    </div>
  </section>

  <div class="divider"></div>

  <!-- SECTION 2: SEVERITY MATRIX -->
  <section class="section" id="severity-tiers">
    <div class="section-label">02 — SEVERITY TIERS & TARGETS</div>
    <h2>The 4-stage incident difficulty ladder</h2>

    <table class="exposure-table">
      <thead>
        <tr>
          <th>Severity</th>
          <th>Fault Composition</th>
          <th>Target Time</th>
          <th>Complexity Factors</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Sev 1</strong></td>
          <td>One single-cause fault</td>
          <td>15 minutes</td>
          <td><span class="status-ok">Baseline</span> Single host, obvious symptom</td>
        </tr>
        <tr>
          <td><strong>Sev 2</strong></td>
          <td>One single-cause + two concealed-cause</td>
          <td>40 minutes</td>
          <td><span class="status-ok">Concealed</span> Faults that mask secondary failures</td>
        </tr>
        <tr>
          <td><strong>Sev 3</strong></td>
          <td>Two single + two concealed + 1 worst</td>
          <td>75 minutes</td>
          <td><span class="status-vuln">Distributed</span> Cross-host failures (rhel01 + rhel02)</td>
        </tr>
        <tr>
          <td><strong>Sev 4</strong></td>
          <td>Sev 3 + Saboteur Timer + Decoy</td>
          <td>120 minutes</td>
          <td><span class="status-eol">Hardcore</span> Host fights back, decoy trap</td>
        </tr>
      </tbody>
    </table>
  </section>

  <div class="divider"></div>

  <!-- SECTION 3: TRIAGE FLOW -->
  <section class="section" id="triage-pipeline">
    <div class="section-label">03 — TRIAGE WORKFLOW</div>
    <h2>How to isolate the saboteur timer that undoes repairs</h2>

    <div class="attack-flow">
      <div class="flow-step" data-danger="true">
        <div class="flow-pipe">
          <div class="flow-dot"></div>
          <div class="flow-line"></div>
        </div>
        <div class="flow-content">
          <div class="flow-title">1. Observe the Symptom: Repaired Fault Recurs</div>
          <div class="flow-desc">
            You restored DNS or unblocked a firewall port, but 3 minutes later the service breaks again. Something on the host is executing on a schedule.
          </div>
        </div>
      </div>

      <div class="flow-step" data-danger="false">
        <div class="flow-pipe">
          <div class="flow-dot"></div>
          <div class="flow-line"></div>
        </div>
        <div class="flow-content">
          <div class="flow-title">2. Query All Active Timers</div>
          <div class="flow-desc">
            Run <code>systemctl list-timers --all</code>. Look for suspicious units with recent trigger times or unrecognized names.
          </div>
        </div>
      </div>

      <div class="flow-step" data-danger="false">
        <div class="flow-pipe">
          <div class="flow-dot"></div>
          <div class="flow-line"></div>
        </div>
        <div class="flow-content">
          <div class="flow-title">3. Inspect Unit Definition and Script Target</div>
          <div class="flow-desc">
            Run <code>systemctl cat &lt;unit&gt;</code> to reveal the target ExecStart binary. Inspect the script to verify it is the saboteur.
          </div>
        </div>
      </div>

      <div class="flow-step" data-danger="false">
        <div class="flow-pipe">
          <div class="flow-dot"></div>
          <div class="flow-line" style="opacity:0;"></div>
        </div>
        <div class="flow-content">
          <div class="flow-title">4. Eradicate and Reload</div>
          <div class="flow-desc">
            Stop and disable the timer and service. Delete both unit files and the payload script. Run <code>systemctl daemon-reload</code>.
          </div>
        </div>
      </div>
    </div>
  </section>

  <div class="divider"></div>

  <!-- SECTION 4: ANIMATED TERMINAL -->
  <section class="section" id="terminal-demo">
    <div class="section-label">04 — DIAGNOSTIC TERMINAL</div>
    <h2>Investigating du vs df mismatch & deleted file handles</h2>

    <div class="terminal">
      <div class="terminal-bar">
        <div class="terminal-dot r"></div>
        <div class="terminal-dot y"></div>
        <div class="terminal-dot g"></div>
        <span class="terminal-title">bash — storage triage: du vs df</span>
      </div>
      <div class="terminal-body">
        <div class="term-line" data-delay="0"><span class="prompt">$</span> <span class="cmd">df -h /var</span></div>
        <div class="term-line" data-delay="400"><span class="danger">/dev/mapper/rhel-var   10G  9.8G  200M  98% /var  # DISK FULL!</span></div>
        <div class="term-line" data-delay="900"><span class="prompt">$</span> <span class="cmd">du -sh /var</span></div>
        <div class="term-line" data-delay="1300"><span class="output">1.2G    /var  # du only sees 1.2G! Where is the other 8.6G?</span></div>
        <div class="term-line" data-delay="1800"><span class="prompt">$</span> <span class="cmd">lsof +L1 /var | grep '(deleted)'</span></div>
        <div class="term-line" data-delay="2300"><span class="danger">httpd  1402 apache  3w  REG  253,2  8858372096  0  /var/log/httpd/access.log (deleted)</span></div>
        <div class="term-line" data-delay="2800"><span class="prompt">$</span> <span class="cmd">systemctl reload httpd</span> <span class="ok"># Releases unlinked file descriptor</span></div>
        <div class="term-line" data-delay="3200"><span class="prompt">$</span> <span class="cmd">df -h /var</span></div>
        <div class="term-line" data-delay="3600"><span class="ok">/dev/mapper/rhel-var   10G  1.2G  8.8G  12% /var  # Space freed!</span></div>
      </div>
    </div>
  </section>

  <div class="divider"></div>

  <!-- SECTION 5: WHAT RESOLVED MEANS -->
  <section class="section" id="resolved-checklist">
    <div class="section-label">05 — VERIFICATION CRITERIA</div>
    <h2>What 'Resolved' means in production and exams</h2>

    <div class="priority-list">
      <div class="priority-item">
        <div class="priority-title">Services Running and Enabled</div>
        <div class="priority-desc">
          Every required daemon is active and enabled across reboots via systemd.
        </div>
      </div>

      <div class="priority-item">
        <div class="priority-title">SELinux Strictly Enforcing</div>
        <div class="priority-desc">
          <code>getenforce</code> outputs Enforcing. All contexts survive a full filesystem relabel.
        </div>
      </div>

      <div class="priority-item">
        <div class="priority-title">Firewall Runtime Matches Permanent</div>
        <div class="priority-desc">
          Every open port or service was configured with both <code>--permanent</code> and immediate reloading.
        </div>
      </div>

      <div class="priority-item">
        <div class="priority-title">Clean Mounts & Persistence</div>
        <div class="priority-desc">
          <code>findmnt --verify</code> is completely clean, and <code>mount -a</code> produces zero warnings.
        </div>
      </div>
    </div>
  </section>
  `;

  const sourcesHtml = `
    <li>EX294 Break-Fix Lab Repo: <a href="https://github.com/Push1697/rhce-ex294-lab" target="_blank" rel="noopener">rhce-ex294-lab on GitHub</a></li>
    <li>Linux Kernel Boot ID: <a href="https://man7.org/linux/man-pages/man5/proc.5.html" target="_blank" rel="noopener">proc(5) — /proc/sys/kernel/random/boot_id</a></li>
    <li>Systemd Timers: <a href="https://www.freedesktop.org/software/systemd/man/systemd.timer.html" target="_blank" rel="noopener">systemd.timer Documentation</a></li>
    <li>Incident Drills Curriculum: <a href="/learn#incident-drills" target="_blank" rel="noopener">OverflowByte Incident Drills & Checkers</a></li>
  `;

  const html = renderHtmlPage({
    metaTitle: "I broke two servers on purpose and gave myself an hour to fix them",
    metaDesc: "Multi-fault triage across two hosts under a clock: decoys, persistence mechanisms, systemd timers, and the layer method.",
    metaKeywords: "linux, sre, troubleshooting, incidents, rhcsa, rhce, systemd, boot_id",
    badgeText: "SRE INCIDENT DRILL — SEVERITY 4",
    badgeColor: "red",
    titleHtml: 'I Broke Two Servers on Purpose: <span class="accent-php">Multi-Fault Triage</span> & <span class="accent-shell">The Saboteur Timer</span>',
    subtitle: "Troubleshooting a broken estate under a clock: decoys, recurring faults, and boot-proven verification.",
    date: "December 2026",
    sectionsHtml,
    sourcesHtml
  });

  fs.writeFileSync(path.join(STATIC_DIR, `${slug}.html`), html, 'utf-8');
  console.log(`Generated public/static/${slug}.html`);
  injectBannerIntoMarkdown(mdFile, slug, "INTERACTIVE SRE DRILL · MULTI-FAULT ESTATE TRIAGE UNDER A CLOCK", "#EF4444");
}

// ════════════════════════════════════════════════════════════════
// ARTICLE 05: A RHEL LAB YOU CAN WRECK AND RESET IN SECONDS
// ════════════════════════════════════════════════════════════════
export function generateArticle05() {
  const slug = 'rhel-lab-wreck-and-reset-in-seconds';
  const mdFile = '05-rhel-lab-wreck-and-reset-in-seconds.md';

  const sectionsHtml = `
  <!-- SECTION 1: TL;DR -->
  <section class="section" id="tldr">
    <div class="section-label">01 — ARCHITECTURE & TOPOLOGY</div>
    <h2>Three RHEL nodes on one box: instant reset, zero cost</h2>
    <p>
      Practicing for the RHCSA or RHCE requires an environment where you can destroy storage, corrupt bootloaders,
      and break networking — then recover in <strong>under 3 seconds</strong>.
    </p>
    <p>
      By using KVM/libvirt with <strong>thin qcow2 copy-on-write overlays</strong> over a single base image,
      a three-node cluster (<code>rhel-control</code>, <code>rhel01</code>, <code>rhel02</code>) consumes less than 4GB of RAM
      and only a few hundred megabytes of disk.
    </p>

    <div class="cve-grid">
      <div class="cve-card">
        <div class="cve-id">STORAGE LAYER</div>
        <div class="cve-name">Thin qcow2 Overlays</div>
        <div class="cve-desc">
          Instead of copying a 20GB disk image three times, qcow2 overlays store only modified blocks. Instant creation and minimal storage footprint.
        </div>
        <span class="cve-tag rce">COPY-ON-WRITE</span>
      </div>

      <div class="cve-card">
        <div class="cve-id">AUTOMATION</div>
        <div class="cve-name">cloud-init Seed ISO</div>
        <div class="cve-desc">
          Provisions user accounts, injects SSH public keys, configures passwordless sudo, and pins hostnames on the first boot without manual installation.
        </div>
        <span class="cve-tag disclosure">ZERO TOUCH</span>
      </div>

      <div class="cve-card">
        <div class="cve-id">RECOVERY HABIT</div>
        <div class="cve-name">Pre-Registered Snapshots</div>
        <div class="cve-desc">
          Snapshot the clean, subscription-registered state. Reverting takes 2 seconds with <code>virsh snapshot-revert</code>.
        </div>
        <span class="cve-tag rce">INSTANT RESET</span>
      </div>

      <div class="cve-card">
        <div class="cve-id">LAB HARDWARE</div>
        <div class="cve-name">Extra Disks for LVM</div>
        <div class="cve-desc">
          Nodes rhel01 and rhel02 receive two blank 10GB disks each (vdb, vdc) dedicated to partition, LVM, and filesystem labs.
        </div>
        <span class="cve-tag disclosure">EXAM ACCURATE</span>
      </div>
    </div>
  </section>

  <div class="divider"></div>

  <!-- SECTION 2: ARCHITECTURE DIAGRAM -->
  <section class="section" id="architecture-diagram">
    <div class="section-label">02 — CLUSTER TOPOLOGY</div>
    <h2>Three-node lab layout on KVM</h2>

    <div class="diagram-wrap">
      <div class="diagram-title">⚡ LAB NETWORK TOPOLOGY (192.168.124.0/24)</div>
      <div class="packet-scene">
        <div class="node-box node-attacker">
          🎛️ CONTROL NODE
          <div class="node-label">192.168.124.10 (2 vCPU)</div>
        </div>
        <div class="packet-track">
          <div class="packet-dot malicious"></div>
        </div>
        <div class="node-box node-server">
          🖥️ NODE 1 (rhel01)
          <div class="node-label">192.168.124.11 (+2 Disks)</div>
        </div>
        <div class="packet-track">
          <div class="packet-dot malicious"></div>
        </div>
        <div class="node-box node-runtime">
          🖥️ NODE 2 (rhel02)
          <div class="node-label">192.168.124.12 (+2 Disks)</div>
        </div>
      </div>
    </div>
  </section>

  <div class="divider"></div>

  <!-- SECTION 3: SNAPSHOT RECOVERY WORKFLOW -->
  <section class="section" id="snapshot-workflow">
    <div class="section-label">03 — INSTANT RESET WORKFLOW</div>
    <h2>The break-fix lifecycle: snapshot, wreck, revert</h2>

    <div class="attack-flow">
      <div class="flow-step" data-danger="false">
        <div class="flow-pipe">
          <div class="flow-dot"></div>
          <div class="flow-line"></div>
        </div>
        <div class="flow-content">
          <div class="flow-title">1. Build Baseline & Register RHEL</div>
          <div class="flow-desc">
            Build all 3 nodes via <code>lab-build.sh</code>. Attach no-cost Red Hat Developer subscriptions and enable official repositories.
          </div>
        </div>
      </div>

      <div class="flow-step" data-danger="false">
        <div class="flow-pipe">
          <div class="flow-dot"></div>
          <div class="flow-line"></div>
        </div>
        <div class="flow-content">
          <div class="flow-title">2. Take Clean Baseline Snapshot</div>
          <div class="flow-desc">
            Execute <code>virsh snapshot-create-as rhel01 clean "Pre-lab baseline"</code> across all three nodes. This freezes the registered state.
          </div>
        </div>
      </div>

      <div class="flow-step" data-danger="true">
        <div class="flow-pipe">
          <div class="flow-dot"></div>
          <div class="flow-line"></div>
        </div>
        <div class="flow-content">
          <div class="flow-title">3. Run Destructive Drill / Saboteur</div>
          <div class="flow-desc">
            Execute drills: corrupt <code>/etc/fstab</code>, scramble SELinux contexts, or run the saboteur script to simulate catastrophic failure.
          </div>
        </div>
      </div>

      <div class="flow-step" data-danger="false">
        <div class="flow-pipe">
          <div class="flow-dot"></div>
          <div class="flow-line" style="opacity:0;"></div>
        </div>
        <div class="flow-content">
          <div class="flow-title">4. Revert to Clean in 2 Seconds</div>
          <div class="flow-desc">
            Run <code>virsh snapshot-revert rhel01 clean</code>. The VM resets immediately with zero disk redownload and zero re-registration needed.
          </div>
        </div>
      </div>
    </div>
  </section>

  <div class="divider"></div>

  <!-- SECTION 4: ANIMATED TERMINAL -->
  <section class="section" id="terminal-demo">
    <div class="section-label">04 — TERMINAL OPERATIONS</div>
    <h2>Creating qcow2 overlays and snapshot commands</h2>

    <div class="terminal">
      <div class="terminal-bar">
        <div class="terminal-dot r"></div>
        <div class="terminal-dot y"></div>
        <div class="terminal-dot g"></div>
        <span class="terminal-title">kvm-host — qemu-img & virsh</span>
      </div>
      <div class="terminal-body">
        <div class="term-line" data-delay="0"><span class="prompt">#</span> <span class="cmd">qemu-img create -f qcow2 -F qcow2 -b rhel-base.qcow2 rhel01.qcow2 20G</span></div>
        <div class="term-line" data-delay="400"><span class="ok">Formatting 'rhel01.qcow2', fmt=qcow2 size=21474836480 backing_file=rhel-base.qcow2</span></div>
        <div class="term-line" data-delay="900"><span class="prompt">#</span> <span class="cmd">virsh snapshot-create-as rhel01 clean "Registered baseline"</span></div>
        <div class="term-line" data-delay="1300"><span class="ok">Domain snapshot clean created</span></div>
        <div class="term-line" data-delay="1800"><span class="prompt">#</span> <span class="cmd">virsh snapshot-revert rhel01 clean</span> <span class="warn"># Takes 1.4 seconds!</span></div>
        <div class="term-line" data-delay="2200"><span class="ok">Domain rhel01 reverted to snapshot clean</span></div>
        <div class="term-line" data-delay="2600"><span class="prompt">#</span> <span class="cmd">ansible managed -m ping</span></div>
        <div class="term-line" data-delay="3000"><span class="ok">rhel01 | SUCCESS => {"ping": "pong"}</span></div>
      </div>
    </div>
  </section>
  `;

  const sourcesHtml = `
    <li>Lab Build Scripts: <a href="https://github.com/Push1697/published_quartz_blog/tree/v4/rhce-labs" target="_blank" rel="noopener">RHCE Labs Script Repository</a></li>
    <li>Red Hat Developer Subscription: <a href="https://developer.redhat.com" target="_blank" rel="noopener">Red Hat Developer Portal</a></li>
    <li>Libvirt & QEMU Documentation: <a href="https://libvirt.org/snapshots.html" target="_blank" rel="noopener">Domain Snapshots in Libvirt</a></li>
  `;

  const html = renderHtmlPage({
    metaTitle: "A RHEL lab you can wreck and reset in seconds",
    metaDesc: "Build a three-node RHEL lab on KVM/libvirt with thin qcow2 overlays, cloud-init and instant snapshot recovery.",
    metaKeywords: "rhel, kvm, libvirt, qemu, cloud-init, rhcsa, rhce, snapshots",
    badgeText: "VIRTUALIZATION & LAB ARCHITECTURE",
    badgeColor: "green",
    titleHtml: 'A RHEL Lab You Can <span class="accent-php">Wreck</span> and <span class="accent-node">Reset</span> in <span class="accent-shell">Seconds</span>',
    subtitle: "Three nodes on KVM with thin qcow2 overlays, cloud-init and instant snapshot recovery.",
    date: "December 2026",
    sectionsHtml,
    sourcesHtml
  });

  fs.writeFileSync(path.join(STATIC_DIR, `${slug}.html`), html, 'utf-8');
  console.log(`Generated public/static/${slug}.html`);
  injectBannerIntoMarkdown(mdFile, slug, "INTERACTIVE LAB ARCHITECTURE · KVM QCOW2 OVERLAYS & INSTANT RESET", "#22C55E");
}
