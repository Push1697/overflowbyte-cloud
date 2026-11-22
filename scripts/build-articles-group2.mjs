import fs from 'node:fs';
import path from 'node:path';
import { renderHtmlPage, STATIC_DIR } from './animated-page-base.mjs';
import { injectBannerIntoMarkdown } from './build-articles-group1.mjs';

// ════════════════════════════════════════════════════════════════
// ARTICLE 06: MY 60-DAY PLAN FROM RHCSA TO RHCE
// ════════════════════════════════════════════════════════════════
export function generateArticle06() {
  const slug = '60-day-plan-rhcsa-to-rhce';
  const mdFile = '06-60-day-plan-rhcsa-to-rhce.md';

  const sectionsHtml = `
  <!-- SECTION 1: TL;DR -->
  <section class="section" id="tldr">
    <div class="section-label">01 — ROADMAP PHILOSOPHY</div>
    <h2>Requirement-driven, not video-driven: 8 weeks to double certification</h2>
    <p>
      Most certification plans are a passive list of courses and slides. This plan is built entirely on
      <strong>verifiable requirements</strong>: every single day, you are given an outcome a server must reach,
      and an automated grading harness checks whether you succeeded — after a mandatory reboot.
    </p>

    <div class="cve-grid">
      <div class="cve-card">
        <div class="cve-id">MONTH 1</div>
        <div class="cve-name">Core RHEL → RHCSA (EX200)</div>
        <div class="cve-desc">
          Weeks 1–4: files, permissions, LVM, systemd, boot recovery, and rootless Podman containers.
        </div>
        <span class="cve-tag rce">EX200 FOCUS</span>
      </div>

      <div class="cve-card">
        <div class="cve-id">MONTH 2</div>
        <div class="cve-name">Ansible Automation → RHCE (EX294)</div>
        <div class="cve-desc">
          Weeks 5–8: inventories, playbooks, variables, roles, Ansible Vault, and multi-node failure handling.
        </div>
        <span class="cve-tag disclosure">EX294 FOCUS</span>
      </div>

      <div class="cve-card">
        <div class="cve-id">THE GOLDEN HABIT</div>
        <div class="cve-name">Reboot Before You Believe It</div>
        <div class="cve-desc">
          Red Hat exams grade the state of the machine after reboot. If it doesn't survive restart, it scores 0.
        </div>
        <span class="cve-tag rce">PERSISTENCE</span>
      </div>

      <div class="cve-card">
        <div class="cve-id">DOCUMENTATION REFLEX</div>
        <div class="cve-name">Exam-Legal Docs Only</div>
        <div class="cve-desc">
          Build reflexes using only <code>man</code>, <code>info</code>, <code>/usr/share/doc</code>, and <code>ansible-doc</code>. No Google in the exam room.
        </div>
        <span class="cve-tag disclosure">OFFLINE FLUENCY</span>
      </div>
    </div>
  </section>

  <div class="divider"></div>

  <!-- SECTION 2: TIMELINE -->
  <section class="section" id="curriculum-timeline">
    <div class="section-label">02 — THE 8-WEEK TIMELINE</div>
    <h2>Week-by-week curriculum milestones</h2>

    <div class="timeline">
      <div class="tl-event">
        <div class="tl-date">WEEK 1 — CORE FOUNDATIONS</div>
        <div class="tl-title">Users, Permissions, SUID/SGID & Shell Navigation</div>
        <div class="tl-desc">PAM, credentials, ACLs, SSH keys, sudoers with visudo validation.</div>
      </div>

      <div class="tl-event">
        <div class="tl-date">WEEK 2 — SYSTEM SERVICES & STORAGE</div>
        <div class="tl-title">Systemd, Networking, LVM & Persistent Mounts</div>
        <div class="tl-desc">Physical volumes, volume groups, logical volumes, XFS expansion, NFS mounts by UUID.</div>
      </div>

      <div class="tl-event danger">
        <div class="tl-date">WEEK 3 — SECURITY & BOOT RECOVERY</div>
        <div class="tl-title">SELinux, Firewalld & The 4 Boot Failures</div>
        <div class="tl-desc">Emergency target, GRUB recovery, broken fstab rescue, persistent SELinux booleans and file contexts.</div>
      </div>

      <div class="tl-event safe">
        <div class="tl-date">WEEK 4 — RHCSA CAPSTONE & EXAM</div>
        <div class="tl-title">Rootless Containers, Tuned & 2.5h Mock Exam</div>
        <div class="tl-desc">Podman quadlets, tuned performance profiles. Bank the RHCSA credential before touching Ansible!</div>
      </div>

      <div class="tl-event">
        <div class="tl-date">WEEK 5 — ANSIBLE FUNDAMENTALS</div>
        <div class="tl-title">Inventories, Ad-Hoc Commands & Idempotence</div>
        <div class="tl-desc">Configuration files, ad-hoc administration, first YAML playbooks, verifying changed=0 on run 2.</div>
      </div>

      <div class="tl-event danger">
        <div class="tl-date">WEEK 6 — THE NO-SSH RULE</div>
        <div class="tl-title">Automating Every Month 1 Task Through Ansible</div>
        <div class="tl-desc">Never SSH into managed nodes to fix anything. Fix the playbook and re-run against reverted nodes.</div>
      </div>

      <div class="tl-event">
        <div class="tl-date">WEEK 7 — ENTERPRISE STRUCTURE</div>
        <div class="tl-title">Roles, Jinja2 Templates & Ansible Vault</div>
        <div class="tl-desc">Decompose monoliths into roles, multi-vault IDs, Jinja2 templating with facts, no_log security.</div>
      </div>

      <div class="tl-event safe">
        <div class="tl-date">WEEK 8 — RHCE CAPSTONE & CERTIFY</div>
        <div class="tl-title">Full Mock Exam & Production Deployment</div>
        <div class="tl-desc">Cross-node orchestration, rolling batch deployments, and sitting the EX294 exam.</div>
      </div>
    </div>
  </section>

  <div class="divider"></div>

  <!-- SECTION 3: ANIMATED TERMINAL -->
  <section class="section" id="terminal-demo">
    <div class="section-label">03 — AUTOMATED GRADING HARNESS</div>
    <h2>Offline verification that checks persistence across reboots</h2>

    <div class="terminal">
      <div class="terminal-bar">
        <div class="terminal-dot r"></div>
        <div class="terminal-dot y"></div>
        <div class="terminal-dot g"></div>
        <span class="terminal-title">kvm-control — ./verify harness</span>
      </div>
      <div class="terminal-body">
        <div class="term-line" data-delay="0"><span class="prompt">$</span> <span class="cmd">sudo ./verify 2.5</span> <span class="warn"># LVM, filesystems, swap</span></div>
        <div class="term-line" data-delay="500"><span class="output">[PASS] Logical Volume lvapp exists and is 4GB</span></div>
        <div class="term-line" data-delay="900"><span class="output">[PASS] Mount /data configured in fstab by UUID</span></div>
        <div class="term-line" data-delay="1400"><span class="prompt">$</span> <span class="cmd">sudo reboot</span></div>
        <div class="term-line" data-delay="2000"><span class="prompt">$</span> <span class="cmd">sudo ./verify 2.5 --after-reboot</span></div>
        <div class="term-line" data-delay="2500"><span class="ok">[BOOT VERIFIED] Boot ID changed: 8d93f-c9182...</span></div>
        <div class="term-line" data-delay="2900"><span class="ok">[PASS] All 8 criteria survived reboot! Score: 100%</span></div>
      </div>
    </div>
  </section>
  `;

  const sourcesHtml = `
    <li>Red Hat Exam Curriculum: <a href="https://www.redhat.com/en/services/training/ex200-red-hat-certified-system-administrator-rhcsa-exam" target="_blank" rel="noopener">Red Hat EX200 Exam Objectives</a></li>
    <li>Red Hat Ansible Exam: <a href="https://www.redhat.com/en/services/training/ex294-red-hat-certified-engineer-rhce-exam" target="_blank" rel="noopener">Red Hat EX294 Exam Objectives</a></li>
    <li>Curriculum Code & Checkers: <a href="https://github.com/Push1697/published_quartz_blog/tree/v4/rhce-labs" target="_blank" rel="noopener">RHCE Labs Script Repository</a></li>
  `;

  const html = renderHtmlPage({
    metaTitle: "My 60-day plan from RHCSA to RHCE",
    metaDesc: "A requirement-driven lab curriculum that takes you from core RHEL administration to Ansible automation in eight weeks.",
    metaKeywords: "rhcsa, rhce, ex200, ex294, ansible, red hat, certification, linux",
    badgeText: "8-WEEK CERTIFICATION ROADMAP",
    badgeColor: "indigo",
    titleHtml: '60-Day Blueprint: <span class="accent-php">RHCSA</span> to <span class="accent-node">RHCE</span> with <span class="accent-shell">Ansible</span>',
    subtitle: "From core RHEL administration to enterprise automation in eight weeks, with scripts that grade your work and break your machines.",
    date: "January 2027",
    sectionsHtml,
    sourcesHtml
  });

  fs.writeFileSync(path.join(STATIC_DIR, `${slug}.html`), html, 'utf-8');
  console.log(`Generated public/static/${slug}.html`);
  injectBannerIntoMarkdown(mdFile, slug, "INTERACTIVE CERTIFICATION ROADMAP · RHCSA TO RHCE IN 60 DAYS", "#6366F1");
}

