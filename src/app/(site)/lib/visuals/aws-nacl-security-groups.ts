import type { Visual } from '../visuals';
import { assertCascadeComplete } from '../visuals';

export const VISUALS: Visual[] = [
  {
    id: 'vpc-packet-path',
    kind: 'stages',
    title: 'The packet path through a VPC, request and reply',
    caption:
      'Both firewalls must allow the request in; on the way out the stateful SG waves the reply through but the stateless NACL re-checks it — that is where timeouts are born.',
    stages: [
      {
        title: 'Internet gateway',
        body: 'Entry point for public traffic; no filtering here.',
        arrow: 'packet enters the VPC',
        tone: 'info',
      },
      {
        title: 'Route table',
        body: 'VPC router forwards to the destination subnet based on CIDR. No allow/deny semantics.',
        arrow: 'routed to subnet',
        tone: 'info',
      },
      {
        title: 'NACL inbound (subnet)',
        body: 'Stateless, numbered rules, first match wins. Must allow the request port from the client CIDR.',
        arrow: 'NACL ingress allows',
        tone: 'accent',
      },
      {
        title: 'Security group inbound (ENI)',
        body: 'Stateful, allow-only. Must allow the request port from its source (IP, prefix list, or another SG).',
        arrow: 'SG ingress allows',
        tone: 'accent',
      },
      {
        title: 'Instance receives the request',
        body: 'Application answers. The reply now travels back out.',
        arrow: 'reply generated',
        tone: 'ok',
      },
      {
        title: 'Security group outbound (ENI)',
        body: 'Stateful: the tracked connection means the reply is allowed automatically. No outbound rule needed.',
        arrow: 'SG egress automatic',
        tone: 'ok',
      },
      {
        title: 'NACL outbound (subnet)',
        body: 'Stateless: the reply is checked as brand-new traffic and must match an egress rule — typically TCP 1024-65535 for ephemeral client ports. Missing rule = drop = timeout.',
        arrow: 'NACL egress must explicitly allow',
        tone: 'warn',
      },
      {
        title: 'Back through the internet gateway to the client',
        body: 'The client’s browser used an ephemeral source port (e.g. 51432); the reply’s destination port is that port, never 443.',
        arrow: 'reply delivered',
        tone: 'info',
      },
    ],
  },
  {
    id: 'nacl-rule-evaluation',
    kind: 'cascade',
    title: 'NACL ingress rule evaluation on the public subnet',
    caption:
      'Rules are checked from the lowest number up and the first match wins — a deny numbered after a matching allow is never even read.',
    checks: [
      { id: 'r90', title: 'Rule 90', test: 'DENY all protocols from 203.0.113.0/24' },
      { id: 'r100', title: 'Rule 100', test: 'ALLOW TCP 443 from 0.0.0.0/0' },
      { id: 'r110', title: 'Rule 110', test: 'ALLOW TCP 1024-65535 from 0.0.0.0/0' },
      { id: 'star', title: 'Rule *', test: 'DENY everything else (cannot be deleted)' },
    ],
    subjects: [
      {
        id: 'attacker',
        label: 'Attacker 203.0.113.10 to port 443',
        detail: 'Packet from the abusive TEST-NET range',
        results: {
          r90: { state: 'fail', note: 'matches the deny — evaluation stops here' },
          r100: { state: 'skip', note: 'never read' },
          r110: { state: 'skip', note: 'never read' },
          star: { state: 'skip', note: 'never read' },
        },
        granted: false,
        verdict: 'Dropped at rule 90',
      },
      {
        id: 'legit-https',
        label: 'Legitimate client 198.51.100.7 to port 443',
        detail: 'Normal browser request',
        results: {
          r90: { state: 'skip', note: 'CIDR does not match, continue' },
          r100: { state: 'pass', note: 'matches the allow — evaluation stops here' },
          r110: { state: 'skip', note: 'never read' },
          star: { state: 'skip', note: 'never read' },
        },
        granted: true,
        verdict: 'Allowed at rule 100',
      },
      {
        id: 'ephemeral-return',
        label: 'Return traffic to an instance-initiated connection',
        detail: 'E.g. yum response arriving at instance port 51432',
        results: {
          r90: { state: 'skip', note: 'CIDR does not match, continue' },
          r100: { state: 'skip', note: 'port 443 rule does not match port 51432' },
          r110: { state: 'pass', note: 'ephemeral range allow matches' },
          star: { state: 'skip', note: 'never read' },
        },
        granted: true,
        verdict: 'Allowed at rule 110',
      },
      {
        id: 'other-port',
        label: 'Client 198.51.100.7 to port 22',
        detail: 'SSH attempt that no rule allows',
        results: {
          r90: { state: 'skip', note: 'CIDR does not match' },
          r100: { state: 'skip', note: 'not port 443' },
          r110: { state: 'skip', note: 'not in 1024-65535' },
          star: { state: 'fail', note: 'catch-all deny fires' },
        },
        granted: false,
        verdict: 'Dropped at rule *',
      },
    ],
  },
  {
    id: 'stateful-vs-stateless-reply',
    kind: 'compare',
    title: 'The same reply, two firewalls',
    caption:
      'The SG remembers the connection it allowed; the NACL has no memory and re-checks every packet — so the reply needs an explicit egress rule for the client’s ephemeral port.',
    columns: [
      {
        title: 'Security group (stateful)',
        subtitle: 'guards the ENI',
        lines: [
          'inbound request to tcp 443 allowed by SG rule',
          'SG records the connection in its state table',
          'reply leaves the ENI with no outbound rule needed',
          'client receives the response',
        ],
        mark: 'no outbound rule needed',
        markTone: 'ok',
        outcome: 'One inbound rule is enough; the reply is waved through because the SG tracks the connection.',
        ok: true,
      },
      {
        title: 'Network ACL (stateless)',
        subtitle: 'guards the subnet',
        lines: [
          'inbound request passed NACL rule 100',
          'reply checked as brand-new traffic',
          'no egress rule for destination port 51432',
          'reply dropped at the NACL; client sees timeout',
        ],
        mark: 'dropped at the NACL',
        markTone: 'bad',
        outcome: 'Needs an explicit egress allow for TCP 1024-65535; otherwise the reply dies one layer out.',
        ok: false,
      },
    ],
  },
  {
    id: 'sg-vs-nacl-matrix',
    kind: 'matrix',
    title: 'Security group vs network ACL, side by side',
    caption:
      'SGs do the fine-grained, app-aware access control; NACLs are the coarse subnet fence that can explicitly deny.',
    headers: ['Feature', 'Security Group', 'Network ACL'],
    rows: [
      { cells: ['Operates at', 'Instance / ENI', 'Subnet'] },
      { cells: ['State', 'Stateful: replies allowed automatically', 'Stateless: both directions need rules'], emphasis: true },
      { cells: ['Rule types', 'Allow only', 'Allow and deny'] },
      { cells: ['Evaluation', 'All rules together, any allow wins', 'Lowest number first, first match wins'] },
      { cells: ['A new one blocks', 'All inbound (outbound open)', 'Everything, both ways (custom NACL)'] },
      { cells: ['VPC default', 'Inbound from same SG, all outbound', 'Allow all, both ways'] },
      { cells: ['Can reference', 'IPs, prefix lists, other SGs', 'CIDR blocks only'] },
      { cells: ['Attachment', 'Up to 5 per ENI (max 16)', 'Exactly 1 per subnet'] },
      { cells: ['Rules per direction (default)', '60', '20'] },
      { cells: ['Best at', 'Fine-grained, app-aware access', 'Subnet guardrails, explicit blocks'] },
    ],
  },
];

// Fail the build if a cascade subject is missing a verdict for one of the
// checks — that would otherwise ship as a silently blank row.
for (const viz of VISUALS) {
  if (viz.kind === 'cascade') {
    const problems = assertCascadeComplete(viz);
    if (problems.length > 0) throw new Error(problems.join('; '));
  }
}

/** Visuals keyed by blog post slug, rendered on the article page. */
export const POST_VISUALS: Record<string, Visual[]> = {
  '03-port-443-is-open-in-security-group-why-timeout': VISUALS,
};
