import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import PaintSplatter from "../components/PaintSplatter";

export default function Signup() {
  const { signUp, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  const [userType, setUserType] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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

  async function handleGoogle() {
    if (!userType) { setError("Please choose Artist or Visitor first, then continue with Google."); return; }
    setError("");
    try {
      await signInWithGoogle(userType);
    } catch (err) {
      setError(err.message || "Google sign-in failed.");
    }
  }

  return (
    <div className="min-h-screen bg-dark flex flex-col items-center justify-center px-6 py-16">
      <Link to="/" className="absolute top-6 left-6 text-cream/40 hover:text-cream font-body text-sm transition-colors">
        ← Back
      </Link>

      <div className="w-full max-w-lg">
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

        {/* Google button */}
        <button
          type="button"
          onClick={handleGoogle}
          className="w-full flex items-center justify-center gap-3 bg-stone-800 hover:bg-stone-700 border border-stone-700 text-cream font-body font-medium py-3.5 rounded-xl transition-colors mb-4"
        >
          <svg width="20" height="20" viewBox="0 0 48 48">
            <path fill="#FFC107" d="M43.6 20H24v8h11.3C33.7 33.1 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11 0 19.7-8 19.7-20 0-1.3-.1-2.7-.1-4z"/>
            <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16.1 19 13 24 13c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
            <path fill="#4CAF50" d="M24 44c5.2 0 9.9-1.9 13.5-5l-6.2-5.2C29.4 35.5 26.8 36 24 36c-5.2 0-9.7-3-11.3-7.2l-6.5 5C9.5 39.6 16.2 44 24 44z"/>
            <path fill="#1976D2" d="M43.6 20H24v8h11.3c-.9 2.4-2.5 4.4-4.6 5.8l6.2 5.2C40.9 35.3 44 30.1 44 24c0-1.3-.1-2.7-.4-4z"/>
          </svg>
          Continue with Google
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-px bg-stone-800" />
          <span className="text-cream/30 font-body text-xs">or sign up with email</span>
          <div className="flex-1 h-px bg-stone-800" />
        </div>

        {/* Email/password form */}
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
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="input-field pr-12"
                placeholder="At least 8 characters"
                minLength={8}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-cream/40 hover:text-cream transition-colors"
                tabIndex={-1}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )}
              </button>
            </div>
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