// ════════════════════════════════════════════════════════════════
// ARTICLE 07: EVERY RHCSA TASK TRANSLATED TO ANSIBLE
// ════════════════════════════════════════════════════════════════
export function generateArticle07() {
  const slug = 'every-rhcsa-task-translated-to-ansible';
  const mdFile = '07-every-rhcsa-task-translated-to-ansible.md';

  const sectionsHtml = `
  <!-- SECTION 1: TL;DR -->
  <section class="section" id="tldr">
    <div class="section-label">01 — THE TRANSLATION MATRIX</div>
    <h2>Connecting manual administration to declarative automation</h2>
    <p>
      The single most common hurdle when moving from RHCSA to RHCE is translating instinctive terminal commands
      into idempotent Ansible tasks. This interactive guide maps every classic administrative task to its module, collection, and traps.
    </p>

    <div class="cve-grid">
      <div class="cve-card">
        <div class="cve-id">COLLECTIONS TRAP</div>
        <div class="cve-name">ansible.posix</div>
        <div class="cve-desc">
          Modules like <code>firewalld</code>, <code>selinux</code>, <code>seboolean</code>, <code>mount</code>, and <code>acl</code> do NOT ship in builtin!
        </div>
        <span class="cve-tag rce">COLLECTION REQUIRED</span>
      </div>

      <div class="cve-card">
        <div class="cve-id">STORAGE TRAP</div>
        <div class="cve-name">community.general</div>
        <div class="cve-desc">
          LVM (<code>lvg</code>, <code>lvol</code>) and filesystem tools (<code>parted</code>, <code>filesystem</code>) live in community.general.
        </div>
        <span class="cve-tag disclosure">LVM AUTOMATION</span>
      </div>

      <div class="cve-card">
        <div class="cve-id">IDEMPOTENCE</div>
        <div class="cve-name">state: present vs latest</div>
        <div class="cve-desc">
          <code>state: present</code> installs if missing. <code>state: latest</code> upgrades existing packages. The exam expects precise alignment with requirements.
        </div>
        <span class="cve-tag rce">EXAM MARKS</span>
      </div>

      <div class="cve-card">
        <div class="cve-id">MOUNT TRAP</div>
        <div class="cve-name">state: mounted vs present</div>
        <div class="cve-desc">
          <code>mounted</code> writes fstab AND mounts immediately. <code>present</code> only edits fstab without mounting.
        </div>
        <span class="cve-tag disclosure">FSTAB LOGIC</span>
      </div>
    </div>
  </section>

  <div class="divider"></div>

  <!-- SECTION 2: MODULE MAP TABLE -->
  <section class="section" id="module-table">
    <div class="section-label">02 — THE COMPLETE MODULE MAP</div>
    <h2>Manual commands and their Ansible counterparts</h2>

    <table class="exposure-table">
      <thead>
        <tr>
          <th>RHCSA Task</th>
          <th>Manual CLI Command</th>
          <th>Ansible Module</th>
          <th>Collection</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Create User</td>
          <td><code>useradd -u 3001 name</code></td>
          <td><code>ansible.builtin.user</code></td>
          <td><span class="status-ok">builtin</span></td>
        </tr>
        <tr>
          <td>Configure Firewall</td>
          <td><code>firewall-cmd --add-service=http</code></td>
          <td><code>ansible.posix.firewalld</code></td>
          <td><span class="status-vuln">ansible.posix</span></td>
        </tr>
        <tr>
          <td>SELinux Context</td>
          <td><code>semanage fcontext -a ...</code></td>
          <td><code>community.general.sefcontext</code></td>
          <td><span class="status-eol">community.general</span></td>
        </tr>
        <tr>
          <td>SELinux Boolean</td>
          <td><code>setsebool -P httpd_connect 1</code></td>
          <td><code>ansible.posix.seboolean</code></td>
          <td><span class="status-vuln">ansible.posix</span></td>
        </tr>
        <tr>
          <td>Mount Filesystem</td>
          <td><code>mount /dev/vg/lv /data</code></td>
          <td><code>ansible.posix.mount</code></td>
          <td><span class="status-vuln">ansible.posix</span></td>
        </tr>
        <tr>
          <td>LVM Logical Volume</td>
          <td><code>lvcreate -L 4G -n lv /dev/vg</code></td>
          <td><code>community.general.lvol</code></td>
          <td><span class="status-eol">community.general</span></td>
        </tr>
        <tr>
          <td>POSIX ACLs</td>
          <td><code>setfacl -m u:alice:rx /dir</code></td>
          <td><code>ansible.posix.acl</code></td>
          <td><span class="status-vuln">ansible.posix</span></td>
        </tr>
        <tr>
          <td>Systemd Services</td>
          <td><code>systemctl enable --now httpd</code></td>
          <td><code>ansible.builtin.systemd_service</code></td>
          <td><span class="status-ok">builtin</span></td>
        </tr>
      </tbody>
    </table>
  </section>

  <div class="divider"></div>

  <!-- SECTION 3: ANIMATED TERMINAL -->
  <section class="section" id="terminal-demo">
    <div class="section-label">03 — EXAM REFLEX DEMO</div>
    <h2>Finding modules and syntax offline with ansible-doc</h2>

    <div class="terminal">
      <div class="terminal-bar">
        <div class="terminal-dot r"></div>
        <div class="terminal-dot y"></div>
        <div class="terminal-dot g"></div>
        <span class="terminal-title">control-node — ansible-doc offline lookup</span>
      </div>
      <div class="terminal-body">
        <div class="term-line" data-delay="0"><span class="prompt">$</span> <span class="cmd">ansible-doc -l | grep -i firewalld</span></div>
        <div class="term-line" data-delay="400"><span class="output">ansible.posix.firewalld  Manage arbitrary ports/services with firewalld</span></div>
        <div class="term-line" data-delay="900"><span class="prompt">$</span> <span class="cmd">ansible-doc -s ansible.posix.firewalld</span> <span class="warn"># Ready-to-paste snippet!</span></div>
        <div class="term-line" data-delay="1400"><span class="ok">- name: Manage arbitrary ports/services with firewalld</span></div>
        <div class="term-line" data-delay="1600"><span class="ok">  ansible.posix.firewalld:</span></div>
        <div class="term-line" data-delay="1800"><span class="ok">    service: http</span></div>
        <div class="term-line" data-delay="2000"><span class="ok">    permanent: true</span></div>
        <div class="term-line" data-delay="2200"><span class="ok">    immediate: true</span></div>
        <div class="term-line" data-delay="2400"><span class="ok">    state: enabled</span></div>
      </div>
    </div>
  </section>
  `;

  const sourcesHtml = `
    <li>Ansible Builtin Modules: <a href="https://docs.ansible.com/ansible/latest/collections/ansible/builtin/index.html" target="_blank" rel="noopener">Official Builtin Index</a></li>
    <li>Ansible POSIX Collection: <a href="https://galaxy.ansible.com/ui/repo/published/ansible/posix/" target="_blank" rel="noopener">ansible.posix on Galaxy</a></li>
    <li>Community General Collection: <a href="https://galaxy.ansible.com/ui/repo/published/community/general/" target="_blank" rel="noopener">community.general on Galaxy</a></li>
  `;

  const html = renderHtmlPage({
    metaTitle: "Every RHCSA task, translated to Ansible",
    metaDesc: "Every RHCSA task mapped to its manual command, its Ansible module and the collection that module lives in.",
    metaKeywords: "ansible, rhcsa, rhce, devops, automation, ex294, collections, firewalld",
    badgeText: "MANUAL TO ANSIBLE TRANSLATION",
    badgeColor: "byte",
    titleHtml: 'Every RHCSA Task <span class="accent-node">Translated</span> to <span class="accent-php">Ansible</span> Modules',
    subtitle: "The complete manual command to Ansible module matrix, plus the collections trap that catches people in the exam.",
    date: "January 2027",
    sectionsHtml,
    sourcesHtml
  });

  fs.writeFileSync(path.join(STATIC_DIR, `${slug}.html`), html, 'utf-8');
  console.log(`Generated public/static/${slug}.html`);
  injectBannerIntoMarkdown(mdFile, slug, "INTERACTIVE MODULE MAP · MANUAL COMMANDS TO ANSIBLE MODULES", "#5CE1FF");
}

