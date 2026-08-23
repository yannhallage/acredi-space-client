import type { PollResults } from "../../../../shared/api/polls";

type PollResultsBreakdownProps = {
  results: PollResults | undefined;
  activeQuestionId: string | null;
  onSelectQuestion: (questionId: string) => void;
};

export function PollResultsBreakdown({
  results,
  activeQuestionId,
  onSelectQuestion,
}: PollResultsBreakdownProps) {
  const questions = results?.questions ?? [];

  if (questions.length === 0) {
    return (
      <div className="pd-panel">
        <h3>Questions</h3>
        <p className="pd-muted">Aucune donnée de résultat pour le moment.</p>
      </div>
    );
  }

  return (
    <div className="pd-panel">
      <h3>Questions & scores</h3>
      <ul className="pd-question-list">
        {questions.map((question) => {
          const total = question.options.reduce(
            (sum, option) => sum + option.count,
            0
          );
          const isActive = question.questionId === activeQuestionId;

          return (
            <li key={question.questionId}>
              <button
                type="button"
                className={
                  isActive
                    ? "pd-question-item pd-question-item-active"
                    : "pd-question-item"
                }
                onClick={() => onSelectQuestion(question.questionId)}
              >
                <div className="pd-question-item-top">
                  <strong>{question.title}</strong>
                  <span>{question.type.replaceAll("_", " ")}</span>
                </div>

                {question.type === "TEXT" ? (
                  <p className="pd-muted">
                    {question.textAnswers.length} réponse
                    {question.textAnswers.length > 1 ? "s" : ""} texte
                  </p>
                ) : (
                  <div className="pd-bars">
                    {question.options.map((option) => {
                      const pct =
                        total > 0 ? Math.round((option.count / total) * 100) : 0;
                      return (
                        <div key={option.optionId} className="pd-bar-row">
                          <div className="pd-bar-meta">
                            <span>{option.label}</span>
                            <span>
                              {option.count} · {pct}%
                            </span>
                          </div>
                          <div className="pd-bar-track">
                            <span style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
