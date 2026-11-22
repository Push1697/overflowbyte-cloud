import type { Deck } from '../questions';

export const DECK: Deck = {
  slug: 'kvm-overlay-lab',
  title: 'KVM, thin qcow2 overlays & instant lab resets',
  summary:
    'Nine scenarios on architecting throwaway testing infrastructure with KVM/libvirt: copy-on-write qcow2 backing files, cloud-init NoCloud bootstrap, virsh snapshot hierarchies, and instant sub-second lab resets.',
  series: 'Linux & Virtualization',
  cards: [
    {
      id: 'qcow2-backing-chain',
      tag: 'Scenario 1',
      topic: 'qcow2 copy-on-write backing files',
      difficulty: 'core',
      scenario:
        'You have a clean 20GB RHEL 10 base image `rhel10-base.qcow2`. You want to spin up three nodes (`control`, `node1`, `node2`) without consuming 60GB of disk or waiting 10 minutes for file copies.',
      question:
        'How does a qcow2 overlay work, what command creates it, and how much disk space does a new overlay take?',
      answer: [
        '**A qcow2 overlay is a thin Copy-on-Write (CoW) delta layer.** Reads for unwritten blocks fall through to the golden base image; only modified sectors are written to the overlay.',
        '**Command:** `qemu-img create -f qcow2 -b rhel10-base.qcow2 -F qcow2 node1.qcow2`',
        '**Initial size:** A newly created overlay consumes only about **196 KB** of disk space (just metadata headers), allowing instant creation of dozens of isolated lab nodes.',
      ],
    },
    {
      id: 'base-image-corruption-trap',
      tag: 'Scenario 2',
      topic: 'Backing image immutability',
      difficulty: 'trap',
      scenario:
        'You have three running VMs using overlays backed by `base.qcow2`. You realize you forgot to install `git` in the base image, so you boot a temporary VM directly on `base.qcow2` and run `dnf install git`.',
      question:
        'What happens to the three existing overlay VMs when you reboot them?',
      answer: [
        '**All three overlay VMs are corrupted beyond repair.**',
        'The overlay assumes the sector layout and filesystem metadata of the backing file never change. When the base image was modified, block offsets shifted, invalidating the overlay delta.',
        '**Golden rule:** Backing images must remain strictly read-only (`chmod 444 base.qcow2`). If updates are needed, create a new versioned base image (`base-v2.qcow2`) or update via Ansible after VM creation.',
      ],
    },
    {
      id: 'cloud-init-nocloud-bootstrap',
      tag: 'Scenario 3',
      topic: 'cloud-init NoCloud data source',
      difficulty: 'core',
      scenario:
        'You create a VM from a generic cloud image. You want it to boot with a custom static IP `192.168.124.11`, hostname `rhel01`, and your SSH public key already installed in `~/.ssh/authorized_keys`.',
      question:
        'How do you inject this configuration without manually booting into single-user mode?',
      answer: [
        '**Use the cloud-init NoCloud data source via a tiny ISO or disk.**',
        'Create two text files: `meta-data` (defining `instance-id` and `local-hostname`) and `user-data` (defining users, SSH keys, network configs, and packages).',
        'Package into an ISO: `genisoimage -output cidata.iso -volid cidata -joliet -rock user-data meta-data`.',
        'Attach `cidata.iso` as a secondary CD-ROM to the VM during `virt-install`. Cloud-init detects the volume label `cidata` and provisions the system on first boot.',
      ],
    },
    {
      id: 'instant-lab-reset-workflow',
      tag: 'Scenario 4',
      topic: 'The 500-millisecond lab reset',
      difficulty: 'core',
      scenario:
        'During an incident response or exam drill, you wreck the networking, firewalls, and storage of `node1`. You need the machine back to its pristine post-install state.',
      question:
        'What sequence of commands restores node1 in under 2 seconds without reinstalling the OS?',
      answer: [
        '**Discard and recreate the overlay file:**\n```bash\nvirsh destroy node1\nrm -f /var/lib/libvirt/images/node1.qcow2\nqemu-img create -f qcow2 -b /var/lib/libvirt/images/base.qcow2 -F qcow2 /var/lib/libvirt/images/node1.qcow2\nvirsh start node1\n```',
        'Because the backing file is pristine and the overlay is freshly initialized, the node boots clean in seconds. This is the foundation of modern high-velocity break-fix labs.',
      ],
    },
    {
      id: 'virt-install-automation',
      tag: 'Scenario 5',
      topic: 'Headless virt-install scripting',
      difficulty: 'core',
      scenario:
        'You are automating VM creation on a remote headless server without a desktop GUI or VNC display.',
      question:
        'Which arguments ensure virt-install executes non-interactively and attaches to the serial console?',
      answer: [
        'Key flags for headless scripting:\n```bash\nvirt-install \\\n  --name node1 \\\n  --memory 2048 --vcpus 2 \\\n  --disk path=/var/lib/libvirt/images/node1.qcow2,device=disk,bus=virtio \\\n  --os-variant rhel10.0 \\\n  --network network=default,model=virtio \\\n  --graphics none \\\n  --console pty,target_type=serial \\\n  --import --noautoconsole\n```',
        '`--import` skips OS installer routines (using the pre-installed disk directly), and `--noautoconsole` returns control to your script immediately.',
      ],
    },
    {
      id: 'libvirt-snapshots-internal-vs-external',
      tag: 'Scenario 6',
      topic: 'Internal vs external snapshots',
      difficulty: 'deep',
      scenario:
        'You run `virsh snapshot-create-as node1 --name "clean-state" --description "Before breaking LVM"`. You then run `qemu-img info node1.qcow2`.',
      question:
        'What is an internal qcow2 snapshot, and how does it differ from creating a new external overlay file?',
      answer: [
        '**An internal snapshot stores delta metadata directly inside the same `.qcow2` file.** `qemu-img info` displays a `Snapshot list:` table inside the image.',
        '**External snapshots create a new distinct file on disk** where the old file becomes a read-only backing file.',
        'Internal snapshots are simple to manage with `virsh snapshot-revert node1 clean-state`, but take longer to clone or transfer across physical hosts.',
      ],
    },
    {
      id: 'network-bridge-vs-nat',
      tag: 'Scenario 7',
      topic: 'Libvirt NAT (virbr0) vs bridged networking',
      difficulty: 'core',
      scenario:
        'By default, libvirt creates `virbr0` with subnet `192.168.122.0/24`. VMs can reach the internet, but other physical machines on the office LAN cannot reach the VMs.',
      question:
        'Why can external physical hosts not reach the VMs, and what is required for transparent two-way LAN access?',
      answer: [
        '**Libvirt default network uses Source NAT (masquerade).** Outbound packets have their source IP replaced with the host’s LAN IP; inbound connections from the LAN cannot cross the host boundary without explicit port forwarding.',
        '**To achieve transparent LAN access:** Create a Linux software bridge (`br0`) bonded to the host’s physical ethernet interface, and configure VMs with `--network bridge=br0`. VMs then receive IP addresses directly from the LAN DHCP server.',
      ],
    },
    {
      id: 'qemu-img-format-probing-vulnerability',
      tag: 'Scenario 8',
      topic: 'The -F qcow2 security parameter',
      difficulty: 'trap',
      scenario:
        'An administrator runs `qemu-img create -f qcow2 -b base.img overlay.qcow2` omitting the `-F qcow2` flag. Modern libvirt emits a security warning or fails.',
      question:
        'Why is omitting the backing format flag (-F) dangerous in multi-tenant environments?',
      answer: [
        '**Omitting `-F` forces the hypervisor to auto-probe the backing file’s format.**',
        'In the format-probing vulnerability (CVE-2008-2004 and successors), a malicious VM tenant writes raw data to their disk that mimics a valid qcow2 or raw header. When the hypervisor re-probes, it can trick the storage layer into exposing host filesystem sectors to the tenant.',
        'Always specify `-F qcow2` explicitly to lock the parser into safe decoding.',
      ],
    },
    {
      id: 'guestfs-tools-offline-injection',
      tag: 'Scenario 9',
      topic: 'Offline image inspection with libguestfs',
      difficulty: 'deep',
      scenario:
        'A base image has a forgotten root password and will not boot. The VM is powered off, and you need to reset `/etc/shadow` without booting into single-user mode.',
      question:
        'Which toolchain allows safe offline filesystem manipulation of qcow2 images from the host shell?',
      answer: [
        '**`libguestfs-tools` (specifically `guestfish`, `virt-customize`, or `virt-edit`).**',
        '**Command to set root password offline:**\n`virt-customize -a rhel10-base.qcow2 --root-password password:redhat`',
        '**Command to inject files:**\n`virt-customize -a rhel10-base.qcow2 --upload /tmp/id_rsa.pub:/root/.ssh/authorized_keys`',
        '**Never** run guestfs tools against a live running VM; modifying blocks while the guest kernel has them mounted causes catastrophic filesystem corruption.',
      ],
    },
  ],
};
