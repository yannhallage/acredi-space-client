interface NotUsersProps {
  hasFilters?: boolean;
  message?: string;
}

const emptyUsersIllustration =
  'https://cdn.dribbble.com/userupload/21717236/file/original-6fa7a01ad0551a7a9cf4ddd21e81bcc4.jpg?resize=752x564&vertical=center';

export function NotUsers({ hasFilters = false, message }: NotUsersProps) {
  const title = message
    ? 'Impossible de charger les utilisateurs'
    : hasFilters
      ? 'Aucun utilisateur trouve'
      : 'Aucun utilisateur';
  const description =
    message ??
    (hasFilters
      ? 'Essayez avec un autre nom ou email.'
      : 'Creez un utilisateur pour commencer.');

  return (
    <div className="notes-empty users-empty">
      <img
        className="users-empty-illustration"
        src={emptyUsersIllustration}
        alt="Aucun utilisateur"
        loading="lazy"
      />
      <strong>{title}</strong>
      <span>{description}</span>
    </div>
  );
}
