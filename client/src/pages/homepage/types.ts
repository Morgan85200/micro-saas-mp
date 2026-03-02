export type QuizType = "anime" | "manga";

export type Hint = {
  id: number;
  orderNumber: number;
  hintText: string;
  hintImage?: string | null;
  hintType?: string | null;
};

export type Quiz = {
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

export type AnimeOption = {
  id: number;
  titleJapanese: string;
  titleEnglish?: string | null;
};

export type CompletionRecord = {
  status: "won" | "lost";
  hintsUsed: number;
  guessValue?: string | null;
};

export type QuizStatus = "idle" | "ready" | "won" | "lost" | "completed";
