import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Spinner from "../components/Spinner";

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

  const fetchQuizzes = async (page: number) => {
    setLoading(true);
    try {
      const res = await fetch(
        `http://localhost:8080/api/quizzes?page=${page}&limit=10`
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

    await fetch(`http://localhost:8080/api/quizzes/${id}`, {
      method: "DELETE",
    });
    fetchQuizzes(page);
  };

  useEffect(() => {
    fetchQuizzes(page);
  }, [page]);

  if (loading) return <Spinner />;

  return (
    <div className="page-container">
      <h2>Quiz Admin</h2>

      <Link to="/quizzes/create">
        <button>Create Quiz</button>
      </Link>

      <ul>
        {quizzes.map((q) => (
          <li key={q.id} className="anime-item">
            <p><strong>Date:</strong> {q.quizDate}</p>
            <p><strong>Type:</strong> {q.quizType}</p>
            <p><strong>Anime:</strong> {q.anime.titleJapanese}</p>
            <p><strong>Hints:</strong> {q.hintCount}</p>

            <div className="anime-buttons">
              <Link to={`/quizzes/edit/${q.id}`}>
                <button>Edit</button>
              </Link>
              <button onClick={() => deleteQuiz(q.id)}>Delete</button>
            </div>
          </li>
        ))}
      </ul>

      <div className="pagination" style={{ marginTop: "20px" }}>
        <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
        >
          Previous
        </button>

        <span style={{ margin: "0 10px" }}>
            Page {page} / {totalPages}
        </span>
        
        <button
          disabled={page === totalPages}
          onClick={() => setPage(page + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default QuizListPage;
