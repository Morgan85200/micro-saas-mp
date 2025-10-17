import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Spinner from "../components/Spinner";

interface Genre {
  id: number;
  name: string;
}

function GenreEditPage() {
  const { id } = useParams<{ id: string }>();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`http://localhost:8080/api/genres/${id}`)
      .then((res) => res.json())
      .then((data: Genre) => {
        setName(data.name);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch genre:", err);
        setLoading(false);
      });
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch(`http://localhost:8080/api/genres/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    navigate("/genres");
  };

  if (loading) return <Spinner />;

  return (
    <div className="page-container">
      <h2>Edit Genre</h2>
      <form className="genre-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label><strong>Name:</strong></label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="form-buttons">
          <button type="submit">Save</button>
          <button type="button" onClick={() => navigate("/genres")}>Return to List</button>
        </div>
      </form>
    </div>
  );
}

export default GenreEditPage;
