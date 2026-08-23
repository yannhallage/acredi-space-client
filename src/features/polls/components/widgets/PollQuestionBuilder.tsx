import { Icon } from "../../../../shared/ui";
import type { PollQuestionType } from "../../../../shared/api/polls";
import type { PollQuestionDraft } from "../../pollForm";

type PollQuestionBuilderProps = {
  question: PollQuestionDraft;
  index: number;
  canRemove: boolean;
  onChangeTitle: (value: string) => void;
  onChangeDescription: (value: string) => void;
  onChangeType: (type: PollQuestionType) => void;
  onToggleRequired: () => void;
  onAddOption: () => void;
  onUpdateOption: (optionKey: string, label: string) => void;
  onRemoveOption: (optionKey: string) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: () => void;
};

const QUESTION_TYPES: Array<{ value: PollQuestionType; label: string }> = [
  { value: "SINGLE_CHOICE", label: "Choix unique" },
  { value: "MULTIPLE_CHOICE", label: "Choix multiple" },
  { value: "TEXT", label: "Texte libre" },
];

export function PollQuestionBuilder({
  question,
  index,
  canRemove,
  onChangeTitle,
  onChangeDescription,
  onChangeType,
  onToggleRequired,
  onAddOption,
  onUpdateOption,
  onRemoveOption,
  onMoveUp,
  onMoveDown,
  onRemove,
}: PollQuestionBuilderProps) {
  return (
    <section className="pc-question">
      <header className="pc-question-header">
        <div>
          <span className="pc-question-index">Question {index + 1}</span>
          <h3>Configurer la question</h3>
        </div>
        <div className="pc-question-actions">
          <button type="button" onClick={onMoveUp} aria-label="Monter">
            <Icon name="chevDown" size={14} className="pc-rotate-up" />
          </button>
          <button type="button" onClick={onMoveDown} aria-label="Descendre">
            <Icon name="chevDown" size={14} />
          </button>
          {canRemove ? (
            <button type="button" onClick={onRemove} aria-label="Supprimer">
              <Icon name="trash" size={14} />
            </button>
          ) : null}
        </div>
      </header>

      <label className="pc-field">
        <span>Intitulé</span>
        <input
          value={question.title}
          onChange={(event) => onChangeTitle(event.target.value)}
          placeholder="Ex. Comment évaluez-vous votre expérience ?"
        />
      </label>

      <label className="pc-field">
        <span>Description (optionnel)</span>
        <textarea
          rows={2}
          value={question.description}
          onChange={(event) => onChangeDescription(event.target.value)}
          placeholder="Précision utile pour les répondants"
        />
      </label>

      <div className="pc-question-row">
        <label className="pc-field">
          <span>Type</span>
          <select
            value={question.type}
            onChange={(event) =>
              onChangeType(event.target.value as PollQuestionType)
            }
          >
            {QUESTION_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </label>

        <label className="pc-toggle">
          <input
            type="checkbox"
            checked={question.required}
            onChange={onToggleRequired}
          />
          <span>Obligatoire</span>
        </label>
      </div>

      {question.type !== "TEXT" ? (
        <div className="pc-options">
          <div className="pc-options-header">
            <strong>Options</strong>
            <button type="button" className="button ghost" onClick={onAddOption}>
              <Icon name="plus" size={13} />
              Ajouter
            </button>
          </div>
          <ul>
            {question.options.map((option, optionIndex) => (
              <li key={option.key}>
                <span>{optionIndex + 1}</span>
                <input
                  value={option.label}
                  onChange={(event) =>
                    onUpdateOption(option.key, event.target.value)
                  }
                  placeholder={`Option ${optionIndex + 1}`}
                />
                <button
                  type="button"
                  aria-label="Supprimer l'option"
                  onClick={() => onRemoveOption(option.key)}
                >
                  <Icon name="x" size={13} />
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="pc-text-hint">
          Les répondants saisiront une réponse en texte libre.
        </p>
      )}
    </section>
  );
}
