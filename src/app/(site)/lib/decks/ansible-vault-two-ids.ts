import type { Deck } from '../questions';

export const DECK: Deck = {
  slug: 'ansible-vault-two-ids',
  title: 'Ansible Vault with multiple vault IDs & secret ops',
  summary:
    'Nine scenarios on multi-environment secret management: dev@ and prod@ vault IDs, unattended password client scripts, encrypt_string for clean git diffs, rekeying across environments, and preventing CI/CD secret leaks.',
  series: 'Ansible & RHCE',
  cards: [
    {
      id: 'vault-id-syntax',
      tag: 'Scenario 1',
      topic: 'Multi-vault ID declaration',
      difficulty: 'core',
      scenario:
        'You manage separate dev and prod credentials in one repository. You run `ansible-vault create --vault-id dev@prompt --vault-id prod@prompt group_vars/all/vault.yml`.',
      question:
        'What is the function of the label before the @ symbol, and how does Ansible distinguish between keys?',
      answer: [
        '**The label before `@` is the Vault ID label (`dev` or `prod`).** It tags the encrypted data so Ansible knows which password to try when decrypting that specific block or file.',
        'The header in the resulting file records the label: `$ANSIBLE_VAULT;1.2;AES256;dev`. During playbook execution, Ansible only attempts the key associated with `dev`, avoiding trial-and-error password exhaustion or wrong key mismatches.',
      ],
    },
    {
      id: 'selective-decryption',
      tag: 'Scenario 2',
      topic: 'Selective decryption in staging',
      difficulty: 'deep',
      scenario:
        'A playbook contains files encrypted with `dev@` and files encrypted with `prod@`. A junior engineer runs the playbook in the dev environment providing only `--vault-id dev@~/.vault_pass_dev`.',
      question:
        'Will the playbook execute if tasks touch dev hosts only, or does Ansible demand the prod vault password up-front?',
      answer: [
        '**If the prod vault file is included or imported into the inventory or play scope, Ansible fails immediately** with a decryption error before executing any tasks, even if no dev task touches the prod variables.',
        '**The architectural solution:** Separate secrets by role or inventory group (`group_vars/dev/vault.yml` and `group_vars/prod/vault.yml`). When running against `--limit dev`, Ansible never loads `group_vars/prod/vault.yml`, allowing the run to succeed with the `dev` password alone.',
      ],
    },
    {
      id: 'client-password-scripts',
      tag: 'Scenario 3',
      topic: 'Automated password client scripts',
      difficulty: 'deep',
      scenario:
        'You need unattended playbook execution in automated CI/CD without storing plaintext password files on disk. You specify `--vault-id prod@/opt/scripts/get-vault-pass.sh`.',
      question:
        'How must the script behave, what file permissions are required, and where does it get the password?',
      answer: [
        '**The script must be executable (`chmod 700`) and output the password on stdout with return code 0.** Ansible detects executable files passed to `--vault-password-file` or `--vault-id` and executes them instead of reading them as static text.',
        'The script can query AWS Secrets Manager, HashiCorp Vault, 1Password CLI, or an environment variable (`echo "$VAULT_SECRET"`).',
        '**Crucial detail:** The script must not emit debugging logs, headers, or ANSI colors to stdout; anything printed to stdout is consumed as part of the decryption key.',
      ],
    },
    {
      id: 'encrypt-string-git-diffs',
      tag: 'Scenario 4',
      topic: 'ansible-vault encrypt_string',
      difficulty: 'core',
      scenario:
        'A team encrypts entire 400-line `group_vars/web.yml` files with `ansible-vault encrypt`. Every minor variable update produces an impenetrable 80-line binary git conflict that cannot be reviewed in PRs.',
      question:
        'How does `encrypt_string` solve this, and what does the resulting YAML structure look like?',
      answer: [
        '**`ansible-vault encrypt_string` encrypts only the sensitive scalar value**, leaving the variable name and the rest of the YAML file in clear, readable text.',
        'The YAML syntax is:\n```yaml\ndb_user: app_user\ndb_pass: !vault |\n          $ANSIBLE_VAULT;1.2;AES256;dev\n          3231353163353564636666...```',
        '**Git benefits:** Team members can review port changes, hostnames, and config flags in pull requests while credentials remain cryptographically secure.',
      ],
    },
    {
      id: 'ansible-cfg-vault-identity-list',
      tag: 'Scenario 5',
      topic: 'Default vault identities in config',
      difficulty: 'core',
      scenario:
        'Developers are frustrated by typing `--vault-id dev@.vault_dev --vault-id prod@.vault_prod` on every single ad-hoc and playbook command.',
      question:
        'Which setting in ansible.cfg automates vault ID detection across the team?',
      answer: [
        '**`vault_identity_list` under the `[defaults]` section:**\n```ini\n[defaults]\nvault_identity_list = dev@~/.vault_dev, prod@~/.vault_prod\n```',
        'Ansible will automatically read both identity sources for all operations. If a file does not exist, Ansible simply moves to the next or prompts if marked `@prompt`.',
        'Keep `.vault_*` files in the user’s home directory or add them to the global `.gitignore` so they are never accidentally pushed.',
      ],
    },
    {
      id: 'rekeying-across-vault-ids',
      tag: 'Scenario 6',
      topic: 'Rekeying secrets safely',
      difficulty: 'trap',
      scenario:
        'A variable currently encrypted under `dev@` needs to be migrated to `prod@` with the production team’s new key.',
      question:
        'What command changes the encryption key of a vault file or string without exposing the plaintext on the filesystem?',
      answer: [
        '**`ansible-vault rekey --vault-id dev@key_dev --new-vault-id prod@key_prod secret.yml`**',
        '`rekey` decrypts the payload in-memory using the old identity and immediately re-encrypts it using the new identity, writing directly back to the target file.',
        'At no point is an unencrypted temporary file created on disk, eliminating the risk of leaving plaintext credentials in `/tmp` or filesystem buffers.',
      ],
    },
    {
      id: 'gitops-precommit-protection',
      tag: 'Scenario 7',
      topic: 'Pre-commit leakage prevention',
      difficulty: 'core',
      scenario:
        'An engineer forgets to use `encrypt_string` and stages a cleartext AWS secret access key in `vars/main.yml`.',
      question:
        'Which automated guardrails prevent this file from being pushed to a remote git forge?',
      answer: [
        '**Pre-commit hooks like `trufflehog` or `git-secrets` combined with `ansible-lint`.**',
        'A pre-commit configuration running `ansible-lint` will flag unencrypted strings matching entropy patterns or variable names containing `_pass`, `_secret`, or `_key`.',
        'Additionally, a server-side branch protection rule or GitHub secret scanning push-protection will reject the push before the commit enters repository history.',
      ],
    },
    {
      id: 'single-vault-id-fallback',
      tag: 'Scenario 8',
      topic: 'Legacy single-vault compatibility',
      difficulty: 'deep',
      scenario:
        'You inherit an older Ansible 2.9 repository where files were encrypted with a single password and have the header `$ANSIBLE_VAULT;1.1;AES256` without an ID label.',
      question:
        'How do you decrypt or edit this file using modern multi-vault ID commands?',
      answer: [
        '**Provide a vault ID using `default` as the label: `--vault-id default@path/to/key`** (or `--vault-id path/to/key`).',
        'Files encrypted without an explicit ID label are implicitly assigned to the `default` vault identity.',
        'To upgrade the file to an explicit label: `ansible-vault rekey --new-vault-id dev@key_dev legacy_vault.yml`.',
      ],
    },
    {
      id: 'vault-view-in-vim-security',
      tag: 'Scenario 9',
      topic: 'Secure editing with ansible-vault edit',
      difficulty: 'trap',
      scenario:
        'You run `ansible-vault edit --vault-id prod@key secret.yml`. You edit the file in Vim, but your shell crashes while the editor is open.',
      question:
        'Where was the unencrypted version of the file stored during the edit session, and what security residue might remain?',
      answer: [
        '**`ansible-vault edit` creates a temporary decrypted file under `/tmp` or `$TMPDIR`** with permissions `0600`.',
        'If the session crashes, Vim swap files (e.g. `secret.yml.swp`) or lingering temporary files may remain in `/tmp`.',
        '**Hardening recommendation:** Set `export TMPDIR=/dev/shm` (RAM-backed tmpfs) so editor temporary files reside in volatile memory and are purged on reboot, and ensure `set noswapfile` is set in your editor when working with secrets.',
      ],
    },
  ],
};
