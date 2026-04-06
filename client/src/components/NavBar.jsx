import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function NavBar() {
  const { session, profile, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  // Don't show nav on landing, login, signup, onboarding, portfolio (public)
  const hidden = ["/", "/login", "/signup", "/onboarding"];
  if (hidden.includes(location.pathname)) return null;
  if (location.pathname.startsWith("/portfolio/")) return null;

  async function handleSignOut() {
    await signOut();
    navigate("/login");
  }

  const isArtist = profile?.type === "artist";

  return (
    <nav className="no-print sticky top-0 z-40 bg-dark/90 backdrop-blur-md border-b border-stone-800 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link to="/feed" className="font-heading text-2xl text-cream hover:text-burnt transition-colors">
          Artspace
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-6 nav-links">
          <Link to="/feed" className="text-cream/70 hover:text-cream font-body text-sm transition-colors">
            Feed
          </Link>
          {isArtist && (
            <>
              <Link to="/upload" className="text-cream/70 hover:text-cream font-body text-sm transition-colors">
                Upload
              </Link>
              <Link to={`/artist/${profile?.username}`} className="text-cream/70 hover:text-cream font-body text-sm transition-colors">
                My Profile
              </Link>
            </>
          )}
        </div>

        {/* Right side */}
        <div className="hidden md:flex items-center gap-4">
          {session ? (
            <>
              <span className="text-cream/50 font-body text-sm">{profile?.display_name || profile?.email}</span>
              <button onClick={handleSignOut} className="btn-fill border border-stone-700 text-cream/60 px-4 py-2 rounded-full font-body text-sm hover:text-cream transition-colors">
                Sign out
              </button>
            </>
          ) : (
            <Link to="/login" className="btn-primary text-sm">Sign in</Link>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden text-cream p-2"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            {menuOpen ? (
              <path d="M4 4L18 18M18 4L4 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            ) : (
              <path d="M3 6h16M3 11h16M3 16h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            )}
          </svg>
        </button>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="md:hidden absolute left-0 right-0 top-full bg-dark border-b border-stone-800 px-6 py-4 flex flex-col gap-4">
          <Link to="/feed" onClick={() => setMenuOpen(false)} className="text-cream font-body">Feed</Link>
          {isArtist && (
            <>
              <Link to="/upload" onClick={() => setMenuOpen(false)} className="text-cream font-body">Upload</Link>
              <Link to={`/artist/${profile?.username}`} onClick={() => setMenuOpen(false)} className="text-cream font-body">My Profile</Link>
            </>
          )}
          {session ? (
            <button onClick={() => { handleSignOut(); setMenuOpen(false); }} className="text-left text-cream/60 font-body">
              Sign out
            </button>
          ) : (
            <Link to="/login" onClick={() => setMenuOpen(false)} className="text-cream font-body">Sign in</Link>
          )}
        </div>
      )}
    </nav>
  );
}
