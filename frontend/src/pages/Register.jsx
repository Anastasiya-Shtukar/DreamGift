import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext.jsx";

function Register() {
  const navigate = useNavigate();
  const { register, isRegistering } = useAuth();

  const [formData, setFormData] = useState({
    displayName: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    try {
      await register(formData);

      navigate("/login", { replace: true });
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <section>
      <h1>Create an account</h1>

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="displayName">Display name</label>
          <input
            id="displayName"
            name="displayName"
            type="text"
            value={formData.displayName}
            onChange={handleChange}
            minLength={2}
            maxLength={50}
            autoComplete="nickname"
            required
          />
        </div>

        <div>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            autoComplete="email"
            required
          />
        </div>

        <div>
          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            minLength={8}
            maxLength={128}
            autoComplete="new-password"
            required
          />
        </div>

        {error && <p role="alert">{error}</p>}

        <button type="submit" disabled={isRegistering}>
          {isRegistering ? "Creating account..." : "Register"}
        </button>
      </form>

      <p>
        Already have an account? <Link to="/login">Log in</Link>
      </p>
    </section>
  );
}

export default Register;
