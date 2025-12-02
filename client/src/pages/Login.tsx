import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

type LoginForm = {
  username: string;
  password: string;
};

const initialState: LoginForm = {
  username: "",
  password: "",
};

function Login() {
  const [form, setForm] = useState<LoginForm>(initialState);
  const [message, setMessage] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (field: keyof LoginForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", form);
      login(data.user);
      setMessage("Login successful! Redirecting...");
      setTimeout(() => navigate("/dashboard"), 400);
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      setMessage(err.response?.data?.message || "Invalid username or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-body">
      <div className="login-container">
        <h1>ZAPSAFE - GRIDWATCH</h1>
        <h2>Utility Pole Monitoring System</h2>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="username">Username:</label>
            <input
              id="username"
              type="text"
              value={form.username}
              onChange={(e) => handleChange("username", e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor="password">Password:</label>
            <input
              id="password"
              type="password"
              value={form.password}
              onChange={(e) => handleChange("password", e.target.value)}
              required
            />
          </div>
          <button type="submit" id="loginButton" disabled={loading}>
            {loading ? "Signing in..." : "Login"}
          </button>
          {message && (
            <p
              id="loginMessage"
              style={{ color: message.includes("successful") ? "green" : "red" }}
            >
              {message}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}

export default Login;

