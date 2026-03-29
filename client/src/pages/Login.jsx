import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import PaintSplatter from "../components/PaintSplatter";

export default function Login() {
  const { signIn, profile } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { user } = await signIn(email, password);
      // Brief pause to allow profile to load
      setTimeout(() => navigate("/feed"), 500);
    } catch (err) {
      setError(err.message || "Incorrect email or password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-dark flex flex-col items-center justify-center px-6">
      <Link to="/" className="absolute top-6 left-6 text-cream/40 hover:text-cream font-body text-sm transition-colors">
        ← Back
      </Link>

      <div className="w-full max-w-sm">
        <h1 className="font-heading text-5xl text-cream text-center mb-2">Welcome back</h1>
        <p className="text-cream/50 font-body text-center mb-10">Sign in to Artspace</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-cream/60 font-body text-xs uppercase tracking-widest mb-1.5 block">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="input-field"
              placeholder="your@email.com"
              required
            />
          </div>

          <div>
            <label className="text-cream/60 font-body text-xs uppercase tracking-widest mb-1.5 block">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="input-field"
              placeholder="Your password"
              required
            />
          </div>

          {error && <p className="text-red-400 font-body text-sm">{error}</p>}

          <button type="submit" disabled={loading} className="btn-primary mt-2 w-full py-4 text-base disabled:opacity-40">
            {loading ? "Signing in…" : "Sign in →"}
          </button>
        </form>

        <p className="text-center text-cream/40 font-body text-sm mt-6">
          New here?{" "}
          <Link to="/signup" className="text-burnt hover:underline">Create an account</Link>
        </p>
      </div>

      {loading && (
        <div className="fixed inset-0 bg-dark/80 flex items-center justify-center z-50">
          <PaintSplatter />
        </div>
      )}
    </div>
  );
}
