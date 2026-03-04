import type { CompletionRecord, Quiz } from "./types";

type QuizCompletedViewProps = {
  quiz: Quiz;
  completedAttempt: CompletionRecord | null;
  quizImageUrl: string | null;
  shareText: string | null;
  copyMessage: string | null;
  onCopyShareText: () => void;
  onBack: () => void;
};

export default function QuizCompletedView({
  quiz,
  completedAttempt,
  quizImageUrl,
  shareText,
  copyMessage,
  onCopyShareText,
  onBack,
}: QuizCompletedViewProps) {
  return (
    <div className="quiz-shell">
      <div className="quiz-header">
        <div>
          <p className="home-tag">Quizz du jour</p>
          <h2>{quiz.quizType === "anime" ? "Anime Quizz" : "Manga Quizz"}</h2>
        </div>
        <div className="hint-counter">Quizz Terminé</div>
      </div>
      <p className="home-subtitle">Tu as deja terminé le quizz d'aujourd'hui</p>
      {quizImageUrl && (
        <div className="quiz-cover-image">
          <img src={quizImageUrl} alt="Couverture de la reponse" />
        </div>
      )}
      {completedAttempt && (
        <p className="hint-feedback">
          Résultat: {completedAttempt.status === "won" ? "Victoire" : "Perdu"} · Indices utilisés:{" "}
          {completedAttempt.hintsUsed}
        </p>
      )}
      {shareText && (
        <button className="ghost-button" onClick={onCopyShareText}>
          Partager mon résultat
        </button>
      )}
      {copyMessage && <p className="hint-feedback">{copyMessage}</p>}
      <button className="ghost-button" onClick={onBack}>
        Retour a l'accueil
      </button>
    </div>
  );
}
