import fs from 'node:fs';
import path from 'node:path';
import { renderHtmlPage, STATIC_DIR } from './animated-page-base.mjs';
import { injectBannerIntoMarkdown } from './build-articles-group1.mjs';

// ════════════════════════════════════════════════════════════════
// ARTICLE 10: ANSIBLE VAULT WITH TWO VAULT IDS
// ════════════════════════════════════════════════════════════════
export function generateArticle10() {
  const slug = 'ansible-vault-with-two-vault-ids';
  const mdFile = '10-ansible-vault-with-two-vault-ids.md';

  const sectionsHtml = `
  <!-- SECTION 1: TL;DR -->
  <section class="section" id="tldr">
    <div class="section-label">01 — SECRETS ARCHITECTURE</div>
    <h2>Unattended multi-environment secret management</h2>
    <p>
      In production CI/CD pipelines, typing interactive vault passwords is impossible.
      Ansible Vault with multiple vault IDs (<code>--vault-id dev@~/.vault_dev --vault-id prod@~/.vault_prod</code>)
      allows encrypting staging and production credentials under different keys within the exact same Git repository.
    </p>

    <div class="cve-grid">
      <div class="cve-card">
        <div class="cve-id">MULTI-ENVIRONMENT</div>
        <div class="cve-name">Vault ID Labeling</div>
        <div class="cve-desc">
          Ciphertext headers store <code>$ANSIBLE_VAULT;1.2;AES256;dev</code>. Ansible matches the correct password file automatically.
        </div>
        <span class="cve-tag rce">VAULT IDs</span>
      </div>

      <div class="cve-card">
        <div class="cve-id">GRANULAR SECRETS</div>
        <div class="cve-name">encrypt_string</div>
        <div class="cve-desc">
          Encrypt single sensitive variables inline inside otherwise plaintext YAML files instead of locking the entire file.
        </div>
        <span class="cve-tag disclosure">INLINE CIPHER</span>
      </div>

      <div class="cve-card">
        <div class="cve-id">RUNTIME DEFENSE</div>
        <div class="cve-name">no_log: true</div>
        <div class="cve-desc">
          Vault protects secrets at rest on disk. <code>no_log: true</code> protects secrets in memory and console logs during execution.
        </div>
        <span class="cve-tag rce">LOG REDACTION</span>
      </div>

      <div class="cve-card">
        <div class="cve-id">MODULARITY</div>
        <div class="cve-name">Decomposition into Roles</div>
        <div class="cve-desc">
          Eliminate monolithic 500-line playbooks by scaffolding clean, isolated roles (common, apache, users, security).
        </div>
        <span class="cve-tag disclosure">ENTERPRISE ROLES</span>
      </div>
    </div>
  </section>

  <div class="divider"></div>

  <!-- SECTION 2: ARCHITECTURE COMPARISON -->
  <section class="section" id="vault-comparison">
    <div class="section-label">02 — FULL FILE VS INLINE ENCRYPTION</div>
    <h2>Architectural trade-offs of secret storage</h2>

    <table class="exposure-table">
      <thead>
        <tr>
          <th>Attribute</th>
          <th>Full-File Encryption</th>
          <th>Inline (encrypt_string)</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Git Diff Visibility</strong></td>
          <td>Opaque ciphertext block; diffs are unreadable</td>
          <td><span class="status-ok">Plaintext structure preserved</span>; only secret is masked</td>
        </tr>
        <tr>
          <td><strong>Merge Conflict Risk</strong></td>
          <td><span class="status-vuln">High</span> (cannot resolve line-by-line)</td>
          <td><span class="status-ok">Low</span> (standard git merge applies)</td>
        </tr>
        <tr>
          <td><strong>Performance Overhead</strong></td>
          <td>Decrypted once per file load</td>
          <td>Evaluated per variable string</td>
        </tr>
        <tr>
          <td><strong>Multi-Key Mixing</strong></td>
          <td>Single vault ID per file</td>
          <td><span class="status-ok">Can mix multiple vault IDs in one YAML</span></td>
        </tr>
      </tbody>
    </table>
  </section>

  <div class="divider"></div>

  <!-- SECTION 3: ANIMATED TERMINAL -->
  <section class="section" id="terminal-demo">
    <div class="section-label">03 — UNATTENDED VAULT COMMANDS</div>
    <h2>Encrypting with labeled vault IDs and executing unattended</h2>

    <div class="terminal">
      <div class="terminal-bar">
        <div class="terminal-dot r"></div>
        <div class="terminal-dot y"></div>
        <div class="terminal-dot g"></div>
        <span class="terminal-title">ansible-vault — multi-vault-id unattended execution</span>
      </div>
      <div class="terminal-body">
        <div class="term-line" data-delay="0"><span class="prompt">$</span> <span class="cmd">ansible-vault encrypt_string --vault-id dev@~/.vault_dev 'supersecret' --name 'db_password'</span></div>
        <div class="term-line" data-delay="500"><span class="ok">db_password: !vault |</span></div>
        <div class="term-line" data-delay="700"><span class="ok">          $ANSIBLE_VAULT;1.2;AES256;dev</span></div>
        <div class="term-line" data-delay="900"><span class="output">          31353139363065303463383038626532653238646132333734616263...</span></div>
        <div class="term-line" data-delay="1400"><span class="prompt">$</span> <span class="cmd">ansible-playbook site.yml --vault-id dev@~/.vault_dev --vault-id prod@~/.vault_prod</span></div>
        <div class="term-line" data-delay="2000"><span class="output">TASK [database : Configure connection] *********************************</span></div>
        <div class="term-line" data-delay="2400"><span class="ok">ok: [rhel02] => {"censored": "the output has been hidden due to the fact that 'no_log: true' was specified for this result"}</span></div>
      </div>
    </div>
  </section>
  `;

  const sourcesHtml = `
    <li>Ansible Vault Guide: <a href="https://docs.ansible.com/ansible/latest/vault_guide/vault_managing_passwords.html#multiple-vault-passwords" target="_blank" rel="noopener">Multiple Vault Passwords & Vault IDs</a></li>
    <li>Ansible no_log Security: <a href="https://docs.ansible.com/ansible/latest/reference_appendices/playbooks_keywords.html" target="_blank" rel="noopener">Ansible Playbook Keywords — no_log</a></li>
  `;

  const html = renderHtmlPage({
    metaTitle: "Ansible Vault with two vault IDs, without typing a password",
    metaDesc: "Roles, Jinja2 templates, Ansible Vault used unattended with two vault IDs, collections, and failure handling at scale.",
    metaKeywords: "ansible, vault, vault-id, security, devops, ci-cd, jinja2",
    badgeText: "ENTERPRISE SECRETS & ARCHITECTURE",
    badgeColor: "orange",
    titleHtml: 'Ansible Vault with <span class="accent-node">Two Vault IDs</span>: <span class="accent-shell">Unattended</span> CI/CD Security',
    subtitle: "Jinja2 templates driven by facts, role decomposition, multi-vault IDs without password prompts, and no_log defense.",
    date: "March 2027",
    sectionsHtml,
    sourcesHtml
  });

  fs.writeFileSync(path.join(STATIC_DIR, `${slug}.html`), html, 'utf-8');
  console.log(`Generated public/static/${slug}.html`);
  injectBannerIntoMarkdown(mdFile, slug, "INTERACTIVE SECRETS LAB · ANSIBLE MULTI-VAULT IDS & NO-LOG SECURITY", "#F2994A");
}

