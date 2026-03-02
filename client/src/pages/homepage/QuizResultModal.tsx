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
      <div className="quiz-modal-card">
        <h3>{isWon ? "Bien joue !" : "Plus aucun indice disponible..."}</h3>
        <p className="modal-text">
          {isWon
            ? `La reponse etait bien ${displayAnswer}.`
            : `La reponse correcte etait ${displayAnswer}.`}
        </p>
        {quizImageUrl && (
          <div className="quiz-cover-image">
            <img src={quizImageUrl} alt="Couverture de la reponse" />
          </div>
        )}
        {shareText && (
          <button className="ghost-button" onClick={onCopyShareText}>
            Partager mon resultat
          </button>
        )}
        {copyMessage && <p className="hint-feedback">{copyMessage}</p>}
        <button className="primary-button" onClick={onBack}>
          Retour a l'accueil
        </button>
      </div>
    </div>
  );
}
