import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import { authHeaders } from "../auth/authHeaders";
import { apiUrl } from "../config/api";

function GenreCreatePage() {
  const [name, setName] = useState("");
  const navigate = useNavigate();
  const { token } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch(apiUrl("/api/genres"), {
      method: "POST",
      headers: authHeaders(token, { "Content-Type": "application/json" }),
      body: JSON.stringify({ name }),
    });
    navigate("/genres");
  };

  return (
    <div className="page-container">
      <h2>Ajouter un genre</h2>
      <form className="genre-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label><strong>Nom:</strong></label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="form-buttons">
          <button type="submit">Ajouter</button>
          <button type="button" onClick={() => navigate("/genres")}>Retour à la liste</button>
        </div>
      </form>
    </div>
  );
}

export default GenreCreatePage;

