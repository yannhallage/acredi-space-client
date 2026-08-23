import type { PollQuestion } from "../../../../shared/api/polls";

type AnswerState = {
  optionIds: string[];
  textValue: string;
};

type PollTakeQuestionProps = {
  question: PollQuestion;
  answer: AnswerState;
  onChange: (next: AnswerState) => void;
};

export function PollTakeQuestion({
  question,
  answer,
  onChange,
}: PollTakeQuestionProps) {
  if (question.type === "TEXT") {
    return (
      <div className="pt-question">
        <h2>{question.title}</h2>
        {question.description ? <p>{question.description}</p> : null}
        <textarea
          rows={5}
          value={answer.textValue}
          onChange={(event) =>
            onChange({ optionIds: [], textValue: event.target.value })
          }
          placeholder="Votre réponse…"
        />
      </div>
    );
  }

  const isMultiple = question.type === "MULTIPLE_CHOICE";

  return (
    <div className="pt-question">
      <h2>{question.title}</h2>
      {question.description ? <p>{question.description}</p> : null}

      <ul className="pt-options">
        {question.options.map((option) => {
          const checked = answer.optionIds.includes(option.id);

          return (
            <li key={option.id}>
              <label
                className={
                  checked ? "pt-option pt-option-selected" : "pt-option"
                }
              >
                <input
                  type={isMultiple ? "checkbox" : "radio"}
                  name={`question-${question.id}`}
                  checked={checked}
                  onChange={() => {
                    if (isMultiple) {
                      onChange({
                        textValue: "",
                        optionIds: checked
                          ? answer.optionIds.filter((id) => id !== option.id)
                          : [...answer.optionIds, option.id],
                      });
                      return;
                    }

                    onChange({ textValue: "", optionIds: [option.id] });
                  }}
                />
                <span>{option.label}</span>
              </label>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
