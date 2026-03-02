import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    const ok = await login(email, password);
    if (!ok) {
      setError("Invalid credentials.");
      return;
    }
    navigate("/");
  };

  return (
    <div className="page-container auth-page">
      <h2>Connexion</h2>
      <form className="auth-form" onSubmit={handleSubmit}>
        <label>
          E-mail
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </label>
        <label>
          Mot de passe
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </label>
        {error && <p className="form-error">{error}</p>}
        <button type="submit">Connexion</button>
      </form>
      <Link to="/">
        <button type="button" className="ghost-button">
          Retour à l'accueil
        </button>
      </Link>
    </div>
  );
}

