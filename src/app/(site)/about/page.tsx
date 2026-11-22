import type { Metadata } from 'next';
import Link from 'next/link';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowRight,
  faAward,
  faBolt,
  faBriefcase,
  faChartLine,
  faCloud,
  faCodeBranch,
  faDatabase,
  faDisplay,
  faEnvelope,
  faEye,
  faFileArrowDown,
  faGraduationCap,
  faHeadset,
  faLocationDot,
  faNetworkWired,
  faNewspaper,
  faServer,
  faShieldHalved,
  faTerminal,
  faUpRightFromSquare,
} from '@fortawesome/free-solid-svg-icons';
import { faGithub, faLinkedin } from '@fortawesome/free-brands-svg-icons';

/* This page is the portfolio. It used to be a separate site on
   pushpendra.overflowbyte.tech; that subdomain now redirects here. */

export const metadata: Metadata = {
  title: 'Pushpendra Dev — System Administrator & Infrastructure Engineer | OverflowByte',
  description:
    'Portfolio of Pushpendra Dev: enterprise infrastructure, FortiGate SD-WAN, AWS, Kubernetes, Windows and Linux operations, monitoring and automation. Experience, projects, certifications and resume.',
  alternates: { canonical: '/about' },
};

const RESUME = '/pushpendra-resume.pdf';
const LINKEDIN = 'https://www.linkedin.com/in/pushpendra16/';
const GITHUB = 'https://github.com/Push1697';
const EMAIL = 'push1697@gmail.com';

const METRICS = [
  { label: 'Office rollout', value: '400+ seats' },
  { label: 'Enterprise migrations', value: '100+' },
  { label: 'SLA compliance', value: '95%+' },
  { label: 'Infrastructure experience', value: '3 years' },
];

const APPROACH = [
  {
    icon: faNetworkWired,
    title: 'Implement',
    body: 'Planning, installation, configuration, testing, and operational handover.',
  },
  {
    icon: faChartLine,
    title: 'Operate',
    body: 'Monitoring, incident ownership, RCA, SLA support, and service continuity.',
  },
  {
    icon: faBolt,
    title: 'Improve',
    body: 'Automation, preventive troubleshooting, resilient design, and documentation.',
  },
];

const EXPERIENCE = [
  {
    role: 'System Administrator',
    company: 'Programmers.io',
    period: 'Aug 2026 — Present',
    location: 'Jaipur, Rajasthan',
    points: [
      'Administer enterprise Windows and Linux infrastructure, server environments, and IT operations',
      'Manage access control, identity lifecycle, endpoint compliance, and system security posture',
      'Proactively monitor infrastructure health, backup retention, and service availability',
      'Handle L2/L3 system, virtualization, and cross-platform operational escalations',
    ],
  },
  {
    role: 'Infrastructure System Engineer',
    company: 'The House of Shubhashish',
    period: 'Apr 2026 — Aug 2026',
    location: 'Jaipur, Rajasthan',
    points: [
      'Contributed to end-to-end infrastructure implementation for a new 400+ seat office',
      'Deploy and troubleshoot network racks, switches, access points, leased lines, endpoints, and link failover',
      'Configure FortiGate SD-WAN policy routing for path-specific traffic control',
      'Implemented Zoho Desk L1/L2/L3 SLA workflows, Poly Studio, HDMI-over-CAT6, and Zoom Rooms',
    ],
  },
  {
    role: 'IT Support Engineer',
    company: 'Bill Gosling Outsourcing India',
    period: 'Feb 2026 — Mar 2026',
    location: 'Jaipur, Rajasthan',
    points: [
      'Supported workstation operations in a high-volume contact-center environment',
      'Resolved Windows, application, hardware, network, and VPN issues',
      'Supported onboarding, seat moves, device replacement, and infrastructure escalations',
    ],
  },
  {
    role: 'Server Administrator / Cloud Operations Engineer',
    company: 'Webspiders Interweb Pvt. Ltd.',
    period: 'Sep 2023 — Nov 2025',
    location: 'Jaipur, Rajasthan',
    points: [
      'Led L1 support and escalated L2 incident handling with 95%+ SLA compliance',
      'Completed 100+ Microsoft 365 and Google Workspace migrations',
      'Administered AWS, Zabbix, Windows/Linux, IIS, Plesk, DNS, SSL, firewalls, and VPN',
      'Automated repetitive operations with n8n and Bash; created SOPs and knowledge-base articles',
    ],
  },
  {
    role: 'AWS & System Administration Intern',
    company: 'LinuxWorld Informatics Pvt. Ltd.',
    period: 'Jul 2023 — Sep 2023',
    location: 'Remote',
    points: [
      'Practiced AWS EC2, S3, VPC, IAM, and CloudWatch',
      'Worked with Linux administration, shell commands, logs, and network troubleshooting',
      'Learned Terraform, Ansible, Docker, Git, and foundational CI/CD workflows',
    ],
  },
];

