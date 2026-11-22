/**
 * Videos from youtube.com/@overflowbyte and the pages that embed them.
 * Pages are "<section>/<slug>", where section is blog, notes or newsletter.
 * To add a video: append it here with the pages it belongs on.
 */
export const YOUTUBE_CHANNEL = 'https://www.youtube.com/@overflowbyte';

export type Video = {
  id: string;
  title: string;
  /** Upload date, YYYY-MM-DD. */
  date: string;
  pages: string[];
};

export const VIDEOS: Video[] = [
  {
    id: 'WxCOK2QE1wE',
    title: 'Kubernetes Control Plane Explained Simply: API Server, etcd, Scheduler, Kubelet',
    date: '2026-11-22',
    pages: [
      'blog/copy-fail-kubectl-escape-kubernetes',
      'blog/resolving-ip-conflicts-in-talos-kubernetes-a-step-by-step-guide',
      'notes/kubernetes-etcd-architecture-snapshots-and-controller-internals',
      'notes/when-two-nodes-share-one-ip-fixing-flannel-and-coredns-on-talos-kubernetes',
      'newsletter/overflowbyte-weekly-2026-11-22',
    ],
  },
  {
    id: '96AsoklBkz0',
    title: 'IPsec Explained in Easy way: Phase 1, Phase 2 & ESP — A Private Tunnel Inside the Internet',
    date: '2026-11-03',
    pages: ['newsletter/overflowbyte-weekly-2026-11-15'],
  },
  {
    id: 'ZAtUWwpLhgA',
    title: 'How DNS Works — Root, TLD, Authoritative Servers, Caching & TTL (Step by Step)',
    date: '2026-11-03',
    pages: [
      'blog/comprehensive-dns-propagation-checker-and-deep-trace-tool-2025-guide',
      'newsletter/overflowbyte-weekly-2026-11-15',
    ],
  },
  {
    id: 'oAbLFxYlxvU',
    title: 'Why Your Backend Crashes: Ephemeral Port Exhaustion!',
    date: '2026-11-03',
    pages: [
      'blog/03-port-443-is-open-in-security-group-why-timeout',
      'notes/nacl-vs-security-groups-on-aws',
      'newsletter/overflowbyte-weekly-2026-11-15',
    ],
  },
  {
    id: 'i-60_75Hxus',
    title: 'AWS Timeouts Explained: NACLs, Security Groups and Ephemeral Ports',
    date: '2026-10-19',
    pages: [
      'blog/03-port-443-is-open-in-security-group-why-timeout',
      'notes/nacl-vs-security-groups-on-aws',
    ],
  },
  {
    id: '9nC7zRZYG1U',
    title: 'Create AWS Key Pairs in 10 Minutes | KodeKloud AWS Challenge Day 1 (Hindi)',
    date: '2025-12-07',
    pages: [],
  },
  {
    id: 'BMBbaIMspis',
    title: 'How to Manage Pull Requests Like a Pro | 100 Days of DevOps (Day 29)',
    date: '2025-12-02',
    pages: ['blog/beginners-guide-to-building-a-professional-cicd-pipeline-from-scratch'],
  },
  {
    id: 'AZln6ILIWz4',
    title: 'Virtualization Explained in Hindi | Types, Benefits & How it Powers Cloud Computing',
    date: '2025-04-02',
    pages: [
      'blog/05-rhel-lab-wreck-and-reset-in-seconds',
      'notes/virtualization-a-fun-and-simplified-guide-for-college-students-in-hindi',
      'notes/building-a-three-node-rhel-lab-on-kvm',
    ],
  },
  {
    id: 'codc5SG7qH4',
    title: 'How to Add Users in Office 365 | Assign Licenses & Create Accounts',
    date: '2024-06-26',
    pages: ['blog/11-mobile-access-runbook-m365-phones'],
  },
  {
    id: 'Kt2OQV10RZU',
    title: 'How to install MySQL server in Ubuntu server',
    date: '2024-05-19',
    pages: ['notes/mysql-administration-guide'],
  },
  {
    id: '7OGUaZ68vpw',
    title: 'How to Create a Windows AWS EC2 Instance and Change the RDP Port',
    date: '2024-04-03',
    pages: [],
  },
  {
    id: 'c5Nr-SETwG8',
    title: 'Step-by-Step Guide: Creating an EC2 Instance in AWS',
    date: '2024-03-01',
    pages: [],
  },
];

export function videosFor(section: 'blog' | 'notes' | 'newsletter', slug: string): Video[] {
  const page = `${section}/${slug}`;
  return VIDEOS.filter((v) => v.pages.includes(page));
}

/** Newest uploads first. */
export function latestVideos(count: number): Video[] {
  return [...VIDEOS].sort((a, b) => b.date.localeCompare(a.date)).slice(0, count);
}
