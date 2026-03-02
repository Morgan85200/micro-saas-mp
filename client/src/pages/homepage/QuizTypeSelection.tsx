import type { QuizType } from "./types";

type QuizTypeSelectionProps = {
  onStartQuiz: (type: QuizType) => void;
};

export default function QuizTypeSelection({ onStartQuiz }: QuizTypeSelectionProps) {
  return (
    <>
      <div className="home-hero">
        <img src="/images/Logo.png" alt="Animangadle" className="home-logo" />
        <h2>Choisissez votre type de quizz souhaite</h2>
        <p className="home-subtitle">Un quizz anime et manga chaque jour !</p>
      </div>

      <div className="type-grid">
        <button className="type-card" onClick={() => onStartQuiz("anime")}>
          <span className="type-title">Anime Quizz</span>
          <span className="type-copy">
            Devinez a partir d'une affiche, d'une planche ou d'une sequence entiere !
          </span>
        </button>
        <button className="type-card" onClick={() => onStartQuiz("manga")}>
          <span className="type-title">Manga Quizz</span>
          <span className="type-copy">
            Devinez a partir d'une couverture de volume, chapitre ou encore d'un panel !
          </span>
        </button>
      </div>
    </>
  );
}
