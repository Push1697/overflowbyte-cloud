import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCircleInfo,
  faLightbulb,
  faTriangleExclamation,
  faCircleExclamation,
  faFire,
} from '@fortawesome/free-solid-svg-icons';

type AlertType = 'note' | 'tip' | 'important' | 'warning' | 'caution';

const ALERT_CONFIG: Record<
  AlertType,
  { label: string; tone: string; icon: typeof faCircleInfo }
> = {
  note: { label: 'Note', tone: 'is-note', icon: faCircleInfo },
  tip: { label: 'Pro Tip', tone: 'is-tip', icon: faLightbulb },
  important: { label: 'Important', tone: 'is-important', icon: faCircleExclamation },
  warning: { label: 'Warning', tone: 'is-warning', icon: faTriangleExclamation },
  caution: { label: 'Caution', tone: 'is-caution', icon: faFire },
};

interface ElementWithChildren {
  children?: React.ReactNode;
}

/**
 * Parses markdown blockquotes into GitHub-style alert callouts.
 * Matches: > [!NOTE], > [!TIP], > [!IMPORTANT], > [!WARNING], > [!CAUTION]
 */
export default function CalloutAlert({ children }: { children: React.ReactNode }) {
  let alertType: AlertType | null = null;
  let remainingChildren: React.ReactNode = children;

  const childrenArray = React.Children.toArray(children);
  if (childrenArray.length > 0) {
    const firstChild = childrenArray[0];
    if (React.isValidElement<ElementWithChildren>(firstChild) && firstChild.props?.children) {
      const pChildren = React.Children.toArray(firstChild.props.children);
      const firstText = pChildren[0];

      if (typeof firstText === 'string') {
        // [\s\S] so text on the lines after the marker is kept, not dropped.
        const match = firstText.match(/^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*([\s\S]*)/i);
        if (match) {
          const typeKey = match[1].toLowerCase() as AlertType;
          if (ALERT_CONFIG[typeKey]) {
            alertType = typeKey;
            const remainderText = match[2];

            const newPChildren = [
              remainderText ? remainderText + ' ' : null,
              ...pChildren.slice(1),
            ].filter(Boolean);

            const newFirstChild = React.cloneElement(firstChild, {}, ...newPChildren);
            remainingChildren = [newFirstChild, ...childrenArray.slice(1)];
          }
        }
      }
    }
  }

  if (alertType) {
    const config = ALERT_CONFIG[alertType];
    return (
      <aside className={`prose-alert ${config.tone}`} role="note">
        <div className="prose-alert-head">
          <FontAwesomeIcon icon={config.icon} className="fa-ico" />
          <span>{config.label}</span>
        </div>
        <div className="prose-alert-body">{remainingChildren}</div>
      </aside>
    );
  }

  return <blockquote>{children}</blockquote>;
}
