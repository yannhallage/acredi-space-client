import { Icon, type IconName } from '../../../shared/ui';
import type { AuthFeedback } from './authFeedback';

function feedbackIcon(tone: AuthFeedback['tone']): IconName {
  if (tone === 'success') return 'shield';
  if (tone === 'warning') return 'info';
  return 'alert';
}

interface AuthFeedbackBannerProps {
  feedback: AuthFeedback;
}

export function AuthFeedbackBanner({ feedback }: AuthFeedbackBannerProps) {
  return (
    <div className={`auth-feedback auth-feedback-${feedback.tone}`} role="alert" aria-live="polite">
      <span className="auth-feedback-icon" aria-hidden="true">
        <Icon name={feedbackIcon(feedback.tone)} size={16} />
      </span>
      <div className="auth-feedback-copy">
        <strong>{feedback.title}</strong>
        <p>{feedback.description}</p>
      </div>
    </div>
  );
}
