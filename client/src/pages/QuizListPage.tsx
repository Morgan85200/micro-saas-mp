import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Spinner from "../components/Spinner";
import { useAuth } from "../auth/useAuth";
import { authHeaders } from "../auth/authHeaders";
import { apiUrl } from "../config/api";

interface Quiz {
  id: number;
  quizDate: string;
  quizType: string;
  anime: {
    id: number;
    titleJapanese: string;
  };
  hintCount: number;
}

function QuizListPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { token } = useAuth();

  const fetchQuizzes = async (page: number) => {
    setLoading(true);
    try {
      const res = await fetch(
        apiUrl(`/api/quizzes?page=${page}&limit=10`)
      );
      const json = await res.json();
      setQuizzes(json.quizzes);
      setTotalPages(json.totalPages);
    } catch (err) {
      console.error("Failed to fetch quizzes", err);
    } finally {
      setLoading(false);
    }
  };

  const deleteQuiz = async (id: number) => {
    if (!window.confirm("Delete this quiz and all its hints?")) return;

    await fetch(apiUrl(`/api/quizzes/${id}`), {
      method: "DELETE",
      headers: authHeaders(token),
    });
    fetchQuizzes(page);
  };

  useEffect(() => {
    fetchQuizzes(page);
  }, [page]);

  if (loading) return <Spinner />;

  return (
    <div className="page-container">
      <h2>Liste des quizz</h2>

      <Link to="/quizzes/create">
        <button>Créer un quizz</button>
      </Link>

      <ul>
        {quizzes.map((q) => (
          <li key={q.id} className="anime-item">
            <p><strong>Date:</strong> {q.quizDate}</p>
            <p><strong>Type:</strong> {q.quizType}</p>
            <p><strong>Anime:</strong> {q.anime.titleJapanese}</p>
            <p><strong>Indices:</strong> {q.hintCount}</p>

            <div className="anime-buttons">
              <Link to={`/quizzes/edit/${q.id}`}>
                <button>Modifier</button>
              </Link>
              <button onClick={() => deleteQuiz(q.id)}>Supprimer</button>
            </div>
          </li>
        ))}
      </ul>

      <div className="pagination" style={{ marginTop: "20px" }}>
        <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
        >
          Précédent
        </button>

        <span style={{ margin: "0 10px" }}>
            Page {page} / {totalPages}
        </span>
        
        <button
          disabled={page === totalPages}
          onClick={() => setPage(page + 1)}
        >
          Suivant
        </button>
      </div>
    </div>
  );
}

export default QuizListPage;

