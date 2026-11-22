import type { Lab } from '../labs';

export const NEW_LABS: Lab[] = [
  {
    id: 'provision-thin-qcow2-overlay',
    title: 'Provision a three-node KVM lab with thin qcow2 overlays and instant reset',
    series: 'Linux & Virtualization',
    difficulty: 'core',
    estMinutes: 20,
    scenario:
      'Build a testing lab on your KVM host. You have a pristine base image `rhel10-base.qcow2`. You must create thin copy-on-write overlays for `rhel-control`, `rhel01`, and `rhel02`, verify the backing chain with `qemu-img info`, and implement a 2-second reset script.',
    tasks: [
      'Mark the base image read-only (`chmod 444`).',
      'Generate three thin overlays using `qemu-img create -f qcow2 -b ... -F qcow2`.',
      'Measure and contrast disk footprint: base image vs newly minted overlays.',
      'Write `reset-lab.sh` that wipes deltas and resets all nodes to pristine state in under 2 seconds.',
    ],
    requirements: [
      'Always specify `-F qcow2` explicitly to avoid hypervisor format-probing vulnerabilities.',
      'Never write data directly to the base image file.',
    ],
    solution: `mkdir -p /var/lib/libvirt/images/rhce-lab
cd /var/lib/libvirt/images/rhce-lab

# 1. Protect base image:
chmod 444 rhel10-base.qcow2

# 2. Create thin overlays:
for node in control rhel01 rhel02; do
  qemu-img create -f qcow2 -b /var/lib/libvirt/images/rhce-lab/rhel10-base.qcow2 -F qcow2 "\${node}.qcow2"
done

# 3. Create instant reset script:
cat << 'EOF' > reset-lab.sh
#!/bin/bash
set -euo pipefail
echo "Resetting lab nodes to clean state..."
for node in control rhel01 rhel02; do
  virsh destroy "$node" 2>/dev/null || true
  rm -f "\${node}.qcow2"
  qemu-img create -f qcow2 -b /var/lib/libvirt/images/rhce-lab/rhel10-base.qcow2 -F qcow2 "\${node}.qcow2"
  virsh start "$node"
done
echo "All nodes reset and running clean."
EOF

chmod +x reset-lab.sh`,
    explanation: [
      'Each new overlay file is less than **200 KB** initially. Even with three 20GB virtual disks, the host consumes only the original base image size plus ~600 KB of overlay metadata.',
      '`reset-lab.sh` destroys the VM, removes the dirty delta file, stamps out a new overlay, and reboots. The entire rebuild takes less than two seconds.',
      'Specifying `-F qcow2` is mandatory; omitting it allows malicious guest block manipulation to trick hypervisors during format auto-detection.',
    ],
    verify: [
      'qemu-img info control.qcow2 | grep "backing file:"',
      'du -h *.qcow2               # overlays are < 1MB each while base is multi-gigabyte',
      './reset-lab.sh',
    ],
  },
  {
    id: 'cloudinit-nocloud-generator',
    title: 'Generate cloud-init NoCloud ISO images for automated headless VM bootstrap',
    series: 'Linux & Virtualization',
    difficulty: 'core',
    estMinutes: 15,
    scenario:
      'You are deploying headless VMs with `virt-install`. You must automatically inject the hostname `rhel01.lab.internal`, create the user `devops` with sudo privileges, and inject your SSH public key on first boot using the NoCloud ISO provider.',
    tasks: [
      'Write standard `meta-data` specifying instance-id and local-hostname.',
      'Write `user-data` declaring user credentials, ssh_authorized_keys, and sudo rules.',
      'Package the files into `cidata.iso` using `genisoimage` with label `cidata`.',
      'Verify the ISO filesystem structure.',
    ],
    requirements: [
      'The ISO volume ID must be exactly `cidata` (lowercase or uppercase per cloud-init spec).',
      'Use valid cloud-config YAML header `#cloud-config`.',
    ],
    solution: `mkdir -p ~/cidata
cd ~/cidata

cat << 'EOF' > meta-data
instance-id: rhel01-lab
local-hostname: rhel01.lab.internal
EOF

cat << 'EOF' > user-data
#cloud-config
users:
  - name: devops
    gecos: DevOps Admin
    primary_group: devops
    groups: [wheel]
    sudo: ALL=(ALL) NOPASSWD:ALL
    shell: /bin/bash
    ssh_authorized_keys:
      - ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIExampleKeyForLabTesting devops@control

package_update: false
EOF

genisoimage -output cidata-rhel01.iso -volid cidata -joliet -rock user-data meta-data`,
    explanation: [
      'Cloud-init scans block devices on early boot. When it encounters a filesystem with the volume label `cidata`, it mounts it and executes the initialization scripts before userland network initialization.',
      'This eliminates manual VNC installer steps, kickstart web servers, or PXE boot infrastructure.',
      'Combining `cidata.iso` with thin qcow2 overlays allows automated provisioning of arbitrary complex topologies in seconds.',
    ],
    verify: [
      'isoinfo -d -i cidata-rhel01.iso | grep "Volume id: cidata"',
      'isoinfo -l -i cidata-rhel01.iso | grep -E "user-data|meta-data"',
    ],
  },
];
