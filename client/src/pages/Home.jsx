import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import Globe from "../components/Globe";
import FadeUp from "../components/FadeUp";

export default function Home() {
  const { session } = useAuth();
  const navigate = useNavigate();
  const [locations, setLocations] = useState([]);
  const [stats, setStats] = useState({ artists: 0, countries: 0 });

  // If already logged in, go to feed
  useEffect(() => {
    if (session) navigate("/feed", { replace: true });
  }, [session]);

  // Load artist/buyer locations for the globe
  useEffect(() => {
    supabase
      .from("users")
      .select("lat, lng, type, country")
      .not("lat", "is", null)
      .then(({ data }) => {
        if (data) {
          setLocations(data);
          const artistCount = data.filter(u => u.type === "artist").length;
          const countries = new Set(data.map(u => u.country).filter(Boolean)).size;
          setStats({ artists: artistCount, countries });
        }
      });
  }, []);

  return (
    <div className="min-h-screen bg-dark flex flex-col">

      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-5 z-10">
        <span className="font-heading text-2xl text-cream">Artspace</span>
        <div className="flex items-center gap-4">
          <Link to="/login" className="text-cream/60 hover:text-cream font-body text-sm transition-colors">
            Sign in
          </Link>
          <Link to="/signup" className="btn-primary text-sm">
            Get started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <main className="flex-1 grid md:grid-cols-2 items-center gap-8 px-6 md:px-16 py-12 max-w-7xl mx-auto w-full">

        {/* Left — headline + CTAs */}
        <div>
          <FadeUp>
            <h1 className="font-heading text-6xl md:text-7xl xl:text-8xl text-cream leading-[1.05] mb-5">
              Where young artists grow.
            </h1>
          </FadeUp>

          <FadeUp delay={150}>
            <p className="text-cream/60 font-body text-lg md:text-xl max-w-lg mb-8 leading-relaxed">
              A community for artists aged 13–18 to share work, get seen, and build a college-ready portfolio.
            </p>
          </FadeUp>

          <FadeUp delay={250}>
            <div className="flex flex-col sm:flex-row gap-4 mb-10">
              <Link
                to="/signup"
                className="btn-primary px-10 py-4 rounded-full font-body font-semibold text-lg text-center"
              >
                Get started →
              </Link>
            </div>
          </FadeUp>

          <FadeUp delay={350}>
            <p className="text-cream/30 font-body text-sm">
              Free to join · No ads · Built for creators
            </p>
          </FadeUp>
        </div>

        {/* Right — Globe (floats freely, no box) */}
        <FadeUp delay={200} className="hidden md:flex flex-col items-center justify-center">
          {/* Relative container defines the globe's size */}
          <div className="relative w-full max-w-[520px] aspect-square">
            <Globe locations={locations} />
          </div>

          {stats.artists > 0 && (
            <p className="text-cream/40 font-body text-sm mt-2">
              <span className="text-burnt font-semibold">{stats.artists}</span> artists across{" "}
              <span className="text-cream/70 font-semibold">{stats.countries}</span> countries
            </p>
          )}
        </FadeUp>
      </main>

      {/* Feature strip */}
      <section className="border-t border-stone-800 px-6 py-12">
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
          {[
            { icon: "🖼️", title: "Share your work", desc: "Post artwork to a masonry-style community feed" },
            { icon: "📄", title: "Auto-generated portfolio", desc: "Produce a shareable, printable portfolio page instantly" },
            { icon: "🌍", title: "Be discovered globally", desc: "Connect with collectors and art lovers around the world" },
          ].map((f, i) => (
            <FadeUp key={f.title} delay={i * 100}>
              <div className="flex flex-col items-center gap-3">
                <span className="text-4xl">{f.icon}</span>
                <h3 className="font-heading text-xl text-cream">{f.title}</h3>
                <p className="text-cream/50 font-body text-sm leading-relaxed">{f.desc}</p>
              </div>
            </FadeUp>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-6 border-t border-stone-800 text-center">
        <p className="text-cream/25 font-body text-xs">© {new Date().getFullYear()} Artspace · For young artists, by young artists</p>
      </footer>
    </div>
  );
}
