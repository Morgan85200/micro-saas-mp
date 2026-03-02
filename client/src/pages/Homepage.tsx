import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Spinner from "../components/Spinner";
import "./Homepage.css";
import { useAuth } from "../auth/useAuth";
import { API_BASE, apiUrl } from "../config/api";

type QuizType = "anime" | "manga";

type Hint = {
  id: number;
  orderNumber: number;
  hintText: string;
  hintImage?: string | null;
  hintType?: string | null;
};

type Quiz = {
  id: number;
  quizDate: string;
  quizType: QuizType;
  quizImage?: string | null;
  anime: {
    id: number;
    titleJapanese: string;
  };
  hints: Hint[];
};

type AnimeOption = {
  id: number;
  titleJapanese: string;
  titleEnglish?: string | null;
};

const ANIME_PAGE_SIZE = 200;

const normalizeGuess = (value: string) => value.trim().toLowerCase();
const formatQuizDate = (date: string) => {
  const [year, month, day] = date.split("-");
  if (!year || !month || !day) return date;
  return `${day}/${month}/${year}`;
};

const base64UrlDecode = (value: string) => {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), "=");
  return atob(padded);
};

type CompletionRecord = {
  status: "won" | "lost";
  hintsUsed: number;
  guessValue?: string | null;
};

