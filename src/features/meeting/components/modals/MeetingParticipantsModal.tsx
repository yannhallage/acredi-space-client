import type { User } from "../../../../shared/types";
import type { Meeting } from "../../types";
import { getUserLabel } from "../../utils";

type MeetingParticipantsModalProps = {
  meeting: Meeting;
  participantSearch: string;
  invitingUserId: string | null;
  usersLoading: boolean;
  usersError: unknown;
  visibleUsers: User[];
  onClose: () => void;
  onSearchChange: (value: string) => void;
  onRetryUsers: () => void;
  onInvite: (user: User) => void;
};

export function MeetingParticipantsModal({
  meeting,
  participantSearch,
  invitingUserId,
  usersLoading,
  usersError,
  visibleUsers,
  onClose,
  onSearchChange,
  onRetryUsers,
  onInvite,
}: MeetingParticipantsModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 px-4"
      onMouseDown={onClose}
    >
      <div
        className="w-full max-w-[460px] rounded-[18px] border border-[var(--border)] bg-[var(--surface)] p-5 text-[var(--text)] shadow-[var(--shadow)] sm:p-6"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <h2 className="text-[16px] font-semibold">Participants</h2>
        <p className="mt-1 text-[12px] font-medium text-[var(--muted-soft)]">
          {meeting.title}
        </p>

        <div className="mt-4 space-y-3">
          <input
            type="text"
            value={participantSearch}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Chercher un utilisateur..."
            className="w-full rounded-[10px] border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3 text-[13px] text-[var(--text)] outline-none focus:border-[var(--accent)]"
          />

          <div className="max-h-[300px] overflow-y-auto rounded-[12px] border border-[var(--border)]">
            {usersLoading ? (
              <div className="p-4 text-center text-[12px] font-medium text-[var(--muted-soft)]">
                Chargement des utilisateurs...
              </div>
            ) : usersError ? (
              <div className="space-y-3 p-4 text-center">
                <p className="text-[12px] font-medium text-red-600">
                  Impossible de charger les utilisateurs.
                </p>
                <button
                  onClick={onRetryUsers}
                  className="rounded-full border border-[var(--border)] px-4 py-2 text-[12px] font-semibold hover:bg-[var(--surface-2)]"
                  type="button"
                >
                  Réessayer
                </button>
              </div>
            ) : visibleUsers.length === 0 ? (
              <div className="p-4 text-center text-[12px] font-medium text-[var(--muted-soft)]">
                Aucun utilisateur trouvé.
              </div>
            ) : (
              visibleUsers.map((user) => (
                <button
                  key={user.id}
                  onClick={() => void onInvite(user)}
                  disabled={Boolean(invitingUserId)}
                  className="flex w-full items-center justify-between gap-3 border-b border-[var(--border)] px-4 py-3 text-left last:border-b-0 hover:bg-[var(--surface-2)] disabled:cursor-not-allowed disabled:opacity-60"
                  type="button"
                >
                  <span className="min-w-0">
                    <span className="block truncate text-[13px] font-semibold">
                      {getUserLabel(user)}
                    </span>
                    {user.email && (
                      <span className="block truncate text-[12px] font-medium text-[var(--muted-soft)]">
                        {user.email}
                      </span>
                    )}
                  </span>
                  {invitingUserId === user.id ? (
                    <span className="shrink-0 text-[11px] font-semibold text-[var(--muted-soft)]">
                      Invitation...
                    </span>
                  ) : (
                    Boolean(
                      (user as User & { role?: string | null }).role,
                    ) && (
                      <span className="shrink-0 rounded-full bg-[var(--surface-2)] px-2 py-1 text-[10px] font-bold">
                        {(user as User & { role?: string | null }).role}
                      </span>
                    )
                  )}
                </button>
              ))
            )}
          </div>
        </div>

        <div className="mt-5 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-full border border-[var(--border)] px-5 py-2 text-[13px] font-semibold hover:bg-[var(--surface-2)]"
            type="button"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
