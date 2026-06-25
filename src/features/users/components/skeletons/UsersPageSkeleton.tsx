import { USER_SKELETON_KEYS } from "../../constants";

function UserRowSkeleton() {
  return (
    <article className="users-row users-row-skeleton" aria-hidden="true">
      <span className="skeleton-avatar users-initial" />
      <div className="users-person">
        <span className="skeleton-line skeleton-user-name" />
        <span className="skeleton-line skeleton-user-email" />
        <span className="skeleton-line skeleton-user-status" />
      </div>
      <span className="skeleton-pill" />
      <span className="skeleton-status" />
      <span className="skeleton-more" />
    </article>
  );
}

export function UsersPageSkeleton() {
  return (
    <>
      {USER_SKELETON_KEYS.map((item) => (
        <UserRowSkeleton key={item} />
      ))}
    </>
  );
}