// ════════════════════════════════════════════════════════════════
// ARTICLE 11: THE MOBILE ACCESS RUNBOOK
// ════════════════════════════════════════════════════════════════
export function generateArticle11() {
  const slug = 'mobile-access-runbook-m365-phones';
  const mdFile = '11-mobile-access-runbook-m365-phones.md';

  const sectionsHtml = `
  <!-- SECTION 1: TL;DR -->
  <section class="section" id="tldr">
    <div class="section-label">01 — ENTERPRISE IDENTITY & MOBILITY</div>
    <h2>Company Portal, Work Profiles & The Copy-Paste Wall</h2>
    <p>
      How to guarantee that Microsoft 365 data functions on Android and iPhone <strong>only</strong> after the device
      is registered in Intune Company Portal, and strictly block corporate data from being copied, screenshotted, or shared into personal apps like WhatsApp or personal Gmail.
    </p>

    <div class="cve-grid">
      <div class="cve-card">
        <div class="cve-id">CONTAINMENT</div>
        <div class="cve-name">Android Work Profile</div>
        <div class="cve-desc">
          Enforces cryptographic separation between work and personal profiles. Work files and apps stay isolated under IT policy control.
        </div>
        <span class="cve-tag rce">WORK PROFILE</span>
      </div>

      <div class="cve-card">
        <div class="cve-id">MAM DEFENSE</div>
        <div class="cve-name">App Protection Policies</div>
        <div class="cve-desc">
          Restricts clipboard cut/copy: 'Policy managed apps with paste in'. Org data cannot be pasted into unmanaged apps.
        </div>
        <span class="cve-tag disclosure">DATA LEAKAGE</span>
      </div>

      <div class="cve-card">
        <div class="cve-id">CONDITIONAL ACCESS</div>
        <div class="cve-name">Require Compliant Device</div>
        <div class="cve-desc">
          Gates all cloud resources behind compliance. Crucial exclusion: exclude Intune Enrollment to prevent enrollment lockouts.
        </div>
        <span class="cve-tag rce">ZERO TRUST</span>
      </div>

      <div class="cve-card">
        <div class="cve-id">DEPLOYMENT DISCIPLINE</div>
        <div class="cve-name">Report-Only Validation</div>
        <div class="cve-desc">
          Every Conditional Access policy begins in Report-only mode. Verify audit logs before enforcing block actions.
        </div>
        <span class="cve-tag disclosure">SAFE ROLLOUT</span>
      </div>
    </div>
  </section>

  <div class="divider"></div>

  <!-- SECTION 2: FLOW DIAGRAM -->
  <section class="section" id="flow-diagram">
    <div class="section-label">02 — ACCESS EVALUATION FLOW</div>
    <h2>Conditional Access decision tree for mobile requests</h2>

    <div class="attack-flow">
      <div class="flow-step" data-danger="false">
        <div class="flow-pipe">
          <div class="flow-dot"></div>
          <div class="flow-line"></div>
        </div>
        <div class="flow-content">
          <div class="flow-title">1. Mobile Client Signs In (Outlook / Teams)</div>
          <div class="flow-desc">User enters credentials on mobile device. Entra ID intercepts the authentication request.</div>
        </div>
      </div>

      <div class="flow-step" data-danger="true">
        <div class="flow-pipe">
          <div class="flow-dot"></div>
          <div class="flow-line"></div>
        </div>
        <div class="flow-content">
          <div class="flow-title">2. Compliance Verification Check</div>
          <div class="flow-desc">Is phone registered in Company Portal and marked compliant? If NO: access blocked; prompt to enroll.</div>
        </div>
      </div>

      <div class="flow-step" data-danger="true">
        <div class="flow-pipe">
          <div class="flow-dot"></div>
          <div class="flow-line"></div>
        </div>
        <div class="flow-content">
          <div class="flow-title">3. Boundary Filter (Android Work Profile / iOS Managed)</div>
          <div class="flow-desc">Is the app running inside the Android Work Profile or under iOS MDM? If personal side: blocked immediately.</div>
        </div>
      </div>

      <div class="flow-step" data-danger="false">
        <div class="flow-pipe">
          <div class="flow-dot"></div>
          <div class="flow-line" style="opacity:0;"></div>
        </div>
        <div class="flow-content">
          <div class="flow-title">4. Access Granted with MAM Encryption & Copy-Paste Block</div>
          <div class="flow-desc">Connection admitted. App Protection Policy enforces clipboard isolation, screenshot block, and biometric lock.</div>
        </div>
      </div>
    </div>
  </section>

  <div class="divider"></div>

  <!-- SECTION 3: TEST MATRIX -->
  <section class="section" id="testing-matrix">
    <div class="section-label">03 — VERIFICATION TEST SUITE</div>
    <h2>Clipboard, screenshot, and storage leak verification</h2>

    <table class="exposure-table">
      <thead>
        <tr>
          <th>Test Action</th>
          <th>Target Destination</th>
          <th>Expected Enforcement Result</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Copy text from Work Outlook</td>
          <td>Personal WhatsApp / Telegram</td>
          <td><span class="status-vuln">BLOCKED</span>: "Your organization's data cannot be pasted here"</td>
        </tr>
        <tr>
          <td>Copy text from Work Outlook</td>
          <td>Work Microsoft Teams</td>
          <td><span class="status-ok">ALLOWED</span> (Both apps share corporate MAM policy)</td>
        </tr>
        <tr>
          <td>Save Outlook email attachment</td>
          <td>Local Phone Downloads / SD Card</td>
          <td><span class="status-vuln">BLOCKED</span>: Only OneDrive for Business offered</td>
        </tr>
        <tr>
          <td>Take screenshot in Work Outlook</td>
          <td>Phone Screenshot Gallery</td>
          <td><span class="status-vuln">BLOCKED</span>: Screen capture disabled by policy</td>
        </tr>
        <tr>
          <td>Copy public website text</td>
          <td>Work Outlook</td>
          <td><span class="status-ok">ALLOWED</span> ('Paste In' permitted by design)</td>
        </tr>
      </tbody>
    </table>
  </section>
  `;

  const sourcesHtml = `
    <li>Microsoft Intune App Protection: <a href="https://learn.microsoft.com/en-us/mem/intune/apps/app-protection-policy" target="_blank" rel="noopener">App Protection Policies Overview</a></li>
    <li>Entra ID Conditional Access: <a href="https://learn.microsoft.com/en-us/entra/identity/conditional-access/overview" target="_blank" rel="noopener">Conditional Access Architecture</a></li>
  `;

  const html = renderHtmlPage({
    metaTitle: "The Mobile Access Runbook: Company Portal, Work Profile and the Copy-Paste Block",
    metaDesc: "How to make Microsoft 365 work on Android and iPhone only after Company Portal enrollment and prevent data leakage.",
    metaKeywords: "intune, entra-id, mdm, conditional-access, m365, security, android, ios",
    badgeText: "ENTERPRISE MOBILITY RUNBOOK",
    badgeColor: "byte",
    titleHtml: 'Mobile Access Runbook: <span class="accent-php">Company Portal</span> & <span class="accent-shell">The Copy-Paste Wall</span>',
    subtitle: "Guarantee M365 functions on Android and iPhone only when enrolled, blocking data exfiltration to personal apps.",
    date: "November 2026",
    sectionsHtml,
    sourcesHtml
  });

  fs.writeFileSync(path.join(STATIC_DIR, `${slug}.html`), html, 'utf-8');
  console.log(`Generated public/static/${slug}.html`);
  injectBannerIntoMarkdown(mdFile, slug, "INTERACTIVE SECURITY RUNBOOK · INTUNE WORK PROFILE & COPY-PASTE BLOCK", "#5CE1FF");
}

