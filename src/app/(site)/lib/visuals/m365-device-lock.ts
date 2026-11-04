import type { Visual } from '../visuals';
import { assertCascadeComplete } from '../visuals';

export const VISUALS: Visual[] = [
  {
    id: 'ca-mobile-evaluation',
    kind: 'cascade',
    title: 'Conditional Access evaluation for mobile Microsoft 365 sign-ins',
    caption:
      'The Intune resource exclusion is evaluated before the compliance grant, so Company Portal enrollment is never blocked by the very policy that requires enrollment.',
    checks: [
      {
        id: 'user-scope',
        title: 'User scope',
        test: 'Included in the pilot group; break-glass account and Global Administrator role excluded',
      },
      {
        id: 'resource',
        title: 'Target resource',
        test: 'All resources, excluding the Intune service apps (Intune Enrollment, Intune, and companions)',
      },
      {
        id: 'platform',
        title: 'Device platform',
        test: 'Android or iOS',
      },
      {
        id: 'grant',
        title: 'Grant control',
        test: 'Require device to be marked as compliant',
      },
    ],
    subjects: [
      {
        id: 'android-work',
        label: 'Android, work profile, compliant',
        detail: 'Enrolled via Company Portal; compliance policy delivered; work-profile Outlook',
        results: {
          'user-scope': { state: 'pass', note: 'Pilot group member' },
          resource: { state: 'pass', note: 'Outlook / Exchange, not an Intune service app' },
          platform: { state: 'pass', note: 'Android' },
          grant: { state: 'pass', note: 'Work profile is marked compliant' },
        },
        granted: true,
        verdict: 'Allowed',
      },
      {
        id: 'android-personal',
        label: 'Android, personal side',
        detail: 'Same phone, personal-profile Outlook; no enrollment on this side',
        results: {
          'user-scope': { state: 'pass', note: 'Pilot group member' },
          resource: { state: 'pass', note: 'Still targets Exchange Online' },
          platform: { state: 'pass', note: 'Android' },
          grant: { state: 'fail', note: 'Personal side has no compliance state: not compliant' },
        },
        granted: false,
        verdict: 'Blocked, error 53003',
      },
      {
        id: 'iphone-enrolled',
        label: 'iPhone, enrolled and compliant',
        detail: 'Authenticator broker plus Entra ID SSO extension installed',
        results: {
          'user-scope': { state: 'pass', note: 'Pilot group member' },
          resource: { state: 'pass', note: 'Outlook / Teams / Safari via SSO' },
          platform: { state: 'pass', note: 'iOS' },
          grant: { state: 'pass', note: 'Device reports compliant through Authenticator' },
        },
        granted: true,
        verdict: 'Allowed',
      },
      {
        id: 'iphone-unenrolled',
        label: 'iPhone, never enrolled',
        detail: 'Personal Outlook from the App Store',
        results: {
          'user-scope': { state: 'pass', note: 'Pilot group member' },
          resource: { state: 'pass', note: 'Targets Exchange Online' },
          platform: { state: 'pass', note: 'iOS' },
          grant: { state: 'fail', note: 'No device identity at all: not compliant' },
        },
        granted: false,
        verdict: 'Blocked, prompt to enroll',
      },
      {
        id: 'company-portal',
        label: 'Company Portal enrollment on a new phone',
        detail: 'First-run traffic to Microsoft Intune Enrollment',
        results: {
          'user-scope': { state: 'pass', note: 'Pilot group member' },
          resource: {
            state: 'skip',
            note: 'Microsoft Intune Enrollment is in the excluded resources, so evaluation stops here',
          },
          platform: { state: 'skip', note: 'Not evaluated' },
          grant: { state: 'skip', note: 'Not evaluated' },
        },
        granted: true,
        verdict: 'Not applied; enrollment proceeds',
      },
      {
        id: 'break-glass',
        label: 'Break-glass Global Admin on a phone',
        detail: 'Emergency account, excluded by user and by role',
        results: {
          'user-scope': { state: 'skip', note: 'Excluded from the policy entirely' },
          resource: { state: 'skip', note: 'Not evaluated' },
          platform: { state: 'skip', note: 'Not evaluated' },
          grant: { state: 'skip', note: 'Not evaluated' },
        },
        granted: true,
        verdict: 'Not applied; admin access preserved',
      },
    ],
  },
  {
    id: 'device-id-rule-compare',
    kind: 'compare',
    title: 'Per-user device-ID rule: approved laptop vs unknown PC',
    caption:
      'The rule blocks everything except the listed `device.deviceId` values; a blank Device ID in the log means the browser never sent one, not that the device is approved.',
    columns: [
      {
        title: 'Approved laptop LAPTOP-01',
        subtitle: 'Edge signed in to the work profile',
        lines: [
          'Sign-in: alex@contoso.com, Outlook web',
          'Device info: Device ID 11111111-1111-1111-1111-111111111111',
          'Report-only tab: Not applied',
          'Result: Allowed',
        ],
        mark: 'Not applied',
        markTone: 'ok',
        outcome: 'The listed ID was excluded from the block filter, so the policy never fired.',
        ok: true,
      },
      {
        title: 'Unknown PC',
        subtitle: 'Fresh browser profile, no device identity',
        lines: [
          'Sign-in: alex@contoso.com, Outlook web',
          'Device info: Device ID (blank)',
          'Report-only tab: Failure',
          'Result: Blocked, error 53003',
        ],
        mark: '53003',
        markTone: 'bad',
        outcome: 'No listed ID matched, so the block grant fired. Fix the browser, not the filter: Edge work profile or the Chrome SSO extension.',
        ok: false,
      },
    ],
  },
  {
    id: 'rollout-sequence',
    kind: 'timeline',
    title: 'Rolling out a Conditional Access policy',
    caption:
      'Report-only first, enforce second, revoke sessions third: switching On alone leaves pre-existing tokens alive.',
    steps: [
      {
        title: 'Create in Report-only',
        body: 'Assign to the pilot group only. Exclude the break-glass account and Global Administrator. Exclude the Intune service apps from target resources so enrollment is never blocked.',
      },
      {
        title: 'Verify in the sign-in logs',
        body: 'Open each sign-in entry and read the Report-only tab: Success for cases that should pass, Failure for cases that should block. Nothing is enforced yet.',
      },
      {
        title: 'Switch On',
        body: 'Set Enable policy to On. This changes evaluation for new token issuance only; existing sessions are not killed by the switch itself.',
      },
      {
        title: 'Revoke sessions',
        body: 'Revoke the user’s sessions in Entra so refresh tokens issued before enforcement stop working immediately.',
      },
      {
        title: 'Retest and roll out',
        body: 'Retest one allowed and one blocked case, then add users to the pilot group one at a time. Rollback: set the policy to Off, effective within minutes.',
      },
    ],
  },
  {
    id: 'verification-checklist',
    kind: 'matrix',
    title: 'Post-rollout verification checklist',
    caption:
      'Run every row after enforcement; the copy-paste rows only need the Intune policies, not Conditional Access, so test them even while CA is still report-only.',
    headers: ['Test', 'Expected'],
    rows: [
      { cells: ['Approved laptop, Edge work profile or Chrome with SSO extension', 'Allowed, Device ID visible in sign-in log'] },
      { cells: ['Unknown PC or private browsing window', 'Blocked, error 53003'] },
      { cells: ['Android work-profile Outlook and Teams', 'Allowed'] },
      { cells: ['Android personal-side Outlook', 'Blocked'] },
      { cells: ['New phone enrolling in Company Portal', 'Enrollment succeeds (Intune apps excluded)'] },
      { cells: ['Enrolled, compliant iPhone, Outlook and Teams', 'Allowed'] },
      { cells: ['Copy from work Outlook, paste into personal WhatsApp', 'Refused or blank paste'], emphasis: true },
      { cells: ['Copy from work Outlook, paste into work Teams', 'Works'] },
      { cells: ['Save an Outlook attachment to phone storage', 'Refused; OneDrive / SharePoint offered'] },
      { cells: ['Screenshot inside work Outlook on Android', 'Blocked'] },
      { cells: ['App protection status in Intune app monitor', 'Protected'] },
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
  '11-mobile-access-runbook-m365-phones': VISUALS,
};
