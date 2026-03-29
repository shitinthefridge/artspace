import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import PaintSplatter from "../components/PaintSplatter";

export default function Signup() {
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const [userType, setUserType] = useState(null); // 'artist' | 'buyer'
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    if (!userType) { setError("Please choose your account type above."); return; }
    setLoading(true);
    setError("");
    try {
      await signUp(email, password, userType);
      if (userType === "artist") navigate("/onboarding");
      else navigate("/feed");
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-dark flex flex-col items-center justify-center px-6 py-16">
      {/* Back to home */}
      <Link to="/" className="absolute top-6 left-6 text-cream/40 hover:text-cream font-body text-sm transition-colors">
        ← Back
      </Link>

      <div className="w-full max-w-lg">
        {/* Heading */}
        <h1 className="font-heading text-5xl text-cream text-center mb-2">Join Artspace</h1>
        <p className="text-cream/50 font-body text-center mb-10">A community for young artists aged 13–18</p>

        {/* Type selection */}
        <p className="text-cream/60 font-body text-sm text-center mb-5">First, tell us who you are:</p>
        <div className="grid grid-cols-2 gap-4 mb-8">
          <button
            type="button"
            onClick={() => setUserType("artist")}
            className={`type-card ${userType === "artist" ? "selected" : ""}`}
          >
            <span className="text-5xl">🎨</span>
            <span className="font-heading text-xl text-cream">I'm an Artist</span>
            <span className="text-cream/50 font-body text-xs">Post artwork, build your portfolio, get discovered</span>
          </button>

          <button
            type="button"
            onClick={() => setUserType("buyer")}
            className={`type-card ${userType === "buyer" ? "selected" : ""}`}
          >
            <span className="text-5xl">👁️</span>
            <span className="font-heading text-xl text-cream">I'm a Visitor</span>
            <span className="text-cream/50 font-body text-xs">Browse artwork, support young creators</span>
          </button>
        </div>

        {/* Form */}
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
              placeholder="At least 8 characters"
              minLength={8}
              required
            />
          </div>

          {error && <p className="text-red-400 font-body text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading || !userType}
            className="btn-primary mt-2 w-full py-4 text-base disabled:opacity-40"
          >
            {loading ? "Creating account…" : "Create my account →"}
          </button>
        </form>

        <p className="text-center text-cream/40 font-body text-sm mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-burnt hover:underline">Sign in</Link>
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
