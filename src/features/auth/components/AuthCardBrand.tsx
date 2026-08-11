import { AcrediMark } from '../../../shared/ui';

export function AuthCardBrand() {
  return (
    <div className="auth-card-brand">
      <div className="auth-card-brand-lockup" aria-label="Acredi Group">
        <AcrediMark size={18} top="#172B4D" left="#8B7FFF" right="#5B6CFF" />
        <span>Acredi Group</span>
      </div>
      <p className="auth-card-brand-tagline">Un compte pour Acredi Space.</p>
    </div>
  );
}