// ════════════════════════════════════════════════════════════════
// ARTICLE 12: RHEL 10 STORAGE, SUID/SGID/ACLS & SELINUX LAB
// ════════════════════════════════════════════════════════════════
export function generateArticle12() {
  const slug = 'rhel10-storage-selinux-lab';
  const mdFile = '12-rhel10-storage-selinux-lab.md';

  const sectionsHtml = `
  <!-- SECTION 1: TL;DR -->
  <section class="section" id="tldr">
    <div class="section-label">01 — RHEL 10 PERFORMANCE LAB</div>
    <h2>Enterprise Storage, POSIX ACLs, and Persistent SELinux</h2>
    <p>
      In Red Hat Enterprise Linux 10, managing storage, fine-grained access controls, and SELinux policies
      forms the cornerstone of both the <strong>RHCSA (EX200)</strong> and <strong>RHCE (EX294)</strong> exams.
      This complete interactive lab covers LVM provisioning, online XFS resizing, special permission bits, POSIX ACL inheritance, and persistent file context rules.
    </p>

    <div class="cve-grid">
      <div class="cve-card">
        <div class="cve-id">STORAGE STACK</div>
        <div class="cve-name">LVM & Online XFS Growth</div>
        <div class="cve-desc">
          PV -> VG -> LV -> XFS. Extend with <code>lvextend --resizefs</code> or <code>xfs_growfs &lt;mount&gt;</code>. Remember: XFS cannot be shrunk!
        </div>
        <span class="cve-tag rce">XFS STORAGE</span>
      </div>

      <div class="cve-card">
        <div class="cve-id">SPECIAL BITS</div>
        <div class="cve-name">SUID, SGID, Sticky Bit</div>
        <div class="cve-desc">
          SUID (4): owner privileges. SGID (2): group inheritance on files and subdirs. Sticky (1): restrict deletion in shared dirs like /tmp.
        </div>
        <span class="cve-tag disclosure">SPECIAL MODES</span>
      </div>

      <div class="cve-card">
        <div class="cve-id">FINE-GRAINED DAC</div>
        <div class="cve-name">POSIX Access & Default ACLs</div>
        <div class="cve-desc">
          Assign granular user permissions with <code>setfacl -m u:auditor:rx</code> and default inheritance with <code>d:u:auditor:r</code>.
        </div>
        <span class="cve-tag rce">POSIX ACLs</span>
      </div>

      <div class="cve-card">
        <div class="cve-id">SELINUX PERSISTENCE</div>
        <div class="cve-name">semanage fcontext vs chcon</div>
        <div class="cve-desc">
          <code>chcon</code> changes running state only and is wiped by relabeling! Persistent policy requires <code>semanage fcontext -a</code> and <code>restorecon</code>.
        </div>
        <span class="cve-tag disclosure">MAC PERSISTENCE</span>
      </div>
    </div>
  </section>

  <div class="divider"></div>

  <!-- SECTION 2: STORAGE STACK DIAGRAM -->
  <section class="section" id="storage-diagram">
    <div class="section-label">02 — THE LVM ABSTRACTION HIERARCHY</div>
    <h2>From raw disk blocks to mount point</h2>

    <div class="diagram-wrap">
      <div class="diagram-title">⚡ LVM LOGICAL VOLUME STACK</div>
      <div class="packet-scene">
        <div class="node-box node-attacker">
          💾 RAW DISK
          <div class="node-label">/dev/sdb</div>
        </div>
        <div class="packet-track">
          <div class="packet-dot malicious"></div>
        </div>
        <div class="node-box node-server">
          📦 VOLUME GROUP
          <div class="node-label">vg_projects</div>
        </div>
        <div class="packet-track">
          <div class="packet-dot malicious"></div>
        </div>
        <div class="node-box node-runtime">
          📂 LOGICAL VOLUME
          <div class="node-label">/srv/app_data (XFS)</div>
        </div>
      </div>
    </div>
  </section>

  <div class="divider"></div>

  <!-- SECTION 3: ANIMATED TERMINAL -->
  <section class="section" id="terminal-demo">
    <div class="section-label">03 — COMPLETE LAB EXECUTION</div>
    <h2>LVM provisioning, SGID, ACLs & persistent SELinux</h2>

    <div class="terminal">
      <div class="terminal-bar">
        <div class="terminal-dot r"></div>
        <div class="terminal-dot y"></div>
        <div class="terminal-dot g"></div>
        <span class="terminal-title">rhel10-node — storage & security provisioning</span>
      </div>
      <div class="terminal-body">
        <div class="term-line" data-delay="0"><span class="prompt">#</span> <span class="cmd">pvcreate /dev/sdb && vgcreate vg_projects /dev/sdb</span></div>
        <div class="term-line" data-delay="400"><span class="ok">Volume group "vg_projects" successfully created</span></div>
        <div class="term-line" data-delay="800"><span class="prompt">#</span> <span class="cmd">lvcreate -n lv_appdata -L 5G vg_projects && mkfs.xfs /dev/vg_projects/lv_appdata</span></div>
        <div class="term-line" data-delay="1300"><span class="ok">meta-data=/dev/vg_projects/lv_appdata isize=512 agcount=4 ...</span></div>
        <div class="term-line" data-delay="1700"><span class="prompt">#</span> <span class="cmd">mkdir -p /srv/app_data && chown root:devops /srv/app_data && chmod 2770 /srv/app_data</span></div>
        <div class="term-line" data-delay="2100"><span class="prompt">#</span> <span class="cmd">setfacl -m u:auditor_user:rx /srv/app_data && setfacl -m d:u:auditor_user:r /srv/app_data</span></div>
        <div class="term-line" data-delay="2500"><span class="prompt">#</span> <span class="cmd">semanage fcontext -a -t httpd_sys_rw_content_t "/srv/app_data(/.*)?"</span></div>
        <div class="term-line" data-delay="2900"><span class="prompt">#</span> <span class="cmd">restorecon -Rv /srv/app_data</span></div>
        <div class="term-line" data-delay="3300"><span class="ok">Relabeled /srv/app_data from default_t to httpd_sys_rw_content_t</span></div>
        <div class="term-line" data-delay="3700"><span class="prompt">#</span> <span class="cmd">ls -ldZ /srv/app_data</span></div>
        <div class="term-line" data-delay="4100"><span class="ok">drwxrws---+ 2 root devops system_u:object_r:httpd_sys_rw_content_t:s0 /srv/app_data</span></div>
      </div>
    </div>
  </section>

  <div class="divider"></div>

  <!-- SECTION 4: EXAM REVIEW QUESTIONS -->
  <section class="section" id="review-qa">
    <div class="section-label">04 — KNOWLEDGE CHECK</div>
    <h2>Three critical exam questions analyzed</h2>

    <div class="callout warning">
      <div class="callout-title">❓ Q1: Online XFS Resizing</div>
      <p>
        After extending an LV with <code>lvextend -L +3G /dev/vg_projects/lv_appdata</code>, what is next?
        <strong>Answer:</strong> Execute <code>xfs_growfs /srv/app_data</code> passing the <strong>mount point</strong>, or pass <code>--resizefs</code> directly to lvextend.
      </p>
    </div>

    <div class="callout danger">
      <div class="callout-title">❓ Q2: The chcon Trap</div>
      <p>
        Why does <code>chcon</code> fail exam requirements?
        <strong>Answer:</strong> <code>chcon</code> alters in-memory filesystem contexts only. During a reboot or <code>restorecon</code> relabel, changes vanish. Persistent policies must be recorded via <code>semanage fcontext</code>.
      </p>
    </div>

    <div class="callout info">
      <div class="callout-title">❓ Q3: chmod Syntax Gotcha</div>
      <p>
        Why does <code>chmod u+rwx g+rw o-rwx /path</code> fail?
        <strong>Answer:</strong> Space-separated arguments are treated as target files! Multiple mode specs must be comma-separated: <code>chmod u+rwx,g+rw,o-rwx /path</code> or octal <code>2770</code>.
      </p>
    </div>
  </section>
  `;

  const sourcesHtml = `
    <li>Red Hat Enterprise Linux 10 Storage: <a href="https://access.redhat.com/documentation/en-us/red_hat_enterprise_linux/10" target="_blank" rel="noopener">RHEL 10 Storage Administration</a></li>
    <li>SELinux Policy Management: <a href="https://access.redhat.com/documentation/en-us/red_hat_enterprise_linux/10/html/using_selinux/" target="_blank" rel="noopener">Using SELinux in RHEL 10</a></li>
    <li>Interactive 55-Card Deck & Labs: <a href="/learn#rhel10-storage-selinux" target="_blank" rel="noopener">OverflowByte Storage & Security Deck</a></li>
  `;

  const html = renderHtmlPage({
    metaTitle: "Mastering Enterprise Storage, Advanced Security (SUID/SGID/ACLs), and SELinux in RHEL 10",
    metaDesc: "A complete hands-on guide and interactive lab for RHCSA and RHCE candidates: LVM, special permissions, POSIX ACLs and SELinux.",
    metaKeywords: "rhel10, rhcsa, rhce, lvm, xfs, suid, sgid, acl, selinux",
    badgeText: "RHEL 10 ENTERPRISE LAB",
    badgeColor: "green",
    titleHtml: 'RHEL 10: <span class="accent-php">Enterprise Storage</span>, <span class="accent-node">POSIX ACLs</span> & <span class="accent-shell">SELinux</span>',
    subtitle: "A complete hands-on guide: LVM provisioning, online XFS expansion, SUID/SGID/sticky bits, and persistent SELinux policy.",
    date: "November 2026",
    sectionsHtml,
    sourcesHtml
  });

  fs.writeFileSync(path.join(STATIC_DIR, `${slug}.html`), html, 'utf-8');
  console.log(`Generated public/static/${slug}.html`);
  injectBannerIntoMarkdown(mdFile, slug, "INTERACTIVE RHEL 10 LAB · LVM PROVISIONING, ACLS & PERSISTENT SELINUX", "#22C55E");
}
