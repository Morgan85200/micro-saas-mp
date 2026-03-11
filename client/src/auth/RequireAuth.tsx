import type { ReactElement } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./useAuth";
import Spinner from "../components/Spinner";

export default function RequireAuth({ children }: { children: ReactElement }) {
  const { user, loading } = useAuth();

  if (loading) return <Spinner />;
  if (!user) return <Navigate to="/login" replace />;

  return children;
}
