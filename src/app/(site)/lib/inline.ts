import { createElement, Fragment, type ReactNode } from 'react';

/**
 * Renders the tiny subset of markdown used in the learning content:
 * `code` and **bold**. Keeping this local means the question and lab
 * files stay readable as plain strings, without pulling a full markdown
 * parser into a client component.
 */
export function renderInline(text: string): ReactNode {
  const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g);

  return createElement(
    Fragment,
    null,
    ...parts.map((part, i) => {
      if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
        return createElement('code', { key: i }, part.slice(1, -1));
      }
      if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
        return createElement('strong', { key: i }, part.slice(2, -2));
      }
      return part;
    }),
  );
}
