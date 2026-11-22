import type { Lab } from '../labs';

export const NEW_LABS: Lab[] = [
  {
    id: 'ansible-multi-vault-provisioning',
    title: 'Configure multi-environment Ansible Vault IDs and encrypt_string variables',
    series: 'Ansible & RHCE',
    difficulty: 'advanced',
    estMinutes: 25,
    scenario:
      'You are building a unified deployment repo managing both staging and production. You must store an API token for dev and a database password for prod. Staging operators must not be able to decrypt prod secrets. You will configure ansible.cfg with `vault_identity_list`, encrypt strings using `encrypt_string`, and verify unattended playbook runs.',
    tasks: [
      'Generate two separate password files: `~/.vault_dev` and `~/.vault_prod`.',
      'Configure `ansible.cfg` to register `dev@~/.vault_dev` and `prod@~/.vault_prod`.',
      'Use `ansible-vault encrypt_string` to generate encrypted YAML snippets for both environments.',
      'Execute a test playbook that decrypts the dev credential without prompting.',
    ],
    requirements: [
      'Set file permissions `0600` on both password files.',
      'Use `--vault-id dev` and `--vault-id prod` respectively when creating encrypted strings.',
      'Ensure the main YAML file remains readable plain text for non-sensitive keys.',
    ],
    solution: `echo "dev_super_secret" > ~/.vault_dev
echo "prod_ultra_secure_key" > ~/.vault_prod
chmod 600 ~/.vault_dev ~/.vault_prod

cat << 'EOF' >> ~/ansible/ansible.cfg
[defaults]
vault_identity_list = dev@~/.vault_dev, prod@~/.vault_prod
EOF

# Encrypt single variable for dev
ansible-vault encrypt_string --vault-id dev@~/.vault_dev 'secret_api_token_123' --name 'api_key' >> ~/ansible/group_vars/webservers.yml

cat << 'EOF' > ~/ansible/test_vault.yml
- name: Test Automated Vault Decryption
  hosts: localhost
  connection: local
  gather_facts: false
  vars_files:
    - group_vars/webservers.yml
  tasks:
    - name: Display secret presence (masked)
      ansible.builtin.debug:
        msg: "API key loaded successfully with length {{ api_key | length }}"
EOF

ansible-playbook ~/ansible/test_vault.yml`,
    explanation: [
      '`vault_identity_list` eliminates the need to pass `--vault-id` manually on every command line. Ansible automatically matches the encrypted header `$ANSIBLE_VAULT;1.2;AES256;dev` to the registered `dev` identity.',
      '`encrypt_string` preserves the surrounding YAML document in plaintext. Only the scalar value is ciphered, making git commits readable and preventing binary merge conflicts.',
      'Password files with permissions looser than `0600` can be read by other local users on a shared bastion.',
    ],
    verify: [
      'grep "!vault" ~/ansible/group_vars/webservers.yml',
      'ansible-playbook ~/ansible/test_vault.yml | grep "loaded successfully"',
    ],
  },
  {
    id: 'ansible-vault-client-script',
    title: 'Deploy an automated vault password client script for unattended CI/CD',
    series: 'Ansible & RHCE',
    difficulty: 'core',
    estMinutes: 15,
    scenario:
      'In an automated pipeline, storing static passwords on disk is prohibited. You must create an executable client script `~/bin/vault-client.sh` that securely fetches the vault password from the environment variable `CI_VAULT_PASS` and outputs it to Ansible.',
    tasks: [
      'Write `~/bin/vault-client.sh` that validates `CI_VAULT_PASS` is non-empty and echoes it.',
      'Mark the script executable with `chmod 700`.',
      'Execute `ansible-vault view` using `--vault-id prod@~/bin/vault-client.sh`.',
    ],
    requirements: [
      'The script must exit with code 0 on success and non-zero if the variable is unset.',
      'Nothing other than the password must be printed to stdout.',
    ],
    solution: `mkdir -p ~/bin
cat << 'EOF' > ~/bin/vault-client.sh
#!/bin/bash
set -euo pipefail

if [[ -z "\${CI_VAULT_PASS:-}" ]]; then
  echo "Error: CI_VAULT_PASS environment variable is not set" >&2
  exit 1
fi

echo "\$CI_VAULT_PASS"
EOF

chmod 700 ~/bin/vault-client.sh

# Test execution:
export CI_VAULT_PASS="prod_ultra_secure_key"
ansible-vault view --vault-id prod@~/bin/vault-client.sh ~/ansible/group_vars/webservers.yml`,
    explanation: [
      'Ansible inspects the vault password target. If the file is marked executable (`+x`), Ansible invokes it as a child process and reads its stdout stream as the passphrase.',
      'Notice the error message redirects to `>&2` (stderr). If the error message was printed to stdout, Ansible would treat the words "Error: variable not set" as the password and fail with a cryptic decryption checksum mismatch.',
      'This pattern allows direct integration with AWS SSM Parameter Store, HashiCorp Vault, or GitHub Actions secrets without persisting plaintext files on disk.',
    ],
    verify: [
      '~/bin/vault-client.sh   # outputs the password',
      'CI_VAULT_PASS="" ~/bin/vault-client.sh || echo "Failed correctly when unset"',
    ],
  },
];
