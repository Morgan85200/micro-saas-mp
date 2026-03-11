import type { QuizType } from "./types";

type QuizUnavailableViewProps = {
  quizType: QuizType | null;
  feedback: string | null;
  onBack: () => void;
};

export default function QuizUnavailableView({
  quizType,
  feedback,
  onBack,
}: QuizUnavailableViewProps) {
  return (
    <div className="quiz-shell">
      <div className="quiz-header">
        <div>
          <p className="home-tag">Quizz du jour</p>
          <h2>{quizType === "anime" ? "Anime Quiz" : "Manga Quiz"}</h2>
        </div>
      </div>
      {feedback && <p className="home-subtitle">{feedback}</p>}
      <button className="ghost-button" onClick={onBack}>
        Retour a la selection des types
      </button>
    </div>
  );
}
