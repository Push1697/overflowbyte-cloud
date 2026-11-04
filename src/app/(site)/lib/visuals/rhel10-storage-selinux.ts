import type { Visual } from '../visuals';
import { assertCascadeComplete } from '../visuals';

export const VISUALS: Visual[] = [
  {
    id: 'lvm-stack',
    kind: 'stages',
    title: 'The LVM provisioning stack',
    caption:
      'Each layer consumes the one below it; the fstab entry must reference the LV device path exactly, or the boot hangs in emergency mode.',
    stages: [
      {
        title: 'Physical Volume: pvcreate /dev/sdb',
        body: 'Initializes the raw disk with LVM metadata. On RHEL 9+/10 the device must be registered in /etc/lvm/system.devices or LVM will not scan it.',
        arrow: 'disk becomes a PV',
        tone: 'info',
      },
      {
        title: 'Volume Group: vgcreate vg_projects /dev/sdb',
        body: 'Pools one or more PVs into a single allocatable space measured in extents.',
        arrow: 'PVs pooled into a VG',
        tone: 'info',
      },
      {
        title: 'Logical Volume: lvcreate -n lv_appdata -L 5G vg_projects',
        body: 'Carves a virtual block device out of the VG. Can be extended later with lvextend while online.',
        arrow: 'extents allocated to an LV',
        tone: 'info',
      },
      {
        title: 'File system: mkfs.xfs /dev/vg_projects/lv_appdata',
        body: 'XFS is the RHEL default. Grows online with xfs_growfs <mount point>; never shrinks. ext4 would use resize2fs on the device.',
        arrow: 'LV formatted',
        tone: 'accent',
      },
      {
        title: 'Persistent mount: /etc/fstab + mount -a',
        body: 'fstab line maps the LV device to /srv/app_data. Verify with findmnt --verify before rebooting.',
        arrow: 'mounted at boot',
        tone: 'ok',
      },
    ],
  },
  {
    id: 'dac-acl-cascade',
    kind: 'cascade',
    title: 'Permission check on /srv/app_data (drwxrws---+ root:devops, ACL for auditor_user)',
    caption:
      'POSIX ACL evaluation order: owner first, then named-user entries, then group entries (masked), then other. SELinux then applies as a separate mandatory layer — both must allow.',
    checks: [
      {
        id: 'owner',
        title: 'Owner check',
        test: 'fsuid == file owner (root)?',
      },
      {
        id: 'named-user',
        title: 'Named-user ACL entry',
        test: 'an ACL_USER entry matches fsuid? (u:auditor_user:r-x)',
      },
      {
        id: 'group',
        title: 'Group check',
        test: 'fsgid or supplementary group matches group owner or a named-group entry, after the ACL mask (devops via SGID inheritance)',
      },
      {
        id: 'other',
        title: 'Other',
        test: 'the other bits apply (--- here)',
      },
    ],
    subjects: [
      {
        id: 'dev-user',
        label: 'dev_user (member of devops)',
        detail: 'Creates and writes files in /srv/app_data; new files inherit group devops via SGID',
        results: {
          owner: { state: 'fail', note: 'fsuid is dev_user, not root' },
          'named-user': { state: 'fail', note: 'no ACL_USER entry for dev_user' },
          group: { state: 'pass', note: 'devops matches the group bits rwx (SGID sets the group on new files)' },
          other: { state: 'skip', note: 'not reached; group already allowed' },
        },
        granted: true,
        verdict: 'Allowed (rwx via group)',
      },
      {
        id: 'auditor',
        label: 'auditor_user (named ACL entry)',
        detail: 'Has u:auditor_user:r-x on the directory and d:u:auditor_user:r-- on new files',
        results: {
          owner: { state: 'fail', note: 'fsuid is auditor_user, not root' },
          'named-user': { state: 'pass', note: 'ACL_USER entry grants r-x on the directory; r-- on files via the default ACL' },
          group: { state: 'skip', note: 'not reached; named-user entry already decided it' },
          other: { state: 'skip', note: 'not reached' },
        },
        granted: true,
        verdict: 'Allowed read-only (write denied by the entry itself)',
      },
      {
        id: 'outsider',
        label: 'outsider (no devops membership, no ACL entry)',
        detail: 'Tries to list /srv/app_data',
        results: {
          owner: { state: 'fail', note: 'not the owner' },
          'named-user': { state: 'fail', note: 'no matching ACL_USER entry' },
          group: { state: 'fail', note: 'no matching group; mask does not help' },
          other: { state: 'fail', note: 'other bits are ---' },
        },
        granted: false,
        verdict: 'Denied, EACCES',
      },
    ],
  },
  {
    id: 'chcon-vs-semanage',
    kind: 'compare',
    title: 'Labeling /srv/app_data: chcon vs semanage fcontext + restorecon',
    caption:
      'chcon edits only the live label; the next relabel resets it. The semanage pair writes the rule into the policy database, which is what survives touch /.autorelabel and reboots.',
    columns: [
      {
        title: 'chcon (not persistent)',
        subtitle: 'live label only',
        lines: [
          'chcon -t httpd_sys_rw_content_t /srv/app_data',
          'ls -Zd /srv/app_data',
          'system_u:object_r:httpd_sys_rw_content_t:s0   # looks correct now',
          'reboot after touch /.autorelabel',
          'ls -Zd /srv/app_data',
          'system_u:object_r:var_t:s0   # label reset — rule was never stored',
        ],
        mark: 'var_t',
        markTone: 'bad',
        outcome: 'Survives until the next relabel, then silently reverts. Never the exam answer for persistence.',
        ok: false,
      },
      {
        title: 'semanage fcontext + restorecon (persistent)',
        subtitle: 'written to the policy database',
        lines: [
          'semanage fcontext -a -t httpd_sys_rw_content_t "/srv/app_data(/.*)?"',
          'restorecon -Rv /srv/app_data',
          'ls -Zd /srv/app_data',
          'system_u:object_r:httpd_sys_rw_content_t:s0',
          'reboot after touch /.autorelabel',
          'ls -Zd /srv/app_data',
          'system_u:object_r:httpd_sys_rw_content_t:s0   # still correct',
        ],
        mark: 'httpd_sys_rw_content_t',
        markTone: 'ok',
        outcome: 'Rule lives in file_contexts.local; relabels reapply it automatically. This is the persistent pattern.',
        ok: true,
      },
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
  '12-rhel10-storage-selinux-lab': VISUALS,
};