const CAPABILITIES: { icon: IconDefinition; title: string; items: string[] }[] = [
  {
    icon: faServer,
    title: 'Enterprise infrastructure',
    items: ['400+ seat rollout', 'Structured cabling', 'Network racks', 'Leased lines', 'Link failover', 'Endpoints', 'Asset lifecycle', 'Vendor coordination'],
  },
  {
    icon: faShieldHalved,
    title: 'Networking & security',
    items: ['LAN / WAN', 'TCP/IP', 'FortiGate', 'SD-WAN', 'VPN', 'DNS', 'DHCP', 'Wireless APs'],
  },
  {
    icon: faCloud,
    title: 'Cloud & DevOps',
    items: ['AWS', 'Docker', 'Kubernetes', 'Terraform', 'Ansible', 'CI/CD', 'GitHub Actions', 'GitOps'],
  },
  {
    icon: faTerminal,
    title: 'Systems & operations',
    items: ['Windows Server', 'Linux', 'IIS', 'Plesk', 'Nginx', 'SSL', 'MySQL', 'MSSQL'],
  },
  {
    icon: faChartLine,
    title: 'Monitoring & automation',
    items: ['Zabbix', 'Prometheus', 'CloudWatch', 'n8n', 'Bash', 'PowerShell', 'Alerts', 'RCA'],
  },
  {
    icon: faDisplay,
    title: 'Workplace technology',
    items: ['Microsoft 365', 'Google Workspace', 'Poly Studio', 'Zoom Rooms', 'HDMI over CAT6', 'Onboarding', 'Policies', 'Zoho Desk'],
  },
];

const PROJECTS: { icon: IconDefinition; title: string; body: string; tags: string[]; href?: string; cta?: string }[] = [
  {
    icon: faCloud,
    title: 'Secure AWS Infrastructure',
    body: 'Terraform-built VPC with private application subnets, ALB, Auto Scaling, automated provisioning, and GitHub Actions deployment through OIDC.',
    tags: ['AWS', 'Terraform', 'OIDC', 'ALB', 'ASG'],
    href: '/notes/nacl-vs-security-groups-on-aws',
    cta: 'Related note',
  },
  {
    icon: faBolt,
    title: 'Production n8n Deployment',
    body: 'Docker Compose, reverse proxy, SSL, persistent data, security hardening, troubleshooting, and operational documentation.',
    tags: ['Docker', 'n8n', 'Nginx', 'SSL'],
    href: '/blog/the-comprehensive-guide-to-deploying-n8n-in-production-a-docker-deployment-journey',
    cta: 'Read case study',
  },
  {
    icon: faDatabase,
    title: 'Nextcloud on AWS',
    body: 'Reproducible Nextcloud, PostgreSQL, and document-server infrastructure with AMI recovery and cost-aware lifecycle operations.',
    tags: ['AWS', 'Nextcloud', 'PostgreSQL', 'Nginx'],
  },
  {
    icon: faCodeBranch,
    title: 'Kubernetes GitOps Pipeline',
    body: 'Self-managed Kubernetes on AWS with Jenkins CI, SonarQube and Trivy scanning, and declarative delivery through Argo CD.',
    tags: ['Kubernetes', 'Jenkins', 'Argo CD', 'Trivy'],
    href: '/blog/beginners-guide-to-building-a-professional-cicd-pipeline-from-scratch',
    cta: 'Related article',
  },
  {
    icon: faChartLine,
    title: 'Preventive Monitoring',
    body: 'Zabbix and Prometheus infrastructure monitoring with service-health automation and Slack/email alert workflows.',
    tags: ['Zabbix', 'Prometheus', 'Linux', 'Automation'],
  },
  {
    icon: faNetworkWired,
    title: 'Talos Linux Cluster Lab',
    body: 'Isolated Talos cluster using a dual-homed jump host, SSH tunnelling, and documented Flannel and CoreDNS troubleshooting.',
    tags: ['Talos', 'Kubernetes', 'Networking', 'Bastion'],
    href: '/notes/when-two-nodes-share-one-ip-fixing-flannel-and-coredns-on-talos-kubernetes',
    cta: 'Read the write-up',
  },
];

