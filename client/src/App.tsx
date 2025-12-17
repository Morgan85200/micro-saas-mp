import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Link } from "react-router-dom";

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

function App() {
  return (
    <Router>
      <header>
        <h1>Site Morgan Front-End</h1>
        <nav>
          <Link to="/">Home</Link>
          <Link to="/anime">Anime</Link>
          <Link to="/genres">Genres</Link>
          <Link to="/quizzes">Liste des quizz</Link>
        </nav>
      </header>

      <main>
        <Routes>
          <Route path="/" element={<Homepage />} />

          <Route path="/anime" element={<AnimeListPage />} />
          <Route path="/anime/create" element={<AnimeCreatePage />} />
          <Route path="/anime/edit/:id" element={<AnimeEditPage />} />

          <Route path="/genres" element={<GenreListPage />} />
          <Route path="/genres/create" element={<GenreCreatePage />} />
          <Route path="/genres/edit/:id" element={<GenreEditPage />} />

          <Route path="/quizzes" element={<QuizListPage />} />
          <Route path="/quizzes/create" element={<QuizCreatePage />} />
          <Route path="/quizzes/edit/:id" element={<QuizEditPage />} />

        </Routes>
      </main>
    </Router>
  );
}

export default App;
