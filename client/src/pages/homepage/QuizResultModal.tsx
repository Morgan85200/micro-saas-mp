type QuizResultModalProps = {
  isOpen: boolean;
  isWon: boolean;
  displayAnswer: string;
  quizImageUrl: string | null;
  shareText: string | null;
  copyMessage: string | null;
  onCopyShareText: () => void;
  onBack: () => void;
};

export default function QuizResultModal({
  isOpen,
  isWon,
  displayAnswer,
  quizImageUrl,
  shareText,
  copyMessage,
  onCopyShareText,
  onBack,
}: QuizResultModalProps) {
  if (!isOpen) return null;

  return (
    <div className="quiz-modal">
      {isWon && (
        <div className="quiz-fireworks" aria-hidden="true">
          <span className="firework firework-1" />
          <span className="firework firework-2" />
          <span className="firework firework-3" />
          <span className="firework firework-4" />
          <span className="firework firework-5" />
          <span className="firework firework-6" />
        </div>
      )}
      <div className="quiz-modal-card">
        <h3>{isWon ? "Bien joué !" : "Plus aucun indice disponible..."}</h3>
        <p className="modal-text">
          {isWon
            ? `La réponse était bien ${displayAnswer}.`
            : `La réponse correcte était ${displayAnswer}.`}
        </p>
        {quizImageUrl && (
          <div className="quiz-cover-image">
            <img src={quizImageUrl} alt="Couverture de la réponse" />
          </div>
        )}
        {shareText && (
          <button className="ghost-button" onClick={onCopyShareText}>
            Partager mon résultat
          </button>
        )}
        {copyMessage && <p className="hint-feedback">{copyMessage}</p>}
        <button className="primary-button" onClick={onBack}>
          Retour à l'accueil
        </button>
      </div>
    </div>
  );
}
