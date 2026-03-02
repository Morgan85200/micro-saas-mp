import type { AnimeOption, Hint, QuizType } from "./types";

type QuizActiveViewProps = {
  quizType: QuizType | null;
  currentHintIndex: number;
  hintCount: number;
  currentHint: Hint | null;
  hintImageUrl: string | null;
  loadingAnimes: boolean;
  guess: string;
  animes: AnimeOption[];
  feedback: string | null;
  onGuessChange: (value: string) => void;
  onSubmitGuess: (event: React.FormEvent) => void;
  onBackToTypes: () => void;
};

export default function QuizActiveView({
  quizType,
  currentHintIndex,
  hintCount,
  currentHint,
  hintImageUrl,
  loadingAnimes,
  guess,
  animes,
  feedback,
  onGuessChange,
  onSubmitGuess,
  onBackToTypes,
}: QuizActiveViewProps) {
  return (
    <div className="quiz-shell">
      <div className="quiz-header">
        <div>
          <p className="home-tag">Quizz du jour</p>
          <h2>{quizType === "anime" ? "Anime Quizz" : "Manga Quizz"}</h2>
        </div>
        <div className="hint-counter">
          Indice {Math.min(currentHintIndex + 1, hintCount)} / {hintCount}
        </div>
      </div>

      {currentHint && (
        <div className="hint-panel">
          {hintImageUrl && (
            <div className="hint-image">
              <img src={hintImageUrl} alt="Hint visual" />
            </div>
          )}
          {currentHint.hintText && <p className="hint-text">{currentHint.hintText}</p>}
        </div>
      )}

      <form className="guess-form" onSubmit={onSubmitGuess}>
        <label htmlFor="guess" className="guess-label">
          Ecrivez votre reponse ici
        </label>
        <div className="guess-row">
          <input
            id="guess"
            list="anime-list"
            type="text"
            placeholder={
              loadingAnimes ? "Chargement des animes..." : "Commencez a ecrire un titre"
            }
            value={guess}
            onChange={(e) => onGuessChange(e.target.value)}
            autoComplete="off"
          />
          <button type="submit" className="primary-button" disabled={!guess.trim()}>
            Valider votre reponse
          </button>
        </div>
        <datalist id="anime-list">
          {animes.map((anime) => (
            <option key={`${anime.id}-jp`} value={anime.titleJapanese} />
          ))}
          {animes
            .filter((anime) => anime.titleEnglish)
            .map((anime) => (
              <option key={`${anime.id}-en`} value={anime.titleEnglish || ""} />
            ))}
        </datalist>
        {feedback && <p className="hint-feedback">{feedback}</p>}
      </form>

      <button className="ghost-button" onClick={onBackToTypes}>
        Choisissez un autre type de quizz
      </button>
    </div>
  );
}
