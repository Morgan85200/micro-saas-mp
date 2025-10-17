import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Spinner from "../components/Spinner";

interface Genre {
  id: number;
  name: string;
}

function GenreListPage() {
  const [genres, setGenres] = useState<Genre[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchGenres = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8080/api/genres");
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
      await fetch(`http://localhost:8080/api/genres/${id}`, { method: "DELETE" });
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
      <h2>Genre List</h2>
      <Link to="/genres/create">
        <button>Create Genre</button>
      </Link>
      <ul>
        {genres.map((g) => (
          <li key={g.id} className="genre-item">
            <p><strong>ID:</strong> {g.id}</p>
            <p><strong>Name:</strong> {g.name}</p>
            <div className="anime-buttons">
              <button onClick={() => deleteGenre(g.id, g.name)}>Delete</button>
              <Link to={`/genres/edit/${g.id}`}>
                <button>Edit</button>
              </Link>
            </div>
          </li>
        ))}
      </ul>
      <button onClick={() => navigate("/")}>Return to Home</button>
    </div>
  );
}

export default GenreListPage;
