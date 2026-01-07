import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

import Homepage from "./pages/Homepage";
import AnimeListPage from "./pages/AnimeListPage";
import AnimeCreatePage from "./pages/AnimeCreatePage";
import AnimeEditPage from "./pages/AnimeEditPage";

import GenreListPage from "./pages/GenreListPage";
import GenreCreatePage from "./pages/GenreCreatePage";
import GenreEditPage from "./pages/GenreEditPage";

import QuizListPage from "./pages/QuizListPage";
import QuizCreatePage from "./pages/QuizCreatePage";
import QuizEditPage from "./pages/QuizEditPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProfilePage from "./pages/ProfilePage";
import { AuthProvider, useAuth } from "./auth/AuthContext";
import RequireAdmin from "./auth/RequireAdmin";
import RequireAuth from "./auth/RequireAuth";

const API_BASE = "http://localhost:8080";

function AppHeader() {
  const { user, logout } = useAuth();
  const isAdmin = user?.roles?.includes("ROLE_ADMIN");
  const avatarUrl = user?.avatarPath
    ? `${API_BASE}/uploads/avatar/${user.avatarPath}`
    : null;

  if (!isAdmin) {
    return null;
  }

  return (
    <header className="app-header">
      <div className="header-left">
        <h1>Site Morgan Front-End</h1>
        <nav>
          <Link to="/">Home</Link>
          {isAdmin && <Link to="/anime">Anime</Link>}
          {isAdmin && <Link to="/genres">Genres</Link>}
          {isAdmin && <Link to="/quizzes">Liste des quizz</Link>}
        </nav>
      </div>
      <div className="header-right">
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
        ) : null}
      </div>
    </header>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppHeader />

        <main>
          <Routes>
            <Route path="/" element={<Homepage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route
              path="/profile"
              element={
                <RequireAuth>
                  <ProfilePage />
                </RequireAuth>
              }
            />

            <Route
              path="/anime"
              element={
                <RequireAdmin>
                  <AnimeListPage />
                </RequireAdmin>
              }
            />
            <Route
              path="/anime/create"
              element={
                <RequireAdmin>
                  <AnimeCreatePage />
                </RequireAdmin>
              }
            />
            <Route
              path="/anime/edit/:id"
              element={
                <RequireAdmin>
                  <AnimeEditPage />
                </RequireAdmin>
              }
            />

            <Route
              path="/genres"
              element={
                <RequireAdmin>
                  <GenreListPage />
                </RequireAdmin>
              }
            />
            <Route
              path="/genres/create"
              element={
                <RequireAdmin>
                  <GenreCreatePage />
                </RequireAdmin>
              }
            />
            <Route
              path="/genres/edit/:id"
              element={
                <RequireAdmin>
                  <GenreEditPage />
                </RequireAdmin>
              }
            />

            <Route
              path="/quizzes"
              element={
                <RequireAdmin>
                  <QuizListPage />
                </RequireAdmin>
              }
            />
            <Route
              path="/quizzes/create"
              element={
                <RequireAdmin>
                  <QuizCreatePage />
                </RequireAdmin>
              }
            />
            <Route
              path="/quizzes/edit/:id"
              element={
                <RequireAdmin>
                  <QuizEditPage />
                </RequireAdmin>
              }
            />
          </Routes>
        </main>
      </Router>
    </AuthProvider>
  );
}

export default App;
