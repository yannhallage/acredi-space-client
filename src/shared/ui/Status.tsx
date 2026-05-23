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
