import { Icon } from './Icon';

export function LoadingState({ label = 'Chargement des donnees...' }: { label?: string }) {
  return (
    <div className="state-panel">
      <span className="loader-dot" />
      <span>{label}</span>
    </div>
  );
}

export function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="state-panel state-empty">
      <Icon name="search" size={18} />
      <strong>{title}</strong>
      <span>{body}</span>
    </div>
  );
}

export function AccessDeniedState({
  body = "Vous n'avez pas les droits necessaires pour acceder a cette section.",
  title = 'Acces refuse',
}: {
  body?: string;
  title?: string;
}) {
  return (
    <div className="state-panel state-empty">
      <Icon name="lock" size={18} />
      <strong>{title}</strong>
      <span>{body}</span>
    </div>
  );
}