const LEARNING: { icon: IconDefinition; title: string; status: string; items: string[] }[] = [
  {
    icon: faNetworkWired,
    title: 'Cloud-native infrastructure',
    status: 'Lab practice',
    items: ['Advanced Kubernetes', 'Talos Linux', 'Helm', 'GitOps', 'Cluster networking', 'Production troubleshooting'],
  },
  {
    icon: faHeadset,
    title: 'Contact-center technology',
    status: 'Actively learning',
    items: ['SIP', 'VoIP', 'PRI', 'IVR', 'ACD', 'CTI'],
  },
  {
    icon: faCloud,
    title: 'AWS architecture',
    status: 'Actively learning',
    items: ['Solutions Architect Associate', 'Resilient architecture', 'Secure IaC', 'Auto scaling', 'Monitoring', 'Cost optimization'],
  },
];

const SHELF = [
  {
    kind: 'Paper',
    title: 'The Story of AWS Glue',
    by: 'Mohit Saxena et al., AWS',
    href: 'https://drive.google.com/file/d/1aBOYX0yWdl_nkmguj0MW_nxqtqjY1i6H/view?usp=sharing',
  },
  {
    kind: 'Course',
    title: 'AWS Certified Solutions Architect — Associate',
    by: 'Stephane Maarek',
    href: 'https://www.udemy.com/course/aws-certified-solutions-architect-associate-saa-c03/',
  },
  {
    kind: 'Videos',
    title: 'Kubernetes & DevOps deep dives',
    by: 'TechWorld with Nana',
    href: 'https://www.youtube.com/@TechWorldwithNana',
  },
];

const CERTIFICATIONS = [
  'AWS Certified Cloud Practitioner',
  'Google Cloud Certified Professional Google Workspace Administrator',
  'GitHub Foundations',
  'IT Security — Google / Coursera',
  'Technical Support Fundamentals — Google / Coursera',
  'Advanced DevOps & Cloud Technologies — ARTH',
  'AWS Solutions Architect Associate — Pursuing',
];

const EDUCATION = [
  {
    degree: 'Bachelor of Technology, Computer Science',
    school: 'Suresh Gyan Vihar University',
    detail: '2022 — 2026',
  },
  {
    degree: 'Diploma, Computer Science & Engineering',
    school: 'Suresh Gyan Vihar University',
    detail: '2019 — 2022 · CGPA 7.60 / 10',
  },
];

const PILLARS = [
  {
    icon: faTerminal,
    color: 'var(--accent)',
    title: 'Reality-first engineering',
    body: 'No hand-waving abstractions. We trace down to the C structs in linux/sched.h, VFS inodes and real syscall sequences.',
  },
  {
    icon: faShieldHalved,
    color: 'var(--ok)',
    title: 'Defense in depth',
    body: 'From AWS VPC subnet NACLs to local Linux DAC and capabilities like CAP_DAC_OVERRIDE, security gets verified end to end.',
  },
  {
    icon: faEye,
    color: 'var(--info)',
    title: 'Visual intuition',
    body: 'Hard concepts land faster through animated state diagrams, interactive bit grids and repeatable lab drills.',
  },
];

function SectionHead({ id, title, children }: { id: string; title: string; children?: React.ReactNode }) {
  return (
    <div className="section-head reveal">
      <div>
        <h2 id={id}>{title}</h2>
        {children && <p>{children}</p>}
      </div>
    </div>
  );
}

function Tags({ items }: { items: string[] }) {
  return (
    <div className="cluster" style={{ marginTop: '0.9rem', ['--cluster-gap' as string]: '0.4rem' }}>
      {items.map((item) => (
        <span key={item} className="tag">
          {item}
        </span>
      ))}
    </div>
  );
}