// ════════════════════════════════════════════════════════════════
// ARTICLE 08: THE NO-SSH RULE
// ════════════════════════════════════════════════════════════════
export function generateArticle08() {
  const slug = 'the-no-ssh-rule-automating-exam-set';
  const mdFile = '08-the-no-ssh-rule-automating-exam-set.md';

  const sectionsHtml = `
  <!-- SECTION 1: TL;DR -->
  <section class="section" id="tldr">
    <div class="section-label">01 — THE DISCIPLINE</div>
    <h2>Never SSH in to fix anything: automate from zero</h2>
    <p>
      The core principle of Week 6: you must recreate every manual environment exclusively via Ansible playbooks.
      If a task fails on a managed host, <strong>you are forbidden from logging in via SSH to fix it</strong>.
      You must diagnose the failure through playbook output, correct the YAML file, and rerun the play against clean, reverted nodes.
    </p>

    <div class="cve-grid">
      <div class="cve-card">
        <div class="cve-id">LAB 6.1</div>
        <div class="cve-name">Users & Sudoers Validation</div>
        <div class="cve-desc">
          Automate user accounts, password ageing, and sudoers rules using <code>validate: 'visudo -cf %s'</code>.
        </div>
        <span class="cve-tag rce">SUDO INTEGRITY</span>
      </div>

      <div class="cve-card">
        <div class="cve-id">LAB 6.2</div>
        <div class="cve-name">Handlers & Daemon Reload</div>
        <div class="cve-desc">
          Unit file templating triggers systemd reloads only when changed. Verify <code>changed=0</code> on second execution.
        </div>
        <span class="cve-tag disclosure">IDEMPOTENCE</span>
      </div>

      <div class="cve-card">
        <div class="cve-id">LAB 6.3</div>
        <div class="cve-name">Automated LVM from Blank Disks</div>
        <div class="cve-desc">
          Partition raw disks (vdb, vdc), configure volume groups, LVs, and persistent fstab mounts by UUID.
        </div>
        <span class="cve-tag rce">STORAGE PIPELINE</span>
      </div>

      <div class="cve-card">
        <div class="cve-id">LAB 6.5</div>
        <div class="cve-name">10 Hosts, Zero Logins</div>
        <div class="cve-desc">
          Take 10 fresh machines from unconfigured to fully hardened web cluster in a single playbook run with assert verification.
        </div>
        <span class="cve-tag disclosure">FLEET SCALE</span>
      </div>
    </div>
  </section>

  <div class="divider"></div>

  <!-- SECTION 2: AUTOMATION PIPELINE -->
  <section class="section" id="pipeline">
    <div class="section-label">02 — THE AUTOMATION LOOP</div>
    <h2>Revert, run, verify, break</h2>

    <div class="attack-flow">
      <div class="flow-step" data-danger="false">
        <div class="flow-pipe">
          <div class="flow-dot"></div>
          <div class="flow-line"></div>
        </div>
        <div class="flow-content">
          <div class="flow-title">1. virsh snapshot-revert rhel01 clean</div>
          <div class="flow-desc">Both managed nodes are wiped back to their pristine post-registration baseline.</div>
        </div>
      </div>

      <div class="flow-step" data-danger="false">
        <div class="flow-pipe">
          <div class="flow-dot"></div>
          <div class="flow-line"></div>
        </div>
        <div class="flow-content">
          <div class="flow-title">2. ansible-playbook site.yml</div>
          <div class="flow-desc">Execute declarative automation to provision all users, services, storage, and security policies.</div>
        </div>
      </div>

      <div class="flow-step" data-danger="false">
        <div class="flow-pipe">
          <div class="flow-dot"></div>
          <div class="flow-line"></div>
        </div>
        <div class="flow-content">
          <div class="flow-title">3. Second Run: Assert changed=0</div>
          <div class="flow-desc">Rerun the playbook immediately. Any task reporting 'changed' violates idempotence and fails.</div>
        </div>
      </div>

      <div class="flow-step" data-danger="true">
        <div class="flow-pipe">
          <div class="flow-dot"></div>
          <div class="flow-line" style="opacity:0;"></div>
        </div>
        <div class="flow-content">
          <div class="flow-title">4. Sabotage Injection & Assert Verification</div>
          <div class="flow-desc">Intentionally corrupt firewall rules or file modes. The verification stage must catch and fail the play loudly!</div>
        </div>
      </div>
    </div>
  </section>

  <div class="divider"></div>

  <!-- SECTION 3: ANIMATED TERMINAL -->
  <section class="section" id="terminal-demo">
    <div class="section-label">03 — AUTOMATION RUNNER</div>
    <h2>Playbook execution and idempotence check</h2>

    <div class="terminal">
      <div class="terminal-bar">
        <div class="terminal-dot r"></div>
        <div class="terminal-dot y"></div>
        <div class="terminal-dot g"></div>
        <span class="terminal-title">ansible-playbook — users.yml & idempotence check</span>
      </div>
      <div class="terminal-body">
        <div class="term-line" data-delay="0"><span class="prompt">$</span> <span class="cmd">ansible-playbook -i inventory users.yml</span></div>
        <div class="term-line" data-delay="400"><span class="output">PLAY [Configure users and security] *************************************</span></div>
        <div class="term-line" data-delay="800"><span class="ok">changed: [rhel01] => {"changed": true, "name": "developers"}</span></div>
        <div class="term-line" data-delay="1200"><span class="ok">changed: [rhel01] => {"changed": true, "name": "amit"}</span></div>
        <div class="term-line" data-delay="1600"><span class="prompt">$</span> <span class="cmd">ansible-playbook -i inventory users.yml</span> <span class="warn"># Second run check!</span></div>
        <div class="term-line" data-delay="2100"><span class="output">PLAY RECAP *************************************************************</span></div>
        <div class="term-line" data-delay="2500"><span class="ok">rhel01 : ok=8 changed=0 unreachable=0 failed=0</span></div>
      </div>
    </div>
  </section>
  `;

  const sourcesHtml = `
    <li>EX294 Lab Automation: <a href="https://github.com/Push1697/published_quartz_blog/tree/v4/rhce-labs" target="_blank" rel="noopener">RHCE Automation Lab Scripts</a></li>
    <li>Ansible Sudoers Validation: <a href="https://docs.ansible.com/ansible/latest/collections/ansible/builtin/template_module.html" target="_blank" rel="noopener">Ansible Template Module Validation</a></li>
  `;

  const html = renderHtmlPage({
    metaTitle: "The no-SSH rule: automating a whole exam set with Ansible",
    metaDesc: "The week that joins the two certifications: every manual RHCSA lab redone as an idempotent playbook against reverted nodes.",
    metaKeywords: "ansible, rhce, rhcsa, ex294, idempotence, automation",
    badgeText: "NO-SSH AUTOMATION CHALLENGE",
    badgeColor: "green",
    titleHtml: 'The No-SSH Rule: <span class="accent-node">Automate</span> the Exam Set with <span class="accent-shell">Zero Logins</span>',
    subtitle: "Every manual RHCSA lab redone as an idempotent playbook, against freshly reverted nodes: never log in to fix anything.",
    date: "February 2027",
    sectionsHtml,
    sourcesHtml
  });

  fs.writeFileSync(path.join(STATIC_DIR, `${slug}.html`), html, 'utf-8');
  console.log(`Generated public/static/${slug}.html`);
  injectBannerIntoMarkdown(mdFile, slug, "INTERACTIVE AUTOMATION CHALLENGE · THE NO-SSH RULE LAB", "#22C55E");
}

