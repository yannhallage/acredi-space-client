import type { ReactNode } from 'react';

import type { Feedback } from '../feedback';
import { Icon, type IconName } from './Icon';

function feedbackIcon(tone: Feedback['tone']): IconName {
  if (tone === 'success') return 'shield';
  if (tone === 'warning') return 'info';
  return 'alert';
}

interface FeedbackBannerProps {
  action?: ReactNode;
  feedback: Feedback;
}

export function FeedbackBanner({ action, feedback }: FeedbackBannerProps) {
  return (
    <div
      className={`auth-feedback auth-feedback-${feedback.tone}${
        action ? ' auth-feedback-with-action' : ''
      }`}
      role="alert"
      aria-live="polite"
    >
      <span className="auth-feedback-icon" aria-hidden="true">
        <Icon name={feedbackIcon(feedback.tone)} size={16} />
      </span>
      <div className="auth-feedback-copy">
        <strong>{feedback.title}</strong>
        <p>{feedback.description}</p>
      </div>
      {action ? <div className="auth-feedback-action">{action}</div> : null}
    </div>
  );
}
