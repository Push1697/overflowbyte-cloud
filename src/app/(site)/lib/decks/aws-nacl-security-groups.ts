import type { Deck } from '../questions';

export const DECK: Deck = {
  slug: 'aws-nacl-security-groups',
  title: 'AWS NACLs vs security groups',
  summary:
    'Nine scenarios on the VPC packet path: stateful SG versus stateless NACL, the ephemeral port trap, first-match-wins rule numbering, and diagnosing REJECTs with Flow Logs and Reachability Analyzer.',
  series: 'Cloud Networking',
  cards: [
    {
      id: 'reply-dropped-at-nacl',
      tag: 'Scenario 1',
      topic: 'Stateful vs stateless',
      difficulty: 'trap',
      scenario:
        'A web server in a public subnet has SG inbound TCP 443 from 0.0.0.0/0 and SG outbound all. The NACL allows inbound 443 but its outbound rules were never edited from a restrictive custom NACL. Browsers hang; the SG looks perfect.',
      question:
        'Why does the reply never reach the client, and which single NACL rule fixes it?',
      answer: [
        '**The security group is stateful, the NACL is not.** The SG remembers the inbound connection and lets the reply out; the NACL checks the reply as brand-new traffic and drops it because no outbound rule allows it. The user sees a timeout even though every SG check is green.',
        '**The fix is one NACL egress rule allowing the ephemeral range**: TCP 1024–65535 to 0.0.0.0/0. The reply’s destination port is the client’s ephemeral source port (e.g. 51432), not 443.',
        'In VPC Flow Logs this signature is inbound ACCEPT followed by outbound REJECT — the stateless trap.',
      ],
    },
    {
      id: 'ephemeral-port-ranges',
      tag: 'Scenario 2',
      topic: 'Ephemeral ports',
      difficulty: 'core',
      scenario:
        'An instance runs `yum update` over 443 through a NAT gateway, and updates stall halfway. The NACL allows inbound 443 but nothing else.',
      question:
        'Why do the package downloads fail, and which inbound NACL rule range covers every client type?',
      answer: [
        '**Responses from the internet come back to an ephemeral port on the instance**, not to 443 — the instance initiated the connection from a random source port. The NACL, being stateless, must explicitly allow that inbound range.',
        'Linux uses 32768–60999, Windows 49152–65535, ELB/NAT gateways 1024–65535 — so **allowing TCP 1024–65535 covers every client type** in both directions.',
        'The same logic explains why the web-server reply left to a client port like 51432: the service port is the *source* of the reply, never its destination.',
      ],
    },
    {
      id: 'deny-after-allow-never-fires',
      tag: 'Scenario 3',
      topic: 'NACL rule order',
      difficulty: 'trap',
      scenario:
        'During an incident you add a NACL deny for 203.0.113.0/24 as rule number 200, while rule 100 already allows all traffic from 0.0.0/0. The abusive range keeps connecting.',
      question:
        'Why does the deny never fire, and what numbering habit prevents this class of mistake?',
      answer: [
        '**NACL rules are evaluated from the lowest number up and the first match wins** — evaluation stops at the first hit. Rule 100 (allow all) matches the attacker’s packet before rule 200 is ever read, so the deny is dead weight.',
        '**Renumber the deny below every matching allow (e.g. 90)** and it blocks as intended. The `*` rule at the bottom denies everything else and cannot be deleted.',
        'Number rules in **steps of 100** (100, 200, 300) so incidents leave a gap — slot 150 — without renumbering the whole table.',
      ],
    },
    {
      id: 'sg-cannot-deny',
      tag: 'Scenario 4',
      topic: 'Allow-only SGs',
      difficulty: 'trap',
      scenario:
        'You try to block one abusive IP by adding a "deny" rule to an instance’s security group, as you would on a traditional firewall.',
      question: 'Why is there no deny rule in a security group, and where must an explicit block live instead?',
      answer: [
        '**Security groups are allow-only**: anything not explicitly allowed is dropped, and there is no deny action to add. A specific IP block is impossible at the SG layer — the mental model from iptables does not transfer.',
        '**Explicit denies belong on the subnet’s NACL**, which supports allow *and* deny rules with numbered, first-match-wins evaluation. To stop traffic at the SG layer you remove the allow instead.',
        'For blocking more than a handful of ranges, graduate to AWS WAF or AWS Network Firewall — a default NACL’s 20 rules per direction run out fast.',
      ],
    },
    {
      id: 'empty-custom-nacl',
      tag: 'Scenario 5',
      topic: 'NACL defaults',
      difficulty: 'trap',
      scenario:
        'You create a fresh custom NACL, associate it with a public subnet, and the subnet goes completely dark — no traffic in or out — even though the instances’ security groups are unchanged.',
      question:
        'Why does an empty custom NACL block everything while the VPC default NACL blocks nothing?',
      answer: [
        '**A custom NACL starts with only the un-deletable `*` deny-all rule**; the VPC *default* NACL ships with allow-all rules both ways, which is why most people never notice NACLs exist.',
        '**Add the rules before associating the NACL** — at minimum inbound 443/ephemeral and outbound ephemeral/443 for a public subnet — or the subnet drops everything instantly.',
        'Exactly one NACL can be associated with a subnet, and a NACL can span many subnets — the attachment granularity is the opposite of security groups (up to 5 per ENI).',
      ],
    },
    {
      id: 'sg-references-scale',
      tag: 'Scenario 6',
      topic: 'SG references',
      difficulty: 'core',
      scenario:
        'A three-tier app has an ALB, an app tier that autoscales from 2 to 50 instances, and a database. The app SG allows TCP 8080 from the ALB’s SG ID; the DB SG allows TCP 3306 from the app SG ID.',
      question:
        'Why do SG-to-SG references keep the rules correct as the app tier scales, and what can a NACL reference instead?',
      answer: [
        '**SG rules can reference other security groups**, so "anything wearing sg-alb" is one rule no matter how many instances join or leave the ASG — no IP lists to maintain when the tier scales 2 to 50.',
        '**NACLs can reference CIDR blocks only** — no SG references, no prefix lists in the rule itself. That is why NACLs are the coarse outer fence (deny a bad range, subnet-wide guardrails) and SGs do the fine-grained, app-aware access control.',
        'SGs can also reference managed prefix lists and IPs; NACL rules per direction default to 20, SGs to 60.',
      ],
    },
    {
      id: 'packet-path-order',
      tag: 'Scenario 7',
      topic: 'Packet path',
      difficulty: 'core',
      scenario:
        'A request from the internet to an EC2 instance in a public subnet is being dropped somewhere in the VPC.',
      question: 'In what order are the route table, NACL and security group checked for an inbound packet?',
      answer: [
        '**Internet gateway, then route table (VPC router), then the subnet’s NACL inbound rules, then the ENI’s security group inbound rules** — only then does the instance see the packet. Both firewalls must allow it; either can drop it.',
        'The reverse path for the reply is: SG outbound (stateful, automatic) then **NACL outbound (stateless, must be explicit)** — the NACL is the checkpoint people forget on the way out.',
        'For the *outbound-initiated* case the order flips: SG outbound rule first, NACL outbound, and the return traffic needs SG inbound (automatic) plus NACL inbound (explicit ephemeral range).',
      ],
    },
    {
      id: 'aws-internal-not-filtered',
      tag: 'Scenario 8',
      topic: 'Unfiltered traffic',
      difficulty: 'deep',
      scenario:
        'You lock down an instance with a SG that allows nothing inbound, yet the instance can still reach 169.254.169.254 and resolve names via the VPC DNS resolver.',
      question: 'Which AWS-internal traffic is never filtered by security groups or NACLs?',
      answer: [
        '**Traffic to AWS-internal services bypasses both firewalls**: the instance metadata endpoint 169.254.169.254, the Amazon DNS resolver at VPC+2, DHCP, and Amazon Time Sync. No SG or NACL rule ever applies to them.',
        'Implication for IMDS: since SGs/NACLs cannot block metadata access, use IMDSv2 (token-based, required by default on newer AMIs) and hop limits — not firewall rules — to protect it.',
      ],
    },
    {
      id: 'flow-logs-reject-diagnosis',
      tag: 'Scenario 9',
      topic: 'Diagnosing blocks',
      difficulty: 'core',
      scenario:
        'A connection to a web instance times out and you have VPC Flow Logs enabled plus Reachability Analyzer available.',
      question: 'How do Flow Log REJECT rows and Reachability Analyzer tell you which firewall dropped the packet?',
      answer: [
        '**Flow Logs**: filter for REJECT. Inbound ACCEPT + outbound REJECT means the NACL outbound (ephemeral) rule is missing — the stateless trap. A REJECT on the very first inbound packet points at the security group or NACL inbound, and Reachability Analyzer names the exact component.',
        '**Reachability Analyzer** (Network Insights Path): you give it a source and destination and it walks the whole path — route table, NACL rules by number, SG rules — and reports exactly which rule blocks, so you stop guessing between the two firewalls.',
      ],
    },
  ],
};
