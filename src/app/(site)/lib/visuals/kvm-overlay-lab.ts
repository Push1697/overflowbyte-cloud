import type { Visual } from '../visuals';

export const VISUALS: Visual[] = [
  {
    id: 'qcow2-cow-stages',
    kind: 'stages',
    title: 'qcow2 Copy-on-Write (CoW) block allocation architecture',
    caption:
      'Reads traverse down the backing chain; writes allocate exclusively in the thin delta overlay.',
    stages: [
      {
        title: 'Pristine golden base image (rhel10-base.qcow2)',
        body: '20GB pre-installed OS image, set read-only (chmod 444). Shared across all VMs.',
        arrow: 'referenced as immutable backing file',
        tone: 'info',
      },
      {
        title: 'Thin qcow2 delta overlay (control.qcow2)',
        body: 'Stamps out in 200 milliseconds. Initial size is ~196 KB of metadata pointers.',
        arrow: 'VM boots against overlay device',
        tone: 'accent',
      },
      {
        title: 'Unmodified block read: falls through to base',
        body: 'Kernel reads /usr/bin/bash; block is absent in overlay, hypervisor reads from base image.',
        arrow: 'transparent read delegation',
        tone: 'info',
      },
      {
        title: 'Modified block write: stored in overlay only',
        body: 'VM modifies /etc/hosts; hypervisor writes modified sector into overlay file only. Base image stays pristine.',
        arrow: 'independent VM state isolated',
        tone: 'ok',
      },
      {
        title: 'Instant lab reset: discard delta file',
        body: 'Deleting and recreating the 196 KB overlay returns the VM to pristine initial state in under 2 seconds.',
        arrow: 'zero downtime reset loop',
        tone: 'ok',
      },
    ],
  },
  {
    id: 'clone-vs-overlay-compare',
    kind: 'compare',
    title: 'Full VM clone vs thin qcow2 copy-on-write overlay',
    caption:
      'Comparing disk footprint, creation time, and reset agility for a 3-node training lab.',
    columns: [
      {
        title: 'Full disk clone (cp base.img node.img)',
        subtitle: 'Duplicates entire 20GB disk image for each node',
        lines: [
          '3 nodes x 20 GB = 60 GB disk consumed',
          'Copy time: 5-8 minutes per node on standard storage',
          'Lab reset: requires 15+ minutes of disk copying',
          'Heavy disk I/O thrashing during resets',
        ],
        mark: '3 nodes x 20 GB = 60 GB disk consumed',
        markTone: 'bad',
        outcome: 'High disk waste and sluggish turnaround',
        ok: false,
      },
      {
        title: 'Thin qcow2 CoW overlay (qemu-img -b base.qcow2)',
        subtitle: 'Shares read-only base; allocates deltas dynamically',
        lines: [
          '3 nodes initial disk: 3 x 196 KB (< 1 MB total)',
          'Creation time: < 300 ms per node',
          'Lab reset: rm node.qcow2 && qemu-img create (1.5 seconds)',
          'Zero host I/O bottleneck',
        ],
        mark: '< 1 MB total',
        markTone: 'ok',
        outcome: 'Near-instant provisioning and 95%+ disk savings',
        ok: true,
      },
    ],
  },
  {
    id: 'kvm-command-matrix',
    kind: 'matrix',
    title: 'KVM/libvirt high-velocity administration matrix',
    caption:
      'Essential command-line utilities for headless VM lifecycle and automated lab resets.',
    headers: ['Task', 'Tool / Command', 'Key Arguments', 'Execution Speed'],
    rows: [
      { cells: ['Create thin overlay', 'qemu-img create', '-f qcow2 -b base.qcow2 -F qcow2 overlay.qcow2', '< 200 ms'], emphasis: true },
      { cells: ['Inspect backing chain', 'qemu-img info', 'node1.qcow2 (shows backing file & clusters)', 'Instant'] },
      { cells: ['Non-interactive VM deploy', 'virt-install', '--import --os-variant rhel10.0 --graphics none', '~ 2 seconds'], emphasis: true },
      { cells: ['Instant hard shutdown', 'virsh destroy', 'node1 (terminates QEMU process immediately)', '< 500 ms'] },
      { cells: ['Offline image customization', 'virt-customize', '-a base.qcow2 --root-password password:redhat', '~ 4 seconds'], emphasis: true },
      { cells: ['Live serial console attach', 'virsh console', 'node1 (access shell without network/SSH)', 'Instant'] },
    ],
  },
];

export const POST_VISUALS: Record<string, Visual[]> = {
  '05-rhel-lab-wreck-and-reset-in-seconds': VISUALS,
};
