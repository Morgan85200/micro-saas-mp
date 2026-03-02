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

interface Anime {
  id: number;
  titleJapanese: string;
  titleEnglish?: string;
  releaseDate: string;
  genres?: Genre[];
}

function AnimeListPage() {
  const [animes, setAnimes] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [jumpPage, setJumpPage] = useState(1); // For the jump input
  const itemsPerPage = 20;
  const { token } = useAuth();

  const navigate = useNavigate();

  const fetchAnimes = async (page: number) => {
    setLoading(true);
    try {
      const res = await fetch(
        apiUrl(`/api/animes?page=${page}&limit=${itemsPerPage}`)
      );
      const json = await res.json();
      setAnimes(json.animes);
      setTotalPages(json.totalPages);
    } catch (err) {
      console.error("Failed to fetch animes", err);
    } finally {
      setLoading(false);
    }
  };

  const deleteAnime = async (id: number, title: string) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete the anime "${title}"?`
    );
    if (!confirmed) return;

    setLoading(true);
    try {
      await fetch(apiUrl(`/api/animes/${id}`), {
        method: "DELETE",
        headers: authHeaders(token),
      });
      fetchAnimes(currentPage);
    } catch (err) {
      console.error("Failed to delete anime", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch anime when component mounts or currentPage changes
  useEffect(() => {
    fetchAnimes(currentPage);
  }, [currentPage]);

  if (loading) return <Spinner />;

  const handleJump = () => {
    const page = Math.min(Math.max(1, jumpPage), totalPages);
    setCurrentPage(page);
  };

  return (
    <div className="page-container">
      <h2>Liste des anime</h2>
      <Link to="/anime/create">
        <button>Ajouter un anime</button>
      </Link>

      <ul>
        {animes.map((a) => (
          <li key={a.id} className="anime-item">
            <p><strong>Titre original:</strong> {a.titleJapanese}</p>
            <p><strong>Titre anglais:</strong> {a.titleEnglish || "—"}</p>
            <p>
              <strong>Genres:</strong>{" "}
              {a.genres && a.genres.length > 0
                ? a.genres.map((g) => g.name).join(", ")
                : "—"}
            </p>
            <p><strong>A débuté le:</strong> {a.releaseDate}</p>
            <div className="anime-buttons">
              <button onClick={() => deleteAnime(a.id, a.titleJapanese)}>Supprimer</button>
              <Link to={`/anime/edit/${a.id}`}>
                <button>Modifier</button>
              </Link>
            </div>
          </li>
        ))}
      </ul>

      {/* Pagination */}
      <div className="pagination" style={{ marginTop: "20px" }}>
        <button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(currentPage - 1)}
        >
          Précédent
        </button>

        <span style={{ margin: "0 10px" }}>
          Page {currentPage} of {totalPages}
        </span>

        <button
          disabled={currentPage === totalPages || totalPages === 0}
          onClick={() => setCurrentPage(currentPage + 1)}
        >
          Suivant
        </button>
      </div>

      {/* Jump to page */}
      <div style={{ marginTop: "10px" }}>
        <label>
          Sauter à la page:{" "}
          <input
            type="number"
            min={1}
            max={totalPages}
            value={jumpPage}
            onChange={(e) => setJumpPage(Number(e.target.value))}
            style={{ width: "60px" }}
          />
        </label>
        <button onClick={handleJump} style={{ marginLeft: "5px" }}>
          Go
        </button>
      </div>

      <button style={{ marginTop: "20px" }} onClick={() => navigate("/")}>
        Retour à l'accueil
      </button>
    </div>
  );
}

export default AnimeListPage;

