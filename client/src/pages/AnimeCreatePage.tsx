import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import { authHeaders } from "../auth/authHeaders";
import { apiUrl } from "../config/api";

interface Genre {
  id: number;
  name: string;
}

function AnimeCreatePage() {
  const [titleJapanese, setTitleJapanese] = useState("");
  const [titleEnglish, setTitleEnglish] = useState("");
  const [releaseDate, setReleaseDate] = useState("");
  const [genres, setGenres] = useState<Genre[]>([]);
  const [selectedGenres, setSelectedGenres] = useState<number[]>([]);

  const navigate = useNavigate();
  const { token } = useAuth();

  useEffect(() => {
    fetch(apiUrl("/api/genres"))
      .then((res) => res.json())
      .then((data) => setGenres(data))
      .catch((err) => console.error(err));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch(apiUrl("/api/animes"), {
        method: "POST",
        headers: authHeaders(token, { "Content-Type": "application/json" }),
        body: JSON.stringify({
          titleJapanese,
          titleEnglish,
          releaseDate,
          genreIds: selectedGenres,
        }),
      });
      navigate("/anime");
    } catch (err) {
      console.error("Failed to create anime", err);
    }
  };

  const toggleGenre = (id: number) => {
    setSelectedGenres((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]
    );
  };

  return (
    <div className="page-container">
      <h2>Ajouter un anime</h2>
      <form className="anime-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label><strong>Titre original:</strong></label>
          <input value={titleJapanese} onChange={(e) => setTitleJapanese(e.target.value)} required />
        </div>
        <div className="form-group">
          <label><strong>Titre anglais:</strong></label>
          <input value={titleEnglish} onChange={(e) => setTitleEnglish(e.target.value)} />
        </div>
        <div className="form-group">
          <label><strong>A débuté le:</strong></label>
          <input type="date" value={releaseDate} onChange={(e) => setReleaseDate(e.target.value)} required />
        </div>
        <div className="form-group">
          <label><strong>Genres:</strong></label>
          {genres.map((g) => (
            <label key={g.id} className="genre-checkbox">
              <input
                type="checkbox"
                value={g.id}
                checked={selectedGenres.includes(g.id)}
                onChange={() => toggleGenre(g.id)}
              />
              {g.name}
            </label>
          ))}
        </div>
        <div className="form-buttons">
          <button type="submit">Ajouter</button>
          <button type="button" onClick={() => navigate("/anime")}>Retour à la liste</button>
        </div>
      </form>
    </div>
  );
}

export default AnimeCreatePage;

