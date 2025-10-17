import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Homepage from "./pages/Homepage";
import AnimeListPage from "./pages/AnimeListPage";
import AnimeCreatePage from "./pages/AnimeCreatePage";
import AnimeEditPage from "./pages/AnimeEditPage";

import GenreListPage from "./pages/GenreListPage";
import GenreCreatePage from "./pages/GenreCreatePage";
import GenreEditPage from "./pages/GenreEditPage";

function App() {
  return (
    <Router>
      <header>
        <h1>Site Morgan Front-End</h1>
        <nav>
          <a href="/">Home</a>
          <a href="/anime">Anime</a>
          <a href="/genres">Genres</a>
          {/* You can add Genre, Quiz, etc. links here */}
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
        </Routes>
      </main>
    </Router>
  );
}

export default App;
