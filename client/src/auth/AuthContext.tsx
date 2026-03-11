import { useCallback, useEffect, useMemo, useState } from "react";
import { AuthContext, type AuthContextValue, type UserProfile } from "./authContextStore";
import { apiUrl } from "../config/api";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(localStorage.getItem("auth_token"));
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const refreshUser = useCallback(async () => {
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(apiUrl("/api/me"), {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        setUser(null);
        setLoading(false);
        return;
      }

      const json = await res.json();
      setUser(json);
    } catch (err) {
      console.error("Failed to load profile", err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);

    try {
      const res = await fetch(apiUrl("/api/login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok || !data?.token) {
        setLoading(false);
        return false;
      }

      localStorage.setItem("auth_token", data.token);
      setToken(data.token);
      return true;
    } catch (err) {
      console.error("Login failed", err);
      setLoading(false);
      return false;
    }
  }, []);

  const register = useCallback(async (email: string, username: string, password: string) => {
    try {
      const res = await fetch(apiUrl("/api/register"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, username, password }),
      });
      return res.ok;
    } catch (err) {
      console.error("Registration failed", err);
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("auth_token");
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ user, token, loading, login, register, logout, refreshUser }),
    [user, token, loading, login, register, logout, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
