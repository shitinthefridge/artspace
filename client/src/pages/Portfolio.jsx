import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { TEACHER_NAME, STUDIO_NAME } from "../lib/constants";
import PaintSplatter from "../components/PaintSplatter";

const THEMES = {
  classic:   { label: "Classic",   desc: "Clean & minimal", icon: "⬜" },
  editorial: { label: "Editorial", desc: "Bold & dramatic", icon: "⬛" },
  warm:      { label: "Warm",      desc: "Earthy & soft",   icon: "🟧" },
};

export default function Portfolio() {
  const { username } = useParams();
  const [artist, setArtist] = useState(null);
  const [artworks, setArtworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState("classic");

  useEffect(() => {
    load();
  }, [username]);

  async function load() {
    setLoading(true);
    const { data: artistData } = await supabase
      .from("users")
      .select("*")
      .eq("username", username)
      .single();

    if (artistData) {
      setArtist(artistData);
      const { data: artworkData } = await supabase
        .from("artworks")
        .select("*")
        .eq("user_id", artistData.id)
        .eq("in_portfolio", true)
        .order("created_at", { ascending: false });
      setArtworks(artworkData || []);
    }
    setLoading(false);
  }

  function handlePrint() {
    window.print();
  }

  function copyLink() {
    navigator.clipboard.writeText(window.location.href);
    alert("Portfolio link copied!");
  }

  if (loading) return <PaintSplatter fullscreen />;
  if (!artist) return (
    <div className="min-h-screen bg-dark flex items-center justify-center">
      <p className="text-cream/50 font-body">Portfolio not found.</p>
    </div>
  );

  const tagline = artist.about_me
    ? artist.about_me.slice(0, 120) + (artist.about_me.length > 120 ? "…" : "")
    : "Artist";

  const currentYear = new Date().getFullYear();

  return (
    <div className={`theme-${theme} min-h-screen`}>

      {/* Theme picker + actions — hidden on print */}
      <div className="no-print fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-3"
        style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}>
        {/* Theme switcher */}
        <div className="flex items-center gap-2">
          <span className="text-white/50 text-xs font-body mr-2">Theme:</span>
          {Object.entries(THEMES).map(([key, t]) => (
            <button
              key={key}
              onClick={() => setTheme(key)}
              className={`text-xs font-body px-3 py-1.5 rounded-full border transition-all ${
                theme === key
                  ? "border-white bg-white text-black font-semibold"
                  : "border-white/30 text-white/70 hover:border-white/70"
              }`}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button onClick={copyLink} className="text-xs font-body text-white/70 hover:text-white transition-colors px-3 py-1.5 border border-white/20 rounded-full">
            🔗 Copy link
          </button>
          <button onClick={handlePrint} className="text-xs font-body bg-white text-black font-semibold px-4 py-1.5 rounded-full hover:bg-white/90 transition-colors">
            ⬇ Download PDF
          </button>
        </div>
      </div>

      {/* ── PORTFOLIO CONTENT ── */}
      <div className="pt-16">

        {/* Cover section */}
        <header className="portfolio-cover px-8 py-20 md:py-28 text-center max-w-4xl mx-auto">
          {artist.avatar_url && (
            <img
              src={artist.avatar_url}
              alt={artist.display_name}
              className="w-28 h-28 rounded-full object-cover mx-auto mb-6 border-4"
              style={{ borderColor: "currentColor", opacity: 0.8 }}
            />
          )}
          <h1 className="font-heading text-6xl md:text-7xl mb-4" style={{ fontFamily: "'DM Serif Display', serif" }}>
            {artist.display_name || artist.email}
          </h1>
          <p className="text-lg md:text-xl opacity-70 max-w-xl mx-auto font-body leading-relaxed">
            {tagline}
          </p>
          {artist.mediums?.length > 0 && (
            <p className="mt-4 text-sm opacity-50 font-body">
              {artist.mediums.join(" · ")}
            </p>
          )}
        </header>

        {/* About the Artist */}
        {artist.about_me && (
          <section className="px-8 py-12 border-t border-current/10 max-w-3xl mx-auto">
            <h2 className="font-heading text-3xl mb-5" style={{ fontFamily: "'DM Serif Display', serif" }}>
              About the Artist
            </h2>
            <p className="font-body leading-relaxed opacity-80 text-lg">{artist.about_me}</p>

            {artist.training_start_year && (
              <p className="mt-4 opacity-50 font-body text-sm">
                Trained since {artist.training_start_year} · {artist.categories?.join(", ")}
              </p>
            )}
          </section>
        )}

        {/* Gallery */}
        {artworks.length > 0 && (
          <section className="px-8 py-12 border-t border-current/10">
            <div className="max-w-6xl mx-auto">
              <h2 className="font-heading text-3xl mb-8" style={{ fontFamily: "'DM Serif Display', serif" }}>
                Selected Works
              </h2>
              <div className="portfolio-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {artworks.map(artwork => (
                  <div key={artwork.id} className="portfolio-artwork">
                    <img
                      src={artwork.image_url}
                      alt={artwork.title}
                      className="w-full rounded-lg object-cover mb-3"
                      style={{ maxHeight: "320px", background: "rgba(0,0,0,0.05)" }}
                    />
                    <h3 className="font-heading text-xl" style={{ fontFamily: "'DM Serif Display', serif" }}>
                      {artwork.title}
                    </h3>
                    <p className="font-body text-sm opacity-60 mt-0.5">
                      {artwork.medium} · {artwork.year}
                    </p>
                    {artwork.description && (
                      <p className="font-body text-sm opacity-50 mt-1.5 leading-relaxed">
                        {artwork.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {artworks.length === 0 && (
          <section className="px-8 py-20 text-center opacity-40">
            <p className="font-body">No portfolio artworks selected yet.</p>
          </section>
        )}

        {/* Footer */}
        <footer className="px-8 py-12 border-t border-current/10 text-center">
          <p className="font-body text-sm opacity-50">
            Trained under {TEACHER_NAME} &nbsp;|&nbsp; {STUDIO_NAME} &nbsp;|&nbsp; {currentYear}
          </p>
          <p className="font-body text-xs opacity-30 mt-2">
            {window.location.href}
          </p>
        </footer>
      </div>
    </div>
  );
}