export default function Homepage() {
  const { user, token, logout } = useAuth();
  const isAdmin = user?.roles?.includes("ROLE_ADMIN");
  const avatarUrl = user?.avatarPath
    ? `${API_BASE}/uploads/avatar/${user.avatarPath}`
    : null;
  const [quizType, setQuizType] = useState<QuizType | null>(null);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [currentHintIndex, setCurrentHintIndex] = useState(0);
  const [guess, setGuess] = useState("");
  const [animes, setAnimes] = useState<AnimeOption[]>([]);
  const [loadingQuiz, setLoadingQuiz] = useState(false);
  const [loadingAnimes, setLoadingAnimes] = useState(true);
  const [status, setStatus] = useState<"idle" | "ready" | "won" | "lost" | "completed">("idle");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [attemptPosted, setAttemptPosted] = useState(false);
  const [completedAttempt, setCompletedAttempt] = useState<CompletionRecord | null>(null);
  const [copyMessage, setCopyMessage] = useState<string | null>(null);

  const userScope = useMemo(() => {
    if (!token) return "guest";
    try {
      const payloadPart = token.split(".")[1];
      if (!payloadPart) return "auth";
      const payload = JSON.parse(base64UrlDecode(payloadPart)) as {
        username?: string;
        sub?: string;
      };
      const identity = payload.username || payload.sub;
      return identity ? `auth-${identity}` : "auth";
    } catch {
      return "auth";
    }
  }, [token]);
  const progressKey = useCallback(
    (quizId: number) => `quiz-progress-${quizId}-${userScope}`,
    [userScope]
  );
  const completionKey = useCallback(
    (quizId: number) => `quiz-completed-${quizId}-${userScope}`,
    [userScope]
  );

  useEffect(() => {
    const fetchAllAnimes = async () => {
      setLoadingAnimes(true);
      try {
        const firstRes = await fetch(
          apiUrl(`/api/animes?page=1&limit=${ANIME_PAGE_SIZE}`)
        );
        const firstJson = await firstRes.json();
        let allAnimes: AnimeOption[] = firstJson.animes ?? [];
        const totalPages = Math.max(1, Number(firstJson.totalPages || 1));

        if (totalPages > 1) {
          const pageRequests = Array.from({ length: totalPages - 1 }, (_, idx) => {
            const page = idx + 2;
            return fetch(
              apiUrl(`/api/animes?page=${page}&limit=${ANIME_PAGE_SIZE}`)
            ).then((res) => res.json());
          });

          const pages = await Promise.all(pageRequests);
          pages.forEach((page) => {
            if (page?.animes?.length) {
              allAnimes = allAnimes.concat(page.animes);
            }
          });
        }

        setAnimes(allAnimes);
      } catch (err) {
        console.error("Failed to load anime list", err);
      } finally {
        setLoadingAnimes(false);
      }
    };

    fetchAllAnimes();
  }, []);

  const startQuiz = async (type: QuizType) => {
    setQuizType(type);
    setLoadingQuiz(true);
    setQuiz(null);
    setCurrentHintIndex(0);
    setGuess("");
    setFeedback(null);
    setStatus("idle");
    setAttemptPosted(false);
    setCompletedAttempt(null);
    setCopyMessage(null);

    try {
      const res = await fetch(apiUrl(`/api/quizzes/today?type=${type}`));
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "No quiz available right now.");
      }
      setQuiz(data);

      const existingAttempt = user?.attempts?.find((attempt) => attempt.quiz.id === data.id);
      if (existingAttempt) {
        setCompletedAttempt({
          status: existingAttempt.status,
          hintsUsed: existingAttempt.hintsUsed,
          guessValue: existingAttempt.guessValue ?? null,
        });
        setStatus("completed");
        return;
      }

      const storedCompletion = localStorage.getItem(completionKey(data.id));
      if (storedCompletion) {
        try {
          const parsed = JSON.parse(storedCompletion) as CompletionRecord;
          setCompletedAttempt(parsed);
          setStatus("completed");
          return;
        } catch {
          localStorage.removeItem(completionKey(data.id));
        }
      }

      const storedProgress = localStorage.getItem(progressKey(data.id));
      if (storedProgress) {
        try {
          const parsed = JSON.parse(storedProgress) as {
            quizDate: string;
            hintIndex: number;
          };
          if (parsed.quizDate === data.quizDate && parsed.hintIndex < data.hints.length) {
            setCurrentHintIndex(parsed.hintIndex);
            setFeedback("Votre progression a été sauvegardée");
          }
        } catch {
          localStorage.removeItem(progressKey(data.id));
        }
      }

      setStatus("ready");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong loading the quiz.";
      setFeedback(message);
      setStatus("idle");
    } finally {
      setLoadingQuiz(false);
    }
  };

  const resetQuiz = () => {
    setQuizType(null);
    setQuiz(null);
    setCurrentHintIndex(0);
    setGuess("");
    setFeedback(null);
    setStatus("idle");
    setAttemptPosted(false);
    setCompletedAttempt(null);
    setCopyMessage(null);
  };

  const currentHint = quiz?.hints?.[currentHintIndex] ?? null;

  const answerTitles = useMemo(() => {
    if (!quiz) return [];
    const answers: string[] = [];
    if (quiz.anime?.titleJapanese) {
      answers.push(quiz.anime.titleJapanese);
    }
    const matchingAnime = animes.find((a) => a.id === quiz.anime?.id);
    if (matchingAnime?.titleEnglish) {
      answers.push(matchingAnime.titleEnglish);
    }
    return answers;
  }, [quiz, animes]);

  const normalizedAnswers = useMemo(
    () => answerTitles.map((title) => normalizeGuess(title)),
    [answerTitles]
  );

  const displayAnswer = answerTitles.length ? answerTitles.join(" / ") : "Unknown";

  const handleGuessSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!quiz || !currentHint) return;

    const normalizedGuess = normalizeGuess(guess);
    if (!normalizedGuess) return;

    if (normalizedAnswers.includes(normalizedGuess)) {
      setStatus("won");
      setFeedback(null);
      setCompletedAttempt({
        status: "won",
        hintsUsed: currentHintIndex + 1,
        guessValue: guess,
      });
      return;
    }

    const nextIndex = currentHintIndex + 1;
    if (nextIndex < quiz.hints.length) {
      setCurrentHintIndex(nextIndex);
      setGuess("");
      setFeedback("Faux, voici l'indice suivant");
    } else {
      setStatus("lost");
      setFeedback(null);
      setCompletedAttempt({
        status: "lost",
        hintsUsed: quiz.hints.length,
        guessValue: guess,
      });
    }
  };

  const hintImageUrl =
    currentHint?.hintImage ? `${API_BASE}/uploads/hints/${currentHint.hintImage}` : null;
  const quizImageUrl =
    quiz?.quizImage ? `${API_BASE}/uploads/quizzes/${quiz.quizImage}` : null;

  const showModal = status === "won" || status === "lost";
  const shareStatus =
    status === "completed"
      ? completedAttempt?.status
      : status === "won" || status === "lost"
        ? status
        : null;
  const shareTries =
    status === "completed"
      ? completedAttempt?.hintsUsed ?? null
      : status === "won"
        ? currentHintIndex + 1
        : status === "lost" && quiz
          ? quiz.hints.length
          : null;
  const shareText =
    quiz && shareStatus
      ? shareStatus === "won"
        ? `J'ai trouvé l'Animangadle du jour (${formatQuizDate(
            quiz.quizDate
          )}) en ${shareTries ?? "?"} essais ✅`
        : `Je n'ai pas réussi à trouver l'Animangadle du jour (${formatQuizDate(
            quiz.quizDate
          )}) ❌`
      : null;

  const copyShareText = async () => {
    if (!shareText) return;

    try {
      await navigator.clipboard.writeText(shareText);
      setCopyMessage("Résultat enregistré dans le presse-papier ");
      return;
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = shareText;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "absolute";
      textarea.style.left = "-9999px";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopyMessage("Résultat enregistré dans le presse-papier");
    }
  };

  useEffect(() => {
    const postAttempt = async () => {
      if (!quiz || !user || !token || attemptPosted) return;
      if (status !== "won" && status !== "lost") return;

      const hintsUsed = status === "lost" ? quiz.hints.length : currentHintIndex + 1;

      try {
        await fetch(apiUrl(`/api/quizzes/${quiz.id}/attempt`), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status,
            hintsUsed,
            guessValue: guess || null,
          }),
        });
      } catch (err) {
        console.error("Failed to save attempt", err);
      } finally {
        setAttemptPosted(true);
      }
    };

    postAttempt();
  }, [status, quiz, user, token, attemptPosted, currentHintIndex, guess]);

  useEffect(() => {
    if (!quiz || status !== "ready") return;
    const payload = {
      quizDate: quiz.quizDate,
      hintIndex: currentHintIndex,
    };
    localStorage.setItem(progressKey(quiz.id), JSON.stringify(payload));
  }, [quiz, currentHintIndex, status, progressKey]);

  useEffect(() => {
    if (!quiz || !completedAttempt) return;
    localStorage.setItem(completionKey(quiz.id), JSON.stringify(completedAttempt));
    localStorage.removeItem(progressKey(quiz.id));
  }, [quiz, completedAttempt, completionKey, progressKey]);

  if (quizType === null) {
    return (
      <div className="homepage">
        {!isAdmin && (
          <div className="homepage-auth">
            {user ? (
              <>
                <Link to="/profile" className="profile-link">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Profile" className="avatar" />
                  ) : (
                    <span className="avatar-placeholder">{user.username[0]}</span>
                  )}
                  <span>{user.username}</span>
                </Link>
                <button onClick={logout} className="ghost-button">
                  Se déconnecter
                </button>
              </>
            ) : (
              <>
                <Link to="/login">Connexion</Link>
                <Link to="/register">Créer un compte</Link>
              </>
            )}
          </div>
        )}
        <div className="home-hero">
          <img src="/images/Logo.png" alt="Animangadle" className="home-logo" />
          <h2>Choisissez votre type de quizz souhaité</h2>
          <p className="home-subtitle">
            Un quizz anime et manga chaque jour !
          </p>
        </div>

        <div className="type-grid">
          <button className="type-card" onClick={() => startQuiz("anime")}>
            <span className="type-title">Anime Quizz</span>
            <span className="type-copy">Devinez à partir d'une affiche, d'une planche ou d'une séquence entière !</span>
          </button>
          <button className="type-card" onClick={() => startQuiz("manga")}>
            <span className="type-title">Manga Quizz</span>
            <span className="type-copy">Devinez à partir d'une couverture de volume, chapitre ou encore d'un panel !</span>
          </button>
        </div>
      </div>
    );
  }

  if (loadingQuiz) {
    return (
      <div className="homepage">
        <div className="quiz-shell">
          <Spinner />
          <p className="home-subtitle">Chargement du quizz de la journée...</p>
        </div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="homepage">
        {!isAdmin && (
          <div className="homepage-auth">
            {user ? (
              <>
                <Link to="/profile" className="profile-link">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Profile" className="avatar" />
                  ) : (
                    <span className="avatar-placeholder">{user.username[0]}</span>
                  )}
                  <span>{user.username}</span>
                </Link>
                <button onClick={logout} className="ghost-button">
                  Se déconnecter
                </button>
              </>
            ) : (
              <>
                <Link to="/login">Connexion</Link>
                <Link to="/register">Créer un compte</Link>
              </>
            )}
          </div>
        )}
        <div className="quiz-shell">
          <div className="quiz-header">
            <div>
              <p className="home-tag">Quizz du jour</p>
              <h2>{quizType === "anime" ? "Anime Quiz" : "Manga Quiz"}</h2>
            </div>
          </div>
          {feedback && <p className="home-subtitle">{feedback}</p>}
          <button className="ghost-button" onClick={resetQuiz}>
            Retour à la sélection des types
          </button>
        </div>
      </div>
    );
  }

  if (status === "completed" && quiz) {
    return (
      <div className="homepage">
        {!isAdmin && (
          <div className="homepage-auth">
            {user ? (
              <>
                <Link to="/profile" className="profile-link">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Profile" className="avatar" />
                  ) : (
                    <span className="avatar-placeholder">{user.username[0]}</span>
                  )}
                  <span>{user.username}</span>
                </Link>
                <button onClick={logout} className="ghost-button">
                Se déconnecter
                </button>
              </>
            ) : (
              <>
                <Link to="/login">Connexion</Link>
                <Link to="/register">Créer un compte</Link>
              </>
            )}
          </div>
        )}
        <div className="quiz-shell">
          <div className="quiz-header">
            <div>
              <p className="home-tag">Quizz du jour</p>
              <h2>{quiz.quizType === "anime" ? "Anime Quizz" : "Manga Quizz"}</h2>
            </div>
            <div className="hint-counter">Terminé</div>
          </div>
          <p className="home-subtitle">
            Tu as déjà terminé le quizz d'aujourd'hui
          </p>
          {quizImageUrl && (
            <div className="quiz-cover-image">
              <img src={quizImageUrl} alt="Couverture de la réponse" />
            </div>
          )}
          {completedAttempt && (
            <p className="hint-feedback">
              Resultat: {completedAttempt.status === "won" ? "Victoire" : "Perdu"} · Indices utilisés:{" "}
              {completedAttempt.hintsUsed}
            </p>
          )}
          {shareText && (
            <button className="ghost-button" onClick={copyShareText}>
              Partager mon résultat
            </button>
          )}
          {copyMessage && <p className="hint-feedback">{copyMessage}</p>}
          <button className="ghost-button" onClick={resetQuiz}>
            Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="homepage">
      {!isAdmin && (
        <div className="homepage-auth">
          {user ? (
            <>
              <Link to="/profile" className="profile-link">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Profile" className="avatar" />
                ) : (
                  <span className="avatar-placeholder">{user.username[0]}</span>
                )}
                <span>{user.username}</span>
              </Link>
              <button onClick={logout} className="ghost-button">
              Se déconnecter
              </button>
            </>
          ) : (
            <>
              <Link to="/login">Connexion</Link>
              <Link to="/register">Créer un compte</Link>
            </>
          )}
        </div>
      )}
      <div className="quiz-shell">
        <div className="quiz-header">
          <div>
            <p className="home-tag">Quizz du jour</p>
            <h2>{quizType === "anime" ? "Anime Quizz" : "Manga Quizz"}</h2>
          </div>
          <div className="hint-counter">
            Indice {Math.min(currentHintIndex + 1, quiz?.hints.length || 0)} /{" "}
            {quiz?.hints.length || 0}
          </div>
        </div>

        {currentHint && (
          <div className="hint-panel">
            {hintImageUrl && (
              <div className="hint-image">
                <img src={hintImageUrl} alt="Hint visual" />
              </div>
            )}
            {currentHint.hintText && (
              <p className="hint-text">{currentHint.hintText}</p>
            )}
          </div>
        )}

        <form className="guess-form" onSubmit={handleGuessSubmit}>
          <label htmlFor="guess" className="guess-label">
            Ecrivez votre réponse ici
          </label>
          <div className="guess-row">
            <input
              id="guess"
              list="anime-list"
              type="text"
              placeholder={loadingAnimes ? "Chargement des animes..." : "Commencez à écrire un titre"}
              value={guess}
              onChange={(e) => setGuess(e.target.value)}
              autoComplete="off"
            />
            <button type="submit" className="primary-button" disabled={!guess.trim()}>
              Valider votre réponse
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

        <button className="ghost-button" onClick={resetQuiz}>
          Choisissez un autre type de quizz
        </button>
      </div>

      {showModal && (
        <div className="quiz-modal">
          <div className="quiz-modal-card">
            <h3>{status === "won" ? "Bien joué !" : "Plus aucun indice disponible..."}</h3>
            <p className="modal-text">
              {status === "won"
                ? `La réponse était bien ${displayAnswer}.`
                : `La réponse correcte était ${displayAnswer}.`}
            </p>
            {quizImageUrl && (
              <div className="quiz-cover-image">
                <img src={quizImageUrl} alt="Couverture de la réponse" />
              </div>
            )}
            {shareText && (
              <button className="ghost-button" onClick={copyShareText}>
                Partager mon résultat
              </button>
            )}
            {copyMessage && <p className="hint-feedback">{copyMessage}</p>}
            <button className="primary-button" onClick={resetQuiz}>
              Retour à l'accueil
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
