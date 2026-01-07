import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { authHeaders } from "../auth/authHeaders";

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
    fetch("http://localhost:8080/api/genres")
      .then((res) => res.json())
      .then((data) => setGenres(data))
      .catch((err) => console.error(err));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch("http://localhost:8080/api/animes", {
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
      <h2>Create Anime</h2>
      <form className="anime-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label><strong>Original Title:</strong></label>
          <input value={titleJapanese} onChange={(e) => setTitleJapanese(e.target.value)} required />
        </div>
        <div className="form-group">
          <label><strong>English Title:</strong></label>
          <input value={titleEnglish} onChange={(e) => setTitleEnglish(e.target.value)} />
        </div>
        <div className="form-group">
          <label><strong>Premiered:</strong></label>
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
          <button type="submit">Create Anime</button>
          <button type="button" onClick={() => navigate("/anime")}>Return to List</button>
        </div>
      </form>
    </div>
  );
}

export default AnimeCreatePage;