// ════════════════════════════════════════════════════════════════
// ARTICLE 09: ANSIBLE VARIABLE PRECEDENCE, DRAWN
// ════════════════════════════════════════════════════════════════
export function generateArticle09() {
  const slug = 'ansible-variable-precedence-drawn';
  const mdFile = '09-ansible-variable-precedence-drawn.md';

  const sectionsHtml = `
  <!-- SECTION 1: TL;DR -->
  <section class="section" id="tldr">
    <div class="section-label">01 — THE 22-LEVEL LADDER</div>
    <h2>Where did that variable value come from?</h2>
    <p>
      Ansible has 22 separate variable precedence levels. In real projects, debugging why an inventory variable
      or role default is seemingly ignored is one of the most frustrating time sinks.
    </p>

    <div class="cve-grid">
      <div class="cve-card">
        <div class="cve-id">LOWEST LEVEL (1)</div>
        <div class="cve-name">Role Defaults (defaults/main.yml)</div>
        <div class="cve-desc">
          Easily overridden by everything. Designed specifically for sensible baseline defaults.
        </div>
        <span class="cve-tag disclosure">BASE LEVEL</span>
      </div>

      <div class="cve-card">
        <div class="cve-id">INVENTORY LEVEL (2-8)</div>
        <div class="cve-name">group_vars & host_vars</div>
        <div class="cve-desc">
          <code>group_vars/all</code> &lt; <code>group_vars/&lt;group&gt;</code> &lt; <code>host_vars/&lt;hostname&gt;</code>. Host variables always defeat group variables.
        </div>
        <span class="cve-tag rce">INVENTORY</span>
      </div>

      <div class="cve-card">
        <div class="cve-id">PLAYBOOK LEVEL (9-17)</div>
        <div class="cve-name">Play Vars, Roles & Tasks</div>
        <div class="cve-desc">
          Play <code>vars:</code> beat inventory. Role <code>vars/main.yml</code> beat play vars. Task <code>vars:</code> beat role vars.
        </div>
        <span class="cve-tag disclosure">PLAY SCOPE</span>
      </div>

      <div class="cve-card">
        <div class="cve-id">HIGHEST LEVEL (22)</div>
        <div class="cve-name">Extra Vars (-e)</div>
        <div class="cve-desc">
          Command-line extra variables (<code>-e "key=value"</code>) reign supreme over all other 21 levels without exception.
        </div>
        <span class="cve-tag rce">UNTOUCHABLE</span>
      </div>
    </div>
  </section>

  <div class="divider"></div>

  <!-- SECTION 2: PRECEDENCE LADDER -->
  <section class="section" id="precedence-ladder">
    <div class="section-label">02 — THE HIERARCHY OF PRECEDENCE</div>
    <h2>Resolution order from weakest to strongest</h2>

    <table class="exposure-table">
      <thead>
        <tr>
          <th>Priority Rank</th>
          <th>Location / Scope</th>
          <th>Typical Use Case</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>1 (Lowest)</strong></td>
          <td><code>roles/&lt;name&gt;/defaults/main.yml</code></td>
          <td>Baseline defaults designed to be overridden</td>
          <td><span class="status-ok">Weakest</span></td>
        </tr>
        <tr>
          <td><strong>4</strong></td>
          <td><code>group_vars/all.yml</code></td>
          <td>Global settings across all inventory hosts</td>
          <td><span class="status-ok">Global</span></td>
        </tr>
        <tr>
          <td><strong>6</strong></td>
          <td><code>group_vars/web.yml</code></td>
          <td>Group-specific settings (e.g. web ports)</td>
          <td><span class="status-ok">Group</span></td>
        </tr>
        <tr>
          <td><strong>8</strong></td>
          <td><code>host_vars/rhel01.yml</code></td>
          <td>Host-specific overrides (beats all groups)</td>
          <td><span class="status-ok">Host</span></td>
        </tr>
        <tr>
          <td><strong>12</strong></td>
          <td>Playbook <code>vars:</code></td>
          <td>Variables defined directly in the play header</td>
          <td><span class="status-vuln">Play</span></td>
        </tr>
        <tr>
          <td><strong>15</strong></td>
          <td><code>roles/&lt;name&gt;/vars/main.yml</code></td>
          <td>Internal constants that should NOT be overridden</td>
          <td><span class="status-vuln">Strict</span></td>
        </tr>
        <tr>
          <td><strong>17</strong></td>
          <td>Task <code>vars:</code></td>
          <td>Variable defined directly on a specific task</td>
          <td><span class="status-vuln">Task</span></td>
        </tr>
        <tr>
          <td><strong>22 (Highest)</strong></td>
          <td>Command-line <code>-e "var=val"</code></td>
          <td>Runtime emergency overrides & CI injection</td>
          <td><span class="status-eol">Supreme</span></td>
        </tr>
      </tbody>
    </table>
  </section>

  <div class="divider"></div>

  <!-- SECTION 3: ANIMATED TERMINAL -->
  <section class="section" id="terminal-demo">
    <div class="section-label">03 — PRECEDENCE RESOLUTION DEMO</div>
    <h2>Testing override resolution via ansible-inventory</h2>

    <div class="terminal">
      <div class="terminal-bar">
        <div class="terminal-dot r"></div>
        <div class="terminal-dot y"></div>
        <div class="terminal-dot g"></div>
        <span class="terminal-title">ansible-inventory — variable resolution inspection</span>
      </div>
      <div class="terminal-body">
        <div class="term-line" data-delay="0"><span class="prompt">$</span> <span class="cmd">ansible-inventory --host rhel01</span></div>
        <div class="term-line" data-delay="400"><span class="output">{ "http_port": 8080, "server_name": "rhel01.example.com" }</span></div>
        <div class="term-line" data-delay="900"><span class="prompt">$</span> <span class="cmd">ansible-playbook web.yml -e "http_port=9090"</span> <span class="warn"># Extra vars override!</span></div>
        <div class="term-line" data-delay="1400"><span class="ok">TASK [Show effective port] => { "msg": "Binding on port 9090 (extra_vars won)" }</span></div>
      </div>
    </div>
  </section>
  `;

  const sourcesHtml = `
    <li>Ansible Documentation: <a href="https://docs.ansible.com/ansible/latest/playbook_guide/playbooks_variables.html#variable-precedence-where-should-i-put-a-variable" target="_blank" rel="noopener">Understanding Variable Precedence</a></li>
    <li>Ansible Fundamentals Labs: <a href="/learn#ansible-variable-precedence" target="_blank" rel="noopener">OverflowByte Variable Precedence Lab</a></li>
  `;

  const html = renderHtmlPage({
    metaTitle: "Ansible variable precedence, drawn",
    metaDesc: "Seven requirement-driven Ansible labs: inventory and config, ad-hoc, playbooks, variable precedence ladder, loops and handlers.",
    metaKeywords: "ansible, variables, precedence, inventory, yaml, devops",
    badgeText: "ANSIBLE VARIABLE ARCHITECTURE",
    badgeColor: "indigo",
    titleHtml: 'Ansible Variable Precedence: <span class="accent-php">The 22-Level</span> <span class="accent-node">Hierarchy</span> <span class="accent-shell">Drawn</span>',
    subtitle: "Understanding resolution order: role defaults, group_vars, host_vars, play vars, and extra vars.",
    date: "February 2027",
    sectionsHtml,
    sourcesHtml
  });

  fs.writeFileSync(path.join(STATIC_DIR, `${slug}.html`), html, 'utf-8');
  console.log(`Generated public/static/${slug}.html`);
  injectBannerIntoMarkdown(mdFile, slug, "INTERACTIVE VARIABLE HIERARCHY · THE 22-LEVEL PRECEDENCE LADDER", "#6366F1");
}
