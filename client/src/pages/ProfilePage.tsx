import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import { authHeaders } from "../auth/authHeaders";
import { API_BASE, apiUrl } from "../config/api";

export default function ProfilePage() {
  const { user, token, refreshUser } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!user) {
    return (
      <div className="page-container">
        <h2>Profile</h2>
        <p>Please log in to view your profile.</p>
      </div>
    );
  }

  const avatarUrl = user.avatarPath
    ? `${API_BASE}/uploads/avatar/${user.avatarPath}`
    : null;

  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append("avatar", file);

    try {
      const res = await fetch(apiUrl("/api/me/avatar"), {
        method: "POST",
        headers: authHeaders(token),
        body: formData,
      });
      if (!res.ok) {
        setError("Failed to upload avatar.");
      } else {
        await refreshUser();
      }
    } catch (err) {
      console.error("Avatar upload failed", err);
      setError("Failed to upload avatar.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="page-container profile-page">
      <div className="profile-header">
        <div className="profile-avatar">
          {avatarUrl ? (
            <img src={avatarUrl} alt="Profile avatar" />
          ) : (
            <span className="avatar-placeholder">{user.username[0]}</span>
          )}
        </div>
        <div>
          <h2>{user.username}</h2>
          <p>{user.email}</p>
          <label className="upload-button">
            {uploading ? "En cours d'upload..." : "Changer d'avatar"}
            <input
              type="file"
              accept="image/*"
              onChange={uploadAvatar}
              disabled={uploading}
            />
          </label>
          {error && <p className="form-error">{error}</p>}
        </div>
      </div>

      <section className="history-section">
        <h3>Statistiques</h3>
        {user.attempts.length === 0 ? (
          <p>Aucune statistique pour le moment</p>
        ) : (
          <div className="attempt-grid">
            {user.attempts.map((attempt) => (
              <div key={attempt.id} className={`attempt-card ${attempt.status}`}>
                <div className="attempt-header">
                  <span className="attempt-date">{attempt.quiz.quizDate}</span>
                  <span className={`attempt-status ${attempt.status}`}>
                    {attempt.status === "won" ? "Victoire" : "Perdu"}
                  </span>
                </div>
                <p className="attempt-title">
                  {attempt.answer.titleJapanese}
                  {/* {attempt.answer.titleEnglish ? ` (${attempt.answer.titleEnglish})` : ""} */}
                </p>
                <p className="attempt-meta">
                  Type: {attempt.quiz.quizType} · Nombre d'indices utilisés: {attempt.hintsUsed}
                </p>
                {/* {attempt.guessValue && (
                  <p className="attempt-guess">Dernière tentative: {attempt.guessValue}</p>
                )} */}
              </div>
            ))}
          </div>
        )}
      </section>
      <Link to="/">
        <button type="button" className="ghost-button">
          Retour à l'accueil
        </button>
      </Link>
    </div>
  );
}

