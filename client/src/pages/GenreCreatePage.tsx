import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { authHeaders } from "../auth/authHeaders";

function GenreCreatePage() {
  const [name, setName] = useState("");
  const navigate = useNavigate();
  const { token } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("http://localhost:8080/api/genres", {
      method: "POST",
      headers: authHeaders(token, { "Content-Type": "application/json" }),
      body: JSON.stringify({ name }),
    });
    navigate("/genres");
  };

  return (
    <div className="page-container">
      <h2>Create Genre</h2>
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

export default GenreCreatePage;
