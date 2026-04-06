import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { MEDIUMS, CATEGORIES } from "../lib/constants";
import NavBar from "../components/NavBar";
import ArtworkCard from "../components/ArtworkCard";
import ArtworkModal from "../components/ArtworkModal";
import PaintSplatter from "../components/PaintSplatter";
import FadeUp from "../components/FadeUp";
import SpotlightStrip from "../components/SpotlightStrip";
import AboutSection from "../components/AboutSection";
import ArtistsToFollow from "../components/ArtistsToFollow";
import RecentActivity from "../components/RecentActivity";

export default function Feed() {
  const { session, profile } = useAuth();
  const [artworks, setArtworks] = useState([]);
  const [spotlightArtworks, setSpotlightArtworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [filterMedium, setFilterMedium] = useState("");
  const [filterCategory, setFilterCategory] = useState("");

  const isArtist = profile?.type === "artist";
  const isApproved = profile?.approved;

  useEffect(() => {
    fetchSpotlight();
  }, []);

  useEffect(() => {
    fetchArtworks();
  }, [filterMedium, filterCategory]);

  async function fetchSpotlight() {
    const { data } = await supabase
      .from("artworks")
      .select(`
        *,
        users!inner(id, display_name, avatar_url, username, approved),
        likes(id, user_id),
        comments(id)
      `)
      .eq("users.approved", true)
      .order("created_at", { ascending: false })
      .limit(6);

    if (data) {
      setSpotlightArtworks(data.map(a => ({
        ...a,
        like_count: a.likes?.length || 0,
        comment_count: a.comments?.length || 0,
        userLiked: a.likes?.some(l => l.user_id === session?.user?.id) || false,
      })));
    }
  }

  async function fetchArtworks() {
    setLoading(true);
    let query = supabase
      .from("artworks")
      .select(`
        *,
        users!inner(id, display_name, avatar_url, username, approved),
        likes(id, user_id),
        comments(id)
      `)
      .eq("users.approved", true)
      .order("created_at", { ascending: false });

    if (filterMedium) query = query.eq("medium", filterMedium);
    if (filterCategory) query = query.eq("category", filterCategory);

    const { data, error } = await query;
    if (!error && data) {
      const enriched = data.map(a => ({
        ...a,
        like_count: a.likes?.length || 0,
        comment_count: a.comments?.length || 0,
        userLiked: a.likes?.some(l => l.user_id === session?.user?.id) || false,
      }));
      setArtworks(enriched);
    }
    setLoading(false);
  }

  return (
    <>
      <NavBar />
      <div className="min-h-screen bg-dark">

        {/* Artist pending approval banner */}
        {isArtist && !isApproved && (
          <div className="bg-stone-900 border-b border-stone-800 px-6 py-3 text-center">
            <p className="text-cream/60 font-body text-sm">
              🎨 Your artist account is pending approval. You'll be able to post artwork once approved.
            </p>
          </div>
        )}

        {/* Spotlight strip — edge-to-edge */}
        {spotlightArtworks.length > 0 && (
          <FadeUp>
            <div className="border-b border-stone-800/50">
              <p className="text-cream/30 font-body text-xs uppercase tracking-widest px-6 pt-6 pb-2">
                Latest Works
              </p>
              <SpotlightStrip artworks={spotlightArtworks} onSelect={setSelected} />
            </div>
          </FadeUp>
        )}

        <div className="max-w-7xl mx-auto px-4 py-8">

          {/* Header row */}
          <FadeUp>
            <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
              <h1 className="font-heading text-3xl text-cream">Community Feed</h1>
              {isArtist && isApproved && (
                <Link to="/upload" className="btn-primary text-sm">
                  + Upload artwork
                </Link>
              )}
            </div>
          </FadeUp>

          {/* Filter bar */}
          <FadeUp delay={100}>
            <div className="flex flex-wrap gap-2 mb-8">
              <button
                onClick={() => { setFilterMedium(""); setFilterCategory(""); }}
                className={`chip text-xs ${!filterMedium && !filterCategory ? "selected" : ""}`}
              >
                All
              </button>

              <span className="text-cream/20 font-body text-xs self-center">Medium:</span>
              {MEDIUMS.map(m => (
                <button
                  key={m}
                  onClick={() => setFilterMedium(filterMedium === m ? "" : m)}
                  className={`chip text-xs ${filterMedium === m ? "selected" : ""}`}
                >
                  {m}
                </button>
              ))}

              <span className="text-cream/20 font-body text-xs self-center ml-2">Category:</span>
              {CATEGORIES.map(c => (
                <button
                  key={c}
                  onClick={() => setFilterCategory(filterCategory === c ? "" : c)}
                  className={`chip text-xs ${filterCategory === c ? "selected" : ""}`}
                >
                  {c}
                </button>
              ))}
            </div>
          </FadeUp>

          {/* Grid */}
          {loading ? (
            <PaintSplatter />
          ) : artworks.length === 0 ? (
            <div className="text-center py-24">
              <p className="text-cream/30 font-body text-lg">No artworks here yet.</p>
              {isArtist && isApproved && (
                <Link to="/upload" className="btn-primary mt-4 inline-block">Be the first to post →</Link>
              )}
            </div>
          ) : (
            <div className="masonry-grid">
              {artworks.map((artwork, i) => (
                <FadeUp key={artwork.id} delay={i * 60}>
                  <ArtworkCard
                    artwork={artwork}
                    onClick={() => setSelected(artwork)}
                  />
                </FadeUp>
              ))}
            </div>
          )}

          {/* About section */}
          <FadeUp>
            <AboutSection />
          </FadeUp>

          {/* Artists to follow */}
          <FadeUp delay={100}>
            <div className="mt-4 mb-16">
              <h2 className="font-heading text-2xl text-cream mb-8">Artists to Follow</h2>
              <ArtistsToFollow currentUserId={session?.user?.id ?? null} />
            </div>
          </FadeUp>

          {/* Recent uploads */}
          <FadeUp delay={150}>
            <div className="mb-16">
              <h2 className="font-heading text-2xl text-cream mb-8">Recent Uploads</h2>
              <RecentActivity />
            </div>
          </FadeUp>

        </div>

        {/* Modal */}
        {selected && (
          <ArtworkModal
            artwork={selected}
            onClose={() => { setSelected(null); fetchArtworks(); }}
          />
        )}
      </div>
    </>
  );
}
