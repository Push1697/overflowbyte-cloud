import type { Lab } from '../labs';

/**
 * AWS labs use the AWS CLI against the reader's own lab account — the
 * scriptable path, same role `az rest` plays for Entra/Intune. Every verify
 * step is a read-only describe/query call.
 */
export const NEW_LABS: Lab[] = [
  {
    id: 'audit-nacl-vs-sg',
    title: 'Audit a subnet’s NACL and an instance’s SG for the stateless trap',
    series: 'Cloud Networking',
    difficulty: 'core',
    estMinutes: 15,
    scenario:
      'A web instance in a public subnet times out for users even though its security group allows inbound 443 from 0.0.0.0/0. Before changing anything you want a written picture of both firewalls: the NACL rules on the subnet (in and out, by rule number) and the SG rules on the instance.',
    tasks: [
      'List the NACL entries of the instance’s subnet, ingress and egress separately, sorted by rule number.',
      'List the security group rules of the instance and confirm whether any egress rule exists at all.',
      'Decide from the output alone whether return traffic can leave the subnet.',
    ],
    requirements: [
      'AWS CLI v2 configured against a lab account (`aws sts get-caller-identity` works).',
      'jq installed.',
      'Read-only: describe-* calls only, no changes.',
      'You know the subnet ID and the security group ID.',
    ],
    solution: `SUBNET_ID=subnet-11111111111111111
SG_ID=sg-11111111111111111
aws ec2 describe-network-acls --filters Name=association.subnet-id,Values=$SUBNET_ID --query 'NetworkAcls[0].NetworkAclId' --output text
aws ec2 describe-network-acls --network-acl-ids $(aws ec2 describe-network-acls --filters Name=association.subnet-id,Values=$SUBNET_ID --query 'NetworkAcls[0].NetworkAclId' --output text) --query 'NetworkAcls[0].Entries | sort_by(@, &RuleNumber) | [?(Egress==\`true\`)] | .[] | {rule: RuleNumber, action: RuleAction, proto: Protocol, ports: PortRange, cidr: CidrBlock}' --output json
aws ec2 describe-security-groups --group-ids $SG_ID --query 'SecurityGroups[0].{in: IpPermissions, out: IpPermissionsEgress}' --output json`,
    explanation: [
      '**The trap is trusting the SG view alone.** A stateful SG with inbound 443 allowed needs *no* outbound rule for replies — but the subnet NACL is stateless and must explicitly allow egress to the client’s ephemeral range (TCP 1024–65535 to be safe across Linux/Windows/ELB clients). If the egress list lacks it, replies die at the NACL and users see a timeout.',
      'Sorting NACL entries by `RuleNumber` matters because evaluation is **lowest number first, first match wins** — the order you read is the order AWS applies.',
      'Also note what SGs *cannot* show: deny rules do not exist there, so any explicit block you see must live in the NACL.',
    ],
    verify: [
      'aws ec2 describe-network-acls --filters Name=association.subnet-id,Values=subnet-11111111111111111 --query "NetworkAcls[0].Entries[?Egress==`true` && RuleAction==`allow`].PortRange" --output json   # must include an ephemeral range for return traffic',
      'aws ec2 describe-security-groups --group-ids sg-11111111111111111 --query "SecurityGroups[0].IpPermissionsEgress" --output json   # SG egress may be open by default; that is NOT what blocks the reply',
    ],
  },
  {
    id: 'nacl-deny-before-allow',
    title: 'Add a NACL deny that actually fires, plus ephemeral egress',
    series: 'Cloud Networking',
    difficulty: 'core',
    estMinutes: 15,
    scenario:
      'An abusive range, 203.0.113.0/24, is hammering the load balancer in your public subnet. The subnet’s NACL currently has rule 100 allowing inbound TCP 443 from 0.0.0.0/0, and nothing else. You need the bad range blocked *and* legitimate return traffic working.',
    tasks: [
      'Add a NACL ingress deny for 203.0.113.0/24 at a rule number that is evaluated before the existing allow at 100.',
      'Add a NACL egress allow for TCP 1024–65535 (return traffic to ephemeral client ports).',
      'Add a NACL ingress allow for TCP 1024–65535 (responses to instance-initiated connections).',
    ],
    requirements: [
      'A lab VPC with a custom NACL on a public subnet; do this in a lab account only.',
      'Rules numbered in steps of 100 so future rules can slot in between.',
      'The deny must have a lower rule number than any matching allow.',
    ],
    solution: `aws ec2 create-network-acl-entry --network-acl-id acl-11111111111111111 --ingress --rule-number 90 --protocol -1 --cidr-block 203.0.113.0/24 --rule-action deny
aws ec2 create-network-acl-entry --network-acl-id acl-11111111111111111 --ingress --rule-number 110 --protocol tcp --port-range From=1024,To=65535 --cidr-block 0.0.0.0/0 --rule-action allow
aws ec2 create-network-acl-entry --network-acl-id acl-11111111111111111 --egress --rule-number 100 --protocol tcp --port-range From=1024,To=65535 --cidr-block 0.0.0.0/0 --rule-action allow`,
    explanation: [
      '**The trap is rule numbering.** NACL rules evaluate lowest-number-first and stop at the first match. A deny at 200 behind an allow-all at 100 never fires; at 90 it blocks before the allow is read. Numbering in steps of 100 leaves room to slot future rules (e.g. 95) without renumbering.',
      '**The second trap is forgetting direction.** A NACL is stateless: the egress allow for 1024–65535 is what lets replies to inbound 443 reach the client’s ephemeral port, and the ingress allow for 1024–65535 lets responses to instance-initiated outbound connections (yum, APIs) back in.',
      'Remember the terminal `*` rule denies everything not matched — on a *custom* NACL that is every packet until you add rules, so add rules before associating it with a subnet.',
    ],
    verify: [
      'aws ec2 describe-network-acls --network-acl-ids acl-11111111111111111 --query "sort_by(NetworkAcls[0].Entries, &RuleNumber)[].{rule: RuleNumber, egress: Egress, action: RuleAction, proto: Protocol, ports: PortRange.From, cidr: CidrBlock}" --output table   # deny 90 first, ephemeral allows present both directions',
      'aws ec2 describe-network-acls --network-acl-ids acl-11111111111111111 --query "NetworkAcls[0].Entries[?RuleNumber==`90` && RuleAction==`deny`].CidrBlock" --output text   # 203.0.113.0/24',
    ],
  },
  {
    id: 'reachability-analyzer-diagnosis',
    title: 'Diagnose a blocked path with Flow Logs and Reachability Analyzer',
    series: 'Cloud Networking',
    difficulty: 'advanced',
    estMinutes: 20,
    scenario:
      'Users report that https://your-app times out. The instance’s SG allows 443 inbound, the subnet NACL looks plausible, and you want a definitive answer about *which component* drops the packets — without rebooting or changing anything.',
    tasks: [
      'Query recent VPC Flow Logs for the instance and find REJECT rows, noting direction.',
      'Create a Network Insights Path from the internet gateway (or a test instance) to the instance on TCP 443 and run the analysis.',
      'Read the analysis findings and name the blocking component.',
    ],
    requirements: [
      'VPC Flow Logs enabled and delivered to CloudWatch Logs or S3, in a lab account.',
      'AWS CLI v2 + jq.',
      'An instance ID, its subnet ID, and an internet gateway ID (igw-...).',
      'The insights-path creation is the only mutating call; the diagnosis itself is read-only.',
    ],
    solution: `aws ec2 create-network-insights-path --source igw-11111111111111111 --destination i-11111111111111111 --protocol tcp --destination-port 443 --tag-specifications 'ResourceType=network-insights-path,Tags=[{Key=Name,Value=diag-443}]'
aws ec2 start-network-insights-analysis --network-insights-path-id $(aws ec2 describe-network-insights-paths --filters Name=tag:Name,Values=diag-443 --query 'NetworkInsightsPaths[0].NetworkInsightsPathId' --output text)
aws ec2 describe-network-insights-analyses --network-insights-path-id $(aws ec2 describe-network-insights-paths --filters Name=tag:Name,Values=diag-443 --query 'NetworkInsightsPaths[0].NetworkInsightsPathId' --output text) --query 'NetworkInsightsAnalyses[0].{status: Status, findings: NetworkPathFound, explanations: Explanations}' --output json
aws logs filter-log-events --log-group-name /vpc/flowlogs --filter-pattern 'REJECT' --query 'events[].message' --output text | tail -20`,
    explanation: [
      '**Flow Logs give the signature, Reachability Analyzer gives the culprit.** Inbound ACCEPT + outbound REJECT on the flow logs = the stateless NACL egress gap (missing ephemeral rule). A REJECT on the first inbound packet = SG or NACL ingress. Reachability Analyzer walks route table, NACL entries by number, and SG rules, and returns the exact blocking component in `Explanations`.',
      '**The trap is trusting "the SG is fine" as the whole diagnosis.** The SG can be perfect and the NACL still drops the reply; only the two-directional view (flow logs both ways, or the analyzer) separates the two firewalls.',
      'Network Insights Paths need the source to be an IGW, instance, ENI, or VPN — an IGW-to-instance path on TCP 443 exercises NACL ingress + SG ingress in one analysis.',
    ],
    verify: [
      'aws ec2 describe-network-insights-analyses --network-insights-path-id $(aws ec2 describe-network-insights-paths --filters Name=tag:Name,Values=diag-443 --query "NetworkInsightsPaths[0].NetworkInsightsPathId" --output text) --query "NetworkInsightsAnalyses[0].Status" --output text   # eventually "succeeded"',
      'aws logs filter-log-events --log-group-name /vpc/flowlogs --filter-pattern "REJECT" --query "length(events[])" --output text   # count of rejected flows; correlate src/dst with the instance ENI',
    ],
  },
];
