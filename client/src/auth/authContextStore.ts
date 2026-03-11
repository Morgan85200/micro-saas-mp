import { createContext } from "react";

export type Attempt = {
  id: number;
  status: "won" | "lost";
  hintsUsed: number;
  guessValue?: string | null;
  guessedAt: string;
  quiz: {
    id: number;
    quizDate: string;
    quizType: string;
  };
  answer: {
    animeId: number;
    titleJapanese: string;
    titleEnglish?: string | null;
  };
};

export type UserProfile = {
  id: number;
  email: string;
  username: string;
  roles: string[];
  avatarPath?: string | null;
  attempts: Attempt[];
};

export type AuthContextValue = {
  user: UserProfile | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, username: string, password: string) => Promise<boolean>;
  logout: () => void;
  refreshUser: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);
