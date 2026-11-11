import { useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext.jsx";

function LogoutButton() {
  const navigate = useNavigate();
  const { logout, isLoggingOut } = useAuth();
  const [error, setError] = useState("");

  const handleLogout = async () => {
    setError("");

    try {
      await logout();
      navigate("/login", { replace: true });
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div>
      <button type="button" onClick={handleLogout} disabled={isLoggingOut}>
        {isLoggingOut ? "Logging out..." : "Log out"}
      </button>

      {error && <p role="alert">{error}</p>}
    </div>
  );
}

export default LogoutButton;
