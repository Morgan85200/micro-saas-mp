import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Spinner from "../components/Spinner";
import { useAuth } from "../auth/useAuth";
import { authHeaders } from "../auth/authHeaders";
import { apiUrl } from "../config/api";

interface Genre {
  id: number;
  name: string;
}

function GenreListPage() {
  const [genres, setGenres] = useState<Genre[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { token } = useAuth();

  const fetchGenres = async () => {
    setLoading(true);
    try {
      const res = await fetch(apiUrl("/api/genres"));
      const data = await res.json();
      setGenres(data);
    } catch (err) {
      console.error("Failed to fetch genres", err);
    } finally {
      setLoading(false);
    }
  };

  const deleteGenre = async (id: number, name: string) => {
    const confirmed = window.confirm(`Are you sure you want to delete genre "${name}"?`);
    if (!confirmed) return;

    setLoading(true);
    try {
      await fetch(apiUrl(`/api/genres/${id}`), {
        method: "DELETE",
        headers: authHeaders(token),
      });
      await fetchGenres();
    } catch (err) {
      console.error("Failed to delete genre", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGenres();
  }, []);

  if (loading) return <Spinner />;

  return (
    <div className="page-container">
      <h2>Liste des genres</h2>
      <Link to="/genres/create">
        <button>Ajouter un genre</button>
      </Link>
      <ul>
        {genres.map((g) => (
          <li key={g.id} className="genre-item">
            <p><strong>ID:</strong> {g.id}</p>
            <p><strong>Nom:</strong> {g.name}</p>
            <div className="anime-buttons">
              <button onClick={() => deleteGenre(g.id, g.name)}>Supprimer</button>
              <Link to={`/genres/edit/${g.id}`}>
                <button>Modifier</button>
              </Link>
            </div>
          </li>
        ))}
      </ul>
      <button onClick={() => navigate("/")}>Retour à l'accueil</button>
    </div>
  );
}

export default GenreListPage;

