import type { Lab } from '../labs';

export const NEW_LABS: Lab[] = [
  {
    id: 'create-intune-enrollment-sp',
    title: 'Create the missing Intune Enrollment service principal via Graph',
    series: 'Cloud & Identity',
    difficulty: 'core',
    estMinutes: 10,
    scenario:
      'Enrollment on a new phone dies with "You can’t get there from here" and the sign-in log shows error 53003 against `Microsoft Intune Enrollment`. In the Conditional Access resource picker the app cannot be selected at all, because it has no service principal in the tenant yet.',
    tasks: [
      'Check whether a service principal already exists for app ID `d4ebce55-015a-49b5-a083-c84d1797ae8c`.',
      'Create the service principal through Microsoft Graph if it is missing.',
      'Read the service principal back and confirm its display name is `Microsoft Intune Enrollment`.',
    ],
    requirements: [
      'Use `az rest` against Microsoft Graph, not the portal click-path.',
      'Sign in with an account that has `Application.ReadWrite.All` consented.',
      'GET before POST: creating a duplicate service principal fails with 409.',
    ],
    solution: `az rest --method get --url "https://graph.microsoft.com/v1.0/servicePrincipals?$filter=appId eq 'd4ebce55-015a-49b5-a083-c84d1797ae8c'&$select=id,appId,displayName" -o json
az rest --method post --url "https://graph.microsoft.com/v1.0/servicePrincipals" --body "{\\"appId\\": \\"d4ebce55-015a-49b5-a083-c84d1797ae8c\\"}"`,
    explanation: [
      'The trap is creating an **app registration** (POST /applications) instead of a **service principal** (POST /servicePrincipals). The Conditional Access picker lists service principals; an app registration alone does not make `Microsoft Intune Enrollment` selectable. The two objects share the same `appId` but are different directory objects.',
      'The app ID `d4ebce55-015a-49b5-a083-c84d1797ae8c` is Microsoft’s published first-party constant for Intune Enrollment, so the POST body needs no tenant-specific value. `Microsoft Intune` itself is `0000000a-0000-0000-c000-000000000000`.',
      'The GET-first pattern matters operationally: re-running the POST after the service principal exists returns 409 Conflict, so a repeatable script checks `value | length` first and only creates when zero.',
    ],
    verify: [
      'az rest --method get --url "https://graph.microsoft.com/v1.0/servicePrincipals?$filter=appId eq \'d4ebce55-015a-49b5-a083-c84d1797ae8c\'&$select=appId,displayName" | jq -r \'.value[0].displayName\'   # "Microsoft Intune Enrollment"',
      'az rest --method get --url "https://graph.microsoft.com/v1.0/servicePrincipals?$filter=appId eq \'d4ebce55-015a-49b5-a083-c84d1797ae8c\'" | jq -e \'.value | length == 1\'   # exactly one SP, no duplicates',
    ],
  },
  {
    id: 'audit-ca-policies-graph',
    title: 'Audit Conditional Access policies and their Intune exclusions',
    series: 'Cloud & Identity',
    difficulty: 'advanced',
    estMinutes: 15,
    scenario:
      'Before rollout you owe a written audit: which Conditional Access policies are still report-only, which grant "require device to be marked as compliant", and whether the mobile policy really excludes the Intune service apps. Doing this in the portal is five clicks per policy and impossible to repeat; do it against Graph.',
    tasks: [
      'List every Conditional Access policy with its id, state and display name.',
      'For the mobile require-compliant policy, confirm the grant control and that both Intune first-party app IDs are in the excluded applications.',
    ],
    requirements: [
      'Read-only: GET requests only.',
      'Use `az rest` piped to `jq`.',
      'Treat state `enabledForReportingButNotEnforced` as report-only, not enforcement.',
    ],
    solution: `az rest --method get --url "https://graph.microsoft.com/v1.0/identity/conditionalAccess/policies" -o json > /tmp/ca-policies.json
jq -r '.value[] | [.id, .state, .displayName] | @tsv' /tmp/ca-policies.json
jq '.value[] | select(.displayName == "Contoso - Mobile - Require compliant device") | {state, grant: .grantControls.builtInControls, excludedApps: .conditions.applications.excludeApplications}' /tmp/ca-policies.json`,
    explanation: [
      'Graph state values are `enabled`, `disabled` and `enabledForReportingButNotEnforced`. **The trap is reading `enabledForReportingButNotEnforced` as "on"** — it is report-only: sign-ins are logged as would-be success/failure but nothing is blocked. Only `enabled` enforces.',
      'Exclusions live in `conditions.applications.excludeApplications` as **app IDs, not display names** — that is why the missing service principal mattered: you cannot exclude an app the tenant cannot resolve. The mobile policy must list `d4ebce55-015a-49b5-a083-c84d1797ae8c` and `0000000a-0000-0000-c000-000000000000` at minimum.',
      'The per-user laptop rule keeps its approved-device list in `conditions.devices.deviceFilter` as a rule expression over `device.deviceId` — worth auditing in the same pass, since a mistyped ID there silently blocks an approved laptop.',
    ],
    verify: [
      'jq -r \'.value[] | select(.state == "enabledForReportingButNotEnforced") | .displayName\' /tmp/ca-policies.json   # lists the report-only policies',
      'jq -e \'.value[] | select(.displayName == "Contoso - Mobile - Require compliant device") | .conditions.applications.excludeApplications | index("d4ebce55-015a-49b5-a083-c84d1797ae8c") and index("0000000a-0000-0000-c000-000000000000")\' /tmp/ca-policies.json   # exit 0 only if both Intune app IDs are excluded',
      'jq -r \'.value[] | select(.displayName == "Contoso - Mobile - Require compliant device") | .grantControls.builtInControls[]\' /tmp/ca-policies.json   # includes "compliant"',
    ],
  },
  {
    id: 'enforce-policy-revoke-sessions',
    title: 'Enforce a report-only policy and revoke stale sessions',
    series: 'Cloud & Identity',
    difficulty: 'advanced',
    estMinutes: 20,
    scenario:
      'Every Report-only row in the sign-in logs for the pilot user looks right. Time to enforce `Contoso - Mobile - Require compliant device`. Last time a policy was switched On, users with already-open Outlook sessions kept working for hours because the old tokens were still valid.',
    tasks: [
      'Set the policy state to `enabled` via Graph.',
      'Revoke the pilot user’s sign-in sessions so tokens issued before enforcement die immediately.',
      'Verify the policy state, and that a fresh sign-in from an unmanaged phone now fails with error 53003.',
    ],
    requirements: [
      'Use `az rest` PATCH/POST against Graph.',
      'Know the policy id and the pilot user’s UPN beforehand.',
      'The 53003 check needs a real new sign-in attempt after the change; log rows from before do not count.',
    ],
    solution: `az rest --method patch --url "https://graph.microsoft.com/v1.0/identity/conditionalAccess/policies/<policy-id>" --body "{\\"state\\": \\"enabled\\"}"
az rest --method post --url "https://graph.microsoft.com/v1.0/users/alex@contoso.com/revokeSignInSessions"`,
    explanation: [
      '**The trap is stopping at the PATCH.** Flipping state to `enabled` changes evaluation for *new* token issuance; refresh tokens already issued keep working until they expire or are revoked. `POST /users/{upn}/revokeSignInSessions` is the second half of enforcement and is what makes the block effective immediately.',
      'After enforcement, a fresh sign-in from an unmanaged phone fails the `Require device to be marked as compliant` grant and surfaces as error 53003 in `auditLogs/signIns` — the same error code the report-only Failure predicted, which is how you confirm the prediction was right.',
      'Rollback is the reverse and takes effect within minutes: PATCH state back to `disabled` (or `enabledForReportingButNotEnforced` to keep observing). Intune-side policies (compliance, app protection) can stay in place during rollback; they do not gate sign-in on their own.',
    ],
    verify: [
      'az rest --method get --url "https://graph.microsoft.com/v1.0/identity/conditionalAccess/policies/<policy-id>?$select=state" | jq -r \'.state\'   # "enabled"',
      'az rest --method get --url "https://graph.microsoft.com/v1.0/auditLogs/signIns?$filter=userPrincipalName eq \'alex@contoso.com\' and status/errorCode eq 53003&$top=5" | jq \'.value[] | {createdDateTime, appDisplayName, error: .status.errorCode}\'   # fresh 53003 rows after enforcement',
    ],
  },
];
