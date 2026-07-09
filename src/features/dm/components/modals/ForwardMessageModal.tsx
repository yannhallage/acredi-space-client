import { useMemo, useState } from "react";

type ForwardTarget = {
  id: string;
  name: string;
  type: "user" | "channel" | "team";
};

type ForwardMessageModalProps = {
  open: boolean;
  selectedMessagesCount: number;
  targets: ForwardTarget[];
  onClose: () => void;
  onConfirm: (payload: {
    targetUserIds: string[];
    targetChannelIds: string[];
    targetTeamIds: string[];
  }) => void;
};

export function ForwardMessageModal({
  open,
  selectedMessagesCount,
  targets,
  onClose,
  onConfirm,
}: ForwardMessageModalProps) {
  const [search, setSearch] = useState("");
  const [selectedTargetIds, setSelectedTargetIds] = useState<string[]>([]);

  const filteredTargets = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) return targets;

    return targets.filter((target) =>
      target.name.toLowerCase().includes(value)
    );
  }, [search, targets]);

  function toggleTarget(targetId: string) {
    setSelectedTargetIds((current) => {
      if (current.includes(targetId)) {
        return current.filter((id) => id !== targetId);
      }

      return [...current, targetId];
    });
  }

  function handleConfirm() {
    const selectedTargets = targets.filter((target) =>
      selectedTargetIds.includes(target.id)
    );

    onConfirm({
      targetUserIds: selectedTargets
        .filter((target) => target.type === "user")
        .map((target) => target.id),
      targetChannelIds: selectedTargets
        .filter((target) => target.type === "channel")
        .map((target) => target.id),
      targetTeamIds: selectedTargets
        .filter((target) => target.type === "team")
        .map((target) => target.id),
    });

    setSearch("");
    setSelectedTargetIds([]);
  }

  function handleClose() {
    setSearch("");
    setSelectedTargetIds([]);
    onClose();
  }

  if (!open) return null;

  return (
    <div className="forward-modal-overlay">
      <div className="forward-modal">
        <div className="forward-modal-header">
          <div>
            <h2>Transférer</h2>
            <p>
              {selectedMessagesCount} message
              {selectedMessagesCount > 1 ? "s" : ""} sélectionné
              {selectedMessagesCount > 1 ? "s" : ""}
            </p>
          </div>

          <button type="button" onClick={handleClose}>
            ✕
          </button>
        </div>

        <input
          className="forward-modal-search"
          placeholder="Rechercher une personne ou un groupe..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />

        <div className="forward-modal-list">
          {filteredTargets.length ? (
            filteredTargets.map((target) => {
              const selected = selectedTargetIds.includes(target.id);

              return (
                <button
                  key={`${target.type}-${target.id}`}
                  type="button"
                  className={
                    selected
                      ? "forward-modal-target selected"
                      : "forward-modal-target"
                  }
                  onClick={() => toggleTarget(target.id)}
                >
                  <span>
                    <strong>{target.name}</strong>
                    {/* <small>
                      {target.type === "user" ? "Utilisateur" : "Groupe"}
                    </small> */}

                    <small>
                      {target.type === "user"
                      ? "Utilisateur"
                      : target.type === "team"
                      ? "Equipe"
                      : "Groupe"}
                    </small>
                  </span>

                  <span>{selected ? "✓" : ""}</span>
                </button>
              );
            })
          ) : (
            <p className="forward-modal-empty">Aucun résultat.</p>
          )}
        </div>

        <div className="forward-modal-footer">
          <button type="button" onClick={handleClose}>
            Annuler
          </button>

          <button
            type="button"
            disabled={!selectedTargetIds.length}
            onClick={handleConfirm}
          >
            Transférer
          </button>
        </div>
      </div>
    </div>
  );
}