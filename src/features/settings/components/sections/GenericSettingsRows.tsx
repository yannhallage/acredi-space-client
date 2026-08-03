import { useNavigate } from 'react-router-dom';
import type { SettingRow } from '../../types';

type GenericSettingsRowsProps = {
  canUpdate: boolean;
  onClose: () => void;
  rows: SettingRow[];
  sectionTitle: string;
};

export function GenericSettingsRows({
  canUpdate,
  onClose,
  rows,
  sectionTitle,
}: GenericSettingsRowsProps) {
  const navigate = useNavigate();

  return (
    <section className="modal-setting-section">
      <h4>{sectionTitle}</h4>

      {rows.map((row) => (
        <article className="modal-setting-row" key={row.title}>
          <div>
            <strong>{row.title}</strong>
            <p>{row.description}</p>
          </div>
          <button
            className="button ghost mini"
            type="button"
            disabled={!canUpdate}
            onClick={() => {
              if (!canUpdate || !row.href) {
                return;
              }
              navigate(row.href);
              onClose();
            }}
          >
            {canUpdate ? row.action : 'Lecture seule'}
          </button>
        </article>
      ))}
    </section>
  );
}
