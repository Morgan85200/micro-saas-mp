import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Spinner from "../components/Spinner";
import "./Homepage.css";
import { useAuth } from "../auth/AuthContext";

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

const API_BASE = "http://localhost:8080";
const ANIME_PAGE_SIZE = 200;

const normalizeGuess = (value: string) => value.trim().toLowerCase();

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
  const [status, setStatus] = useState<"idle" | "ready" | "won" | "lost" | "error" | "completed">("idle");
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [attemptPosted, setAttemptPosted] = useState(false);
  const [completedAttempt, setCompletedAttempt] = useState<CompletionRecord | null>(null);

  const progressKey = (quizId: number) =>
    `quiz-progress-${quizId}-${user?.id ?? "guest"}`;

  const completionKey = (quizId: number) =>
    `quiz-completed-${quizId}-${user?.id ?? "guest"}`;

  useEffect(() => {
    const fetchAllAnimes = async () => {
      setLoadingAnimes(true);
      try {
        const firstRes = await fetch(
          `${API_BASE}/api/animes?page=1&limit=${ANIME_PAGE_SIZE}`
        );
        const firstJson = await firstRes.json();
        let allAnimes: AnimeOption[] = firstJson.animes ?? [];
        const totalPages = Math.max(1, Number(firstJson.totalPages || 1));

        if (totalPages > 1) {
          const pageRequests = Array.from({ length: totalPages - 1 }, (_, idx) => {
            const page = idx + 2;
            return fetch(
              `${API_BASE}/api/animes?page=${page}&limit=${ANIME_PAGE_SIZE}`
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
    setError(null);
    setStatus("idle");
    setAttemptPosted(false);
    setCompletedAttempt(null);

    try {
      const res = await fetch(`${API_BASE}/api/quizzes/today?type=${type}`);
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
            setFeedback("Welcome back! Pick up where you left off.");
          }
        } catch {
          localStorage.removeItem(progressKey(data.id));
        }
      }

      setStatus("ready");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong loading the quiz.";
      setError(message);
      setStatus("error");
    } finally {
      setLoadingQuiz(false);
    }
  };

  const resetQuiz = () => {
    if (quiz?.id) {
      localStorage.removeItem(progressKey(quiz.id));
    }
    setQuizType(null);
    setQuiz(null);
    setCurrentHintIndex(0);
    setGuess("");
    setFeedback(null);
    setError(null);
    setStatus("idle");
    setAttemptPosted(false);
    setCompletedAttempt(null);
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
      setFeedback("Not quite. Here is the next hint!");
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

  const showModal = status === "won" || status === "lost";

  useEffect(() => {
    const postAttempt = async () => {
      if (!quiz || !user || !token || attemptPosted) return;
      if (status !== "won" && status !== "lost") return;

      const hintsUsed = status === "lost" ? quiz.hints.length : currentHintIndex + 1;

      try {
        await fetch(`${API_BASE}/api/quizzes/${quiz.id}/attempt`, {
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
  }, [quiz, currentHintIndex, status]);

  useEffect(() => {
    if (!quiz || !completedAttempt) return;
    localStorage.setItem(completionKey(quiz.id), JSON.stringify(completedAttempt));
    localStorage.removeItem(progressKey(quiz.id));
  }, [quiz, completedAttempt]);

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
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link to="/login">Login</Link>
                <Link to="/register">Register</Link>
              </>
            )}
          </div>
        )}
        <div className="home-hero">
          <p className="home-tag">Daily Guess Challenge</p>
          <h2>Pick your quiz mode for today</h2>
          <p className="home-subtitle">
            One quiz a day. Follow the hints, trust your instincts, and win the streak.
          </p>
        </div>

        <div className="type-grid">
          <button className="type-card" onClick={() => startQuiz("anime")}>
            <span className="type-title">Anime Quiz</span>
            <span className="type-copy">Classic series, iconic characters, deep cuts.</span>
          </button>
          <button className="type-card" onClick={() => startQuiz("manga")}>
            <span className="type-title">Manga Quiz</span>
            <span className="type-copy">Panels, volumes, and legendary arcs await.</span>
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
          <p className="home-subtitle">Loading today&apos;s quiz...</p>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="homepage">
        <div className="quiz-shell">
          <h2>Today&apos;s quiz is missing</h2>
          <p className="home-subtitle">{error}</p>
          <button className="ghost-button" onClick={resetQuiz}>
            Back to quiz types
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
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link to="/login">Login</Link>
                <Link to="/register">Register</Link>
              </>
            )}
          </div>
        )}
        <div className="quiz-shell">
          <div className="quiz-header">
            <div>
              <p className="home-tag">Quiz of the day</p>
              <h2>{quiz.quizType === "anime" ? "Anime Quiz" : "Manga Quiz"}</h2>
            </div>
            <div className="hint-counter">Completed</div>
          </div>
          <p className="home-subtitle">
            You already finished today&apos;s quiz.
          </p>
          {completedAttempt && (
            <p className="hint-feedback">
              Result: {completedAttempt.status === "won" ? "Won" : "Lost"} · Hints used:{" "}
              {completedAttempt.hintsUsed}
            </p>
          )}
          <button className="ghost-button" onClick={resetQuiz}>
            Back to quiz types
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
                Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </>
          )}
        </div>
      )}
      <div className="quiz-shell">
        <div className="quiz-header">
          <div>
            <p className="home-tag">Quiz of the day</p>
            <h2>{quizType === "anime" ? "Anime Quiz" : "Manga Quiz"}</h2>
          </div>
          <div className="hint-counter">
            Hint {Math.min(currentHintIndex + 1, quiz?.hints.length || 0)} /{" "}
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
            Your guess
          </label>
          <div className="guess-row">
            <input
              id="guess"
              list="anime-list"
              type="text"
              placeholder={loadingAnimes ? "Loading titles..." : "Start typing a title"}
              value={guess}
              onChange={(e) => setGuess(e.target.value)}
              autoComplete="off"
            />
            <button type="submit" className="primary-button" disabled={!guess.trim()}>
              Submit guess
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
          Choose another quiz type
        </button>
      </div>

      {showModal && (
        <div className="quiz-modal">
          <div className="quiz-modal-card">
            <h3>{status === "won" ? "You got it!" : "No more hints today"}</h3>
            <p className="modal-text">
              {status === "won"
                ? `The answer is ${displayAnswer}.`
                : `The correct answer was ${displayAnswer}.`}
            </p>
            <button className="primary-button" onClick={resetQuiz}>
              Back to quiz types
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
