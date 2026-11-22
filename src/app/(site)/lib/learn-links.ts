/**
 * Which flagship article each flashcard deck belongs to. The article page
 * links "Practice flashcards" to the deck; the deck links back to the
 * article's interactive lab.
 */
export const DECK_FOR_POST: Record<string, string> = {
  '01-how-linux-decides-who-can-open-a-file': 'linux-permissions',
  '02-your-code-is-clean-attackers-still-got-a-shell': 'runtime-rce-zero-day',
  '03-port-443-is-open-in-security-group-why-timeout': 'aws-nacl-security-groups',
  '04-i-broke-two-servers-on-purpose': 'incident-drills',
  '05-rhel-lab-wreck-and-reset-in-seconds': 'kvm-overlay-lab',
  '06-60-day-plan-rhcsa-to-rhce': 'rhcsa-rhce-60-day',
  '07-every-rhcsa-task-translated-to-ansible': 'rhcsa-to-ansible-map',
  '08-the-no-ssh-rule-automating-exam-set': 'no-ssh-automation',
  '09-ansible-variable-precedence-drawn': 'ansible-variable-precedence',
  '10-ansible-vault-with-two-vault-ids': 'ansible-vault-two-ids',
  '11-mobile-access-runbook-m365-phones': 'm365-device-lock',
  '12-rhel10-storage-selinux-lab': 'rhel10-storage-selinux',
};

export type DeckLink = { href: string; label: string };

/** The companion lab or article for a deck, if it has one. */
export function companionFor(deckSlug: string): DeckLink | null {
  if (deckSlug === 'linux-permissions') {
    return { href: '/visuals/linux-permissions', label: 'Linux permissions visual lab' };
  }
  const post = Object.keys(DECK_FOR_POST).find((p) => DECK_FOR_POST[p] === deckSlug);
  if (!post) return null;
  return { href: `/blog/${post}#lab`, label: `Flagship #${post.slice(0, 2)} article & lab` };
}
