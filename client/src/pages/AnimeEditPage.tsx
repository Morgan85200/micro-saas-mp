import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Spinner from "../components/Spinner";
import { useAuth } from "../auth/AuthContext";
import { authHeaders } from "../auth/authHeaders";

interface Genre {
  id: number;
  name: string;
}

interface Anime {
  id: number;
  titleJapanese: string;
  titleEnglish?: string;
  releaseDate: string;
  genreIds: number[];
}

function AnimeEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [titleJapanese, setTitleJapanese] = useState("");
  const [titleEnglish, setTitleEnglish] = useState("");
  const [releaseDate, setReleaseDate] = useState("");
  const [genreIds, setGenreIds] = useState<number[]>([]);
  const [allGenres, setAllGenres] = useState<Genre[]>([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  // Fetch existing anime data
  useEffect(() => {
    fetch(`http://localhost:8080/api/animes/${id}`)
      .then((res) => res.json())
      .then((data: Anime) => {
        setTitleJapanese(data.titleJapanese);
        setTitleEnglish(data.titleEnglish || "");
        setReleaseDate(data.releaseDate);
        setGenreIds(data.genreIds || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch anime:", err);
        setLoading(false);
      });
  }, [id]);

  // Fetch all genres for multi-select
  useEffect(() => {
    fetch("http://localhost:8080/api/genres")
      .then((res) => res.json())
      .then((data: Genre[]) => setAllGenres(data))
      .catch((err) => console.error("Failed to fetch genres:", err));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch(`http://localhost:8080/api/animes/${id}`, {
      method: "PUT",
      headers: authHeaders(token, { "Content-Type": "application/json" }),
      body: JSON.stringify({ titleJapanese, titleEnglish, releaseDate, genreIds }),
    });
    navigate("/anime");
  };

  if (loading) return <Spinner />;

  const toggleGenre = (genreId: number) => {
    setGenreIds((prev) =>
      prev.includes(genreId) ? prev.filter((id) => id !== genreId) : [...prev, genreId]
    );
  };

  return (
    <div className="page-container">
      <h2>Edit Anime</h2>
      <form className="anime-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label><strong>Original Title:</strong></label>
          <input
            value={titleJapanese}
            onChange={(e) => setTitleJapanese(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label><strong>English Title:</strong></label>
          <input value={titleEnglish} onChange={(e) => setTitleEnglish(e.target.value)} />
        </div>
        <div className="form-group">
          <label><strong>Premiered:</strong></label>
          <input
            type="date"
            value={releaseDate}
            onChange={(e) => setReleaseDate(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label><strong>Genres:</strong></label>
          <div className="genre-checkboxes">
            {allGenres.map((g) => (
              <label key={g.id} className="genre-checkbox">
                <input
                  type="checkbox"
                  value={g.id}
                  checked={genreIds.includes(g.id)}
                  onChange={() => toggleGenre(g.id)}
                />
                {g.name}
              </label>
            ))}
          </div>
        </div>
        <div className="form-buttons">
          <button type="submit">Save</button>
          <button type="button" onClick={() => navigate("/anime")}>Return to List</button>
        </div>
      </form>
    </div>
  );
}

export default AnimeEditPage;
