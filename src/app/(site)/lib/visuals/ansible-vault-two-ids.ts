import type { Visual } from '../visuals';
import { assertCascadeComplete } from '../visuals';

export const VISUALS: Visual[] = [
  {
    id: 'vault-resolution-stages',
    kind: 'stages',
    title: 'Ansible Vault multi-id header resolution sequence',
    caption:
      'Ansible matches the header metadata to the corresponding registered identity without brute-forcing keys.',
    stages: [
      {
        title: 'Read vault header: $ANSIBLE_VAULT;1.2;AES256;dev',
        body: 'Ansible parses the magic header. The fourth field designates the Vault ID label: "dev".',
        arrow: 'id extracted from header',
        tone: 'info',
      },
      {
        title: 'Match against vault_identity_list',
        body: 'Ansible checks configured identities in ansible.cfg or CLI flags for a label matching "dev".',
        arrow: 'matching key source located',
        tone: 'accent',
      },
      {
        title: 'Retrieve passphrase from client script or file',
        body: 'If a script is registered (dev@get-key.sh), it is executed; if a file, it is read with 0600 permissions.',
        arrow: 'passphrase passed to crypto engine',
        tone: 'accent',
      },
      {
        title: 'In-memory AES256 decryption',
        body: 'The encrypted block or variable string is decrypted directly into memory. Zero unencrypted bytes touch disk.',
        arrow: 'variable rendered into task',
        tone: 'ok',
      },
    ],
  },
  {
    id: 'vault-encryption-compare',
    kind: 'compare',
    title: 'Full file encryption vs ansible-vault encrypt_string',
    caption:
      'Encrypting whole files causes opaque binary git conflicts; encrypt_string encrypts only sensitive secrets while keeping configuration readable.',
    columns: [
      {
        title: 'Full file encryption (ansible-vault encrypt)',
        subtitle: 'Entire YAML file scrambled into ciphertext',
        lines: [
          '$ANSIBLE_VAULT;1.1;AES256',
          '666539316534346166316239333333346430343764336130323330386539',
          '333830613861313634353738363836373833333435373634353432363432',
          '# Git diff: 200 lines of unreadable hex numbers',
          '# Cannot review hostnames, ports, or config keys in PRs',
        ],
        mark: 'Git diff: 200 lines of unreadable hex numbers',
        markTone: 'bad',
        outcome: 'PR review impossible; frequent merge conflicts',
        ok: false,
      },
      {
        title: 'Scalar encryption (encrypt_string)',
        subtitle: 'Selective encryption of secret values only',
        lines: [
          'app_port: 8080',
          'db_host: postgres.internal.net',
          'db_password: !vault |',
          '  $ANSIBLE_VAULT;1.2;AES256;prod',
          '  36643234393663363462313164343834376537346636306338346233',
        ],
        mark: 'app_port: 8080',
        markTone: 'ok',
        outcome: 'Configuration readable in Git; secrets cryptographically locked',
        ok: true,
      },
    ],
  },
  {
    id: 'vault-command-matrix',
    kind: 'matrix',
    title: 'Ansible Vault operational command reference',
    caption:
      'Core command syntax for multi-environment key management and headless CI/CD execution.',
    headers: ['Operation', 'CLI Command', 'Use Case', 'Disk Behavior'],
    rows: [
      { cells: ['Create multi-vault file', 'ansible-vault create --vault-id dev@prompt secrets.yml', 'Interactive file creation', 'Encrypted on disk'], emphasis: true },
      { cells: ['Encrypt scalar string', 'ansible-vault encrypt_string --vault-id prod@key "secret" --name "token"', 'Embedding secrets in plain YAML', 'Prints YAML snippet to stdout'] },
      { cells: ['Unattended playbook', 'ansible-playbook -i inv site.yml --vault-id prod@get-key.sh', 'Headless CI/CD execution', 'Executes script via stdout pipe'], emphasis: true },
      { cells: ['Rekey across environments', 'ansible-vault rekey --vault-id dev@k1 --new-vault-id prod@k2 file.yml', 'Promoting staging secrets to prod', 'In-memory re-encryption, no temp files'] },
      { cells: ['View without decrypting on disk', 'ansible-vault view --vault-id dev@k1 file.yml', 'Inspecting secret values', 'Pipes decrypted text to pager'] },
    ],
  },
];

export const POST_VISUALS: Record<string, Visual[]> = {
  '10-ansible-vault-with-two-vault-ids': VISUALS,
};
