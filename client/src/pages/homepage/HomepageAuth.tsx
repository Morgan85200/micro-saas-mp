import { Link } from "react-router-dom";
import type { UserProfile } from "../../auth/authContextStore";

type HomepageAuthProps = {
  isAdmin: boolean | undefined;
  user: UserProfile | null;
  avatarUrl: string | null;
  onLogout: () => void;
};

export default function HomepageAuth({
  isAdmin,
  user,
  avatarUrl,
  onLogout,
}: HomepageAuthProps) {
  if (isAdmin) return null;

  return (
    <div className="homepage-auth">
      {user ? (
        <>
          <Link to="/profile" className="profile-link">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Profile" className="avatar" />
            ) : (
              <span className="avatar-placeholder">{user.username[0]}</span>
            )}
            <span>{user.username}</span>
          </Link>
          <button onClick={onLogout} className="ghost-button">
            Se deconnecter
          </button>
        </>
      ) : (
        <>
          <Link to="/login">Connexion</Link>
          <Link to="/register">Creer un compte</Link>
        </>
      )}
    </div>
  );
}
