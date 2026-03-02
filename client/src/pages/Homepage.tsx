import { useCallback, useEffect, useMemo, useState } from "react";
import Spinner from "../components/Spinner";
import "./Homepage.css";
import { useAuth } from "../auth/useAuth";
import { API_BASE, apiUrl } from "../config/api";
import HomepageAuth from "./homepage/HomepageAuth";
import QuizActiveView from "./homepage/QuizActiveView";
import QuizCompletedView from "./homepage/QuizCompletedView";
import QuizResultModal from "./homepage/QuizResultModal";
import QuizTypeSelection from "./homepage/QuizTypeSelection";
import QuizUnavailableView from "./homepage/QuizUnavailableView";
import type { AnimeOption, CompletionRecord, Quiz, QuizType, QuizStatus } from "./homepage/types";
import {
  ANIME_PAGE_SIZE,
  getShareContext,
  getUserScopeFromToken,
  normalizeGuess,
} from "./homepage/utils";

export default function Homepage() {
  const { user, token, logout } = useAuth();
  const isAdmin = user?.roles?.includes("ROLE_ADMIN");
  const avatarUrl = user?.avatarPath ? `${API_BASE}/uploads/avatar/${user.avatarPath}` : null;

  const [quizType, setQuizType] = useState<QuizType | null>(null);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [currentHintIndex, setCurrentHintIndex] = useState(0);
  const [guess, setGuess] = useState("");
  const [animes, setAnimes] = useState<AnimeOption[]>([]);
  const [loadingQuiz, setLoadingQuiz] = useState(false);
  const [loadingAnimes, setLoadingAnimes] = useState(true);
  const [status, setStatus] = useState<QuizStatus>("idle");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [attemptPosted, setAttemptPosted] = useState(false);
  const [completedAttempt, setCompletedAttempt] = useState<CompletionRecord | null>(null);
  const [copyMessage, setCopyMessage] = useState<string | null>(null);

  const userScope = useMemo(() => getUserScopeFromToken(token), [token]);

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
        const firstRes = await fetch(apiUrl(`/api/animes?page=1&limit=${ANIME_PAGE_SIZE}`));
        const firstJson = await firstRes.json();
        let allAnimes: AnimeOption[] = firstJson.animes ?? [];
        const totalPages = Math.max(1, Number(firstJson.totalPages || 1));

        if (totalPages > 1) {
          const pageRequests = Array.from({ length: totalPages - 1 }, (_, idx) => {
            const page = idx + 2;
            return fetch(apiUrl(`/api/animes?page=${page}&limit=${ANIME_PAGE_SIZE}`)).then((res) =>
              res.json()
            );
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
          const parsed = JSON.parse(storedProgress) as { quizDate: string; hintIndex: number };
          if (parsed.quizDate === data.quizDate && parsed.hintIndex < data.hints.length) {
            setCurrentHintIndex(parsed.hintIndex);
            setFeedback("Votre progression a ete sauvegardee");
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

  const currentHint = quiz?.hints?.[currentHintIndex] ?? null;

  const answerTitles = useMemo(() => {
    if (!quiz) return [];

    const answers: string[] = [];
    if (quiz.anime?.titleJapanese) {
      answers.push(quiz.anime.titleJapanese);
    }

    const matchingAnime = animes.find((anime) => anime.id === quiz.anime?.id);
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

  const hintImageUrl = currentHint?.hintImage
    ? `${API_BASE}/uploads/hints/${currentHint.hintImage}`
    : null;

  const quizImageUrl = quiz?.quizImage ? `${API_BASE}/uploads/quizzes/${quiz.quizImage}` : null;

  const showModal = status === "won" || status === "lost";

  const shareContext = getShareContext(
    quiz?.quizDate ?? null,
    status,
    completedAttempt,
    currentHintIndex,
    quiz?.hints.length ?? 0
  );

  const copyShareText = async () => {
    if (!shareContext?.shareText) return;

    try {
      await navigator.clipboard.writeText(shareContext.shareText);
      setCopyMessage("Resultat enregistre dans le presse-papier");
      return;
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = shareContext.shareText;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "absolute";
      textarea.style.left = "-9999px";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopyMessage("Resultat enregistre dans le presse-papier");
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

    localStorage.setItem(
      progressKey(quiz.id),
      JSON.stringify({
        quizDate: quiz.quizDate,
        hintIndex: currentHintIndex,
      })
    );
  }, [quiz, currentHintIndex, status, progressKey]);

  useEffect(() => {
    if (!quiz || !completedAttempt) return;

    localStorage.setItem(completionKey(quiz.id), JSON.stringify(completedAttempt));
    localStorage.removeItem(progressKey(quiz.id));
  }, [quiz, completedAttempt, completionKey, progressKey]);

  if (quizType === null) {
    return (
      <div className="homepage">
        <HomepageAuth isAdmin={isAdmin} user={user} avatarUrl={avatarUrl} onLogout={logout} />
        <QuizTypeSelection onStartQuiz={startQuiz} />
      </div>
    );
  }

  if (loadingQuiz) {
    return (
      <div className="homepage">
        <HomepageAuth isAdmin={isAdmin} user={user} avatarUrl={avatarUrl} onLogout={logout} />
        <div className="quiz-shell">
          <Spinner />
          <p className="home-subtitle">Chargement du quizz de la journee...</p>
        </div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="homepage">
        <HomepageAuth isAdmin={isAdmin} user={user} avatarUrl={avatarUrl} onLogout={logout} />
        <QuizUnavailableView quizType={quizType} feedback={feedback} onBack={resetQuiz} />
      </div>
    );
  }

  if (status === "completed") {
    return (
      <div className="homepage">
        <HomepageAuth isAdmin={isAdmin} user={user} avatarUrl={avatarUrl} onLogout={logout} />
        <QuizCompletedView
          quiz={quiz}
          completedAttempt={completedAttempt}
          quizImageUrl={quizImageUrl}
          shareText={shareContext?.shareText ?? null}
          copyMessage={copyMessage}
          onCopyShareText={copyShareText}
          onBack={resetQuiz}
        />
      </div>
    );
  }

  return (
    <div className="homepage">
      <HomepageAuth isAdmin={isAdmin} user={user} avatarUrl={avatarUrl} onLogout={logout} />

      <QuizActiveView
        quizType={quizType}
        currentHintIndex={currentHintIndex}
        hintCount={quiz.hints.length}
        currentHint={currentHint}
        hintImageUrl={hintImageUrl}
        loadingAnimes={loadingAnimes}
        guess={guess}
        animes={animes}
        feedback={feedback}
        onGuessChange={setGuess}
        onSubmitGuess={handleGuessSubmit}
        onBackToTypes={resetQuiz}
      />

      <QuizResultModal
        isOpen={showModal}
        isWon={status === "won"}
        displayAnswer={displayAnswer}
        quizImageUrl={quizImageUrl}
        shareText={shareContext?.shareText ?? null}
        copyMessage={copyMessage}
        onCopyShareText={copyShareText}
        onBack={resetQuiz}
      />
    </div>
  );
}
