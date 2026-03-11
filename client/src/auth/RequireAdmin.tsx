import type { ReactElement } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./useAuth";
import Spinner from "../components/Spinner";

export default function RequireAdmin({ children }: { children: ReactElement }) {
  const { user, loading } = useAuth();

  if (loading) return <Spinner />;
  if (!user) return <Navigate to="/login" replace />;
  if (!user.roles?.includes("ROLE_ADMIN")) return <Navigate to="/" replace />;

  return children;
}