export default function AboutPage() {
  return (
    <div className="shell section" style={{ maxWidth: '1000px' }}>
      <header style={{ marginBottom: 'clamp(2rem, 5vw, 3rem)' }}>
        <div className="cluster" style={{ alignItems: 'center', ['--cluster-gap' as string]: '1.5rem' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/pushpendra.webp"
            alt="Pushpendra Dev"
            width={112}
            height={112}
            style={{ borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--accent)' }}
          />
          <div style={{ flex: '1 1 20rem' }}>
            <p className="eyebrow">
              <FontAwesomeIcon icon={faServer} className="fa-ico" />
              Infrastructure · cloud · operations
            </p>
            <h1 className="gradient-text" style={{ fontSize: 'var(--step-5)', margin: '0.75rem 0 0.25rem' }}>
              Pushpendra Dev
            </h1>
            <p style={{ fontSize: 'var(--step-1)' }}>System Administrator · Infrastructure Engineer</p>
          </div>
        </div>

        <p className="lede" style={{ marginTop: '1.5rem' }}>
          I design, implement, troubleshoot, and operate the systems that keep modern workplaces
          connected — from enterprise networks and FortiGate routing to AWS infrastructure,
          Windows/Linux operations, automation, and cloud-native deployment. Then I write up the
          parts that are usually explained wrong.
        </p>
        <p className="meta" style={{ marginTop: '0.75rem' }}>
          <FontAwesomeIcon icon={faLocationDot} className="fa-ico" />
          Based in Jaipur, India · Open to infrastructure, cloud operations, DevOps &amp;
          implementation roles
        </p>

        <div className="cluster" style={{ marginTop: '1.75rem' }}>
          <a className="btn btn-primary" href={RESUME} download>
            <FontAwesomeIcon icon={faFileArrowDown} className="fa-ico" />
            Download resume
          </a>
          <a className="btn btn-secondary" href={LINKEDIN} target="_blank" rel="noopener noreferrer">
            <FontAwesomeIcon icon={faLinkedin} className="fa-ico" />
            LinkedIn
          </a>
          <a className="btn btn-secondary" href={GITHUB} target="_blank" rel="noopener noreferrer">
            <FontAwesomeIcon icon={faGithub} className="fa-ico" />
            GitHub
          </a>
          <a className="btn btn-secondary" href={`mailto:${EMAIL}`}>
            <FontAwesomeIcon icon={faEnvelope} className="fa-ico" />
            Email
          </a>
        </div>

        <dl className="stat-row">
          {METRICS.map(({ label, value }) => (
            <div key={label} className="stat">
              <dt>{label}</dt>
              <dd style={{ fontSize: 'var(--step-0)' }}>{value}</dd>
            </div>
          ))}
        </dl>
      </header>

      <section className="section-tight" aria-labelledby="profile">
        <SectionHead id="profile" title="Infrastructure from rack to cloud" />
        <div className="prose reveal" style={{ maxWidth: '70ch' }}>
          <p>
            I&apos;m an Infrastructure and Cloud Engineer with three years of experience across
            enterprise rollouts, networking, Windows and Linux systems, cloud operations, workplace
            technology, and SLA-driven support.
          </p>
          <p>
            Most recently, I contributed substantially to commissioning a new office designed for
            more than 400 users — covering switching, leased lines, <strong>FortiGate SD-WAN</strong>,
            wireless, endpoints, biometric systems, failover, and conference-room technology.
          </p>
          <p>
            I combine hands-on implementation and incident ownership with AWS, monitoring,
            automation, documentation, and modern deployment practices.
          </p>
        </div>
        <div className="grid grid-3" style={{ marginTop: '1.5rem' }}>
          {APPROACH.map(({ icon, title, body }) => (
            <div key={title} className="card card-pad card-quiet reveal">
              <FontAwesomeIcon icon={icon} className="fa-ico-lg" style={{ color: 'var(--accent)', marginBottom: '0.75rem' }} />
              <h3 style={{ fontSize: 'var(--step-1)', marginBottom: '0.5rem' }}>{title}</h3>
              <p className="text-muted" style={{ fontSize: 'var(--step--1)' }}>
                {body}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="section-tight" aria-labelledby="experience">
        <SectionHead id="experience" title="Experience">
          Systems operated, impact delivered.
        </SectionHead>
        <div style={{ display: 'grid', gap: '1.25rem' }}>
          {EXPERIENCE.map((job, i) => (
            <article key={job.company} className="card card-pad reveal">
              <div className="cluster" style={{ justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span className={`badge ${i === 0 ? 'badge-ok' : 'badge-neutral'}`}>
                  {i === 0 && <span className="live-dot" aria-hidden="true" />}
                  {i === 0 ? 'Current' : job.period.split(' — ')[1]}
                </span>
                <span className="meta">
                  <FontAwesomeIcon icon={faBriefcase} className="fa-ico" />
                  {job.period} · {job.location}
                </span>
              </div>
              <h3 style={{ fontSize: 'var(--step-1)' }}>{job.role}</h3>
              <p style={{ color: 'var(--accent)', marginBottom: '0.75rem' }}>{job.company}</p>
              <ul className="text-muted" style={{ fontSize: 'var(--step--1)', paddingLeft: '1.1rem', display: 'grid', gap: '0.35rem' }}>
                {job.points.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="section-tight" aria-labelledby="capabilities">
        <SectionHead id="capabilities" title="Capabilities">
          The day job behind the writing — production systems, not demo environments.
        </SectionHead>
        <div className="grid grid-2 deck-grid">
          {CAPABILITIES.map(({ icon, title, items }) => (
            <div key={title} className="card card-pad card-interactive deck reveal">
              <FontAwesomeIcon icon={icon} className="fa-ico-lg" style={{ color: 'var(--accent)', marginBottom: '0.75rem' }} />
              <h3 style={{ fontSize: 'var(--step-1)' }}>{title}</h3>
              <Tags items={items} />
            </div>
          ))}
        </div>
      </section>

      <section className="section-tight" aria-labelledby="projects">
        <SectionHead id="projects" title="Projects">
          Infrastructure in practice.
        </SectionHead>
        <div className="grid grid-2 deck-grid">
          {PROJECTS.map(({ icon, title, body, tags, href, cta }, i) => (
            <article key={title} className="card card-pad card-interactive reveal">
              <div className="cluster" style={{ justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span className="badge badge-neutral">{String(i + 1).padStart(2, '0')}</span>
                <FontAwesomeIcon icon={icon} className="fa-ico-lg" style={{ color: 'var(--accent)' }} />
              </div>
              <h3 style={{ fontSize: 'var(--step-1)', marginBottom: '0.5rem' }}>{title}</h3>
              <p className="text-muted" style={{ fontSize: 'var(--step--1)' }}>
                {body}
              </p>
              <Tags items={tags} />
              {href && (
                <div style={{ marginTop: '1rem' }}>
                  <Link className="action-link" href={href}>
                    {cta}
                    <FontAwesomeIcon icon={faArrowRight} className="fa-ico" />
                  </Link>
                </div>
              )}
            </article>
          ))}
        </div>
      </section>

      <section className="section-tight" aria-labelledby="learning">
        <SectionHead id="learning" title="Learning now">
          Expanding the operating surface.
        </SectionHead>
        <div className="grid grid-3">
          {LEARNING.map(({ icon, title, status, items }) => (
            <div key={title} className="card card-pad card-quiet reveal">
              <div className="cluster" style={{ justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <FontAwesomeIcon icon={icon} className="fa-ico-lg" style={{ color: 'var(--accent)' }} />
                <span className="badge badge-accent">{status}</span>
              </div>
              <h3 style={{ fontSize: 'var(--step-1)' }}>{title}</h3>
              <Tags items={items} />
            </div>
          ))}
        </div>

        <div className="card card-pad card-quiet reveal" style={{ marginTop: '1.5rem' }}>
          <p className="text-muted" style={{ fontSize: 'var(--step--1)', marginBottom: '0.75rem' }}>
            This week&apos;s focus: Talos Linux cluster networking and GitOps workflows for the AWS
            Solutions Architect track. On the shelf:
          </p>
          <ul style={{ display: 'grid', gap: '0.5rem', listStyle: 'none', padding: 0 }}>
            {SHELF.map(({ kind, title, by, href }) => (
              <li key={title} className="cluster" style={{ ['--cluster-gap' as string]: '0.6rem' }}>
                <span className="badge badge-neutral">{kind}</span>
                <a className="action-link" href={href} target="_blank" rel="noopener noreferrer">
                  {title}
                  <FontAwesomeIcon icon={faUpRightFromSquare} className="fa-ico" />
                </a>
                <span className="meta">{by}</span>
              </li>
            ))}
          </ul>
          <div className="cluster" style={{ marginTop: '1.25rem' }}>
            <Link className="btn btn-secondary btn-sm" href="/notes">
              Notes &amp; labs
              <FontAwesomeIcon icon={faArrowRight} className="fa-ico" />
            </Link>
            <Link className="btn btn-secondary btn-sm" href="/learn">
              Flashcards
            </Link>
          </div>
        </div>
      </section>

      <section className="section-tight" aria-labelledby="credentials">
        <SectionHead id="credentials" title="Certifications & education" />
        <div className="grid grid-2">
          <div className="card card-pad reveal">
            <h3 style={{ fontSize: 'var(--step-1)', marginBottom: '0.75rem' }}>
              <FontAwesomeIcon icon={faAward} className="fa-ico" style={{ color: 'var(--accent)' }} /> Certifications
            </h3>
            <ul className="text-muted" style={{ fontSize: 'var(--step--1)', paddingLeft: '1.1rem', display: 'grid', gap: '0.35rem' }}>
              {CERTIFICATIONS.map((cert) => (
                <li key={cert}>{cert}</li>
              ))}
            </ul>
          </div>
          <div className="card card-pad reveal">
            <h3 style={{ fontSize: 'var(--step-1)', marginBottom: '0.75rem' }}>
              <FontAwesomeIcon icon={faGraduationCap} className="fa-ico" style={{ color: 'var(--accent)' }} /> Education
            </h3>
            <div style={{ display: 'grid', gap: '1rem' }}>
              {EDUCATION.map(({ degree, school, detail }) => (
                <div key={degree}>
                  <p style={{ fontWeight: 600 }}>{degree}</p>
                  <p className="text-muted" style={{ fontSize: 'var(--step--1)' }}>
                    {school}
                  </p>
                  <p className="meta">{detail}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section-tight" aria-labelledby="writing">
        <SectionHead id="writing" title="How this site is written">
          Three rules every explainer here has to pass.
        </SectionHead>
        <div className="grid grid-3">
          {PILLARS.map(({ icon, color, title, body }) => (
            <div key={title} className="card card-pad card-quiet reveal">
              <FontAwesomeIcon icon={icon} className="fa-ico-lg" style={{ color, marginBottom: '0.75rem' }} />
              <h3 style={{ fontSize: 'var(--step-1)', marginBottom: '0.5rem' }}>{title}</h3>
              <p className="text-muted" style={{ fontSize: 'var(--step--1)' }}>
                {body}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section
        id="contact"
        className="card card-pad card-feature spotlight reveal"
        style={{ marginTop: 'clamp(1.5rem, 4vw, 2rem)', textAlign: 'center' }}
      >
        <h2 style={{ fontSize: 'var(--step-3)', marginBottom: '0.6rem' }}>
          Let&apos;s build infrastructure that stays ready
        </h2>
        <p className="text-muted" style={{ maxWidth: '56ch', margin: '0 auto 0.75rem' }}>
          I&apos;m open to infrastructure engineering, cloud operations, implementation, DevOps, and
          enterprise support opportunities.
        </p>
        <p className="meta" style={{ marginBottom: '1.5rem' }}>
          <FontAwesomeIcon icon={faLocationDot} className="fa-ico" />
          Jaipur, Rajasthan, India · Open to relocation &amp; rotational / follow-the-sun shifts
        </p>
        <div className="cluster" style={{ justifyContent: 'center' }}>
          <a className="btn btn-primary" href={`mailto:${EMAIL}`}>
            <FontAwesomeIcon icon={faEnvelope} className="fa-ico" />
            {EMAIL}
          </a>
          <a className="btn btn-secondary" href={RESUME} download>
            <FontAwesomeIcon icon={faFileArrowDown} className="fa-ico" />
            Download resume
          </a>
          <a className="btn btn-secondary" href={LINKEDIN} target="_blank" rel="noopener noreferrer">
            <FontAwesomeIcon icon={faLinkedin} className="fa-ico" />
            LinkedIn
          </a>
        </div>
        <div className="cluster" style={{ justifyContent: 'center', marginTop: '1rem' }}>
          <Link className="action-link" href="/blog">
            <FontAwesomeIcon icon={faNewspaper} className="fa-ico" />
            Read the articles
          </Link>
          <Link className="action-link" href="/newsletter">
            Weekly newsletter
            <FontAwesomeIcon icon={faArrowRight} className="fa-ico" />
          </Link>
        </div>
      </section>
    </div>
  );
}
