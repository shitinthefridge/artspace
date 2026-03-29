import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import NavBar from "../components/NavBar";
import ArtworkCard from "../components/ArtworkCard";
import ArtworkModal from "../components/ArtworkModal";
import PaintSplatter from "../components/PaintSplatter";
import FadeUp from "../components/FadeUp";

export default function ArtistProfile() {
  const { username } = useParams();
  const { session, profile: myProfile } = useAuth();
  const [artist, setArtist] = useState(null);
  const [artworks, setArtworks] = useState([]);
  const [totalLikes, setTotalLikes] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  const isOwnProfile = myProfile?.username === username;

  useEffect(() => {
    loadProfile();
  }, [username]);

  async function loadProfile() {
    setLoading(true);

    // Load artist
    const { data: artistData } = await supabase
      .from("users")
      .select("*")
      .eq("username", username)
      .single();

    if (!artistData) { setLoading(false); return; }
    setArtist(artistData);

    // Load their artworks
    const { data: artworkData } = await supabase
      .from("artworks")
      .select("*, users(id, display_name, avatar_url, username), likes(id, user_id), comments(id)")
      .eq("user_id", artistData.id)
      .order("created_at", { ascending: false });

    if (artworkData) {
      const enriched = artworkData.map(a => ({
        ...a,
        like_count: a.likes?.length || 0,
        comment_count: a.comments?.length || 0,
        userLiked: a.likes?.some(l => l.user_id === session?.user?.id) || false,
      }));
      setArtworks(enriched);
      setTotalLikes(enriched.reduce((sum, a) => sum + a.like_count, 0));
    }

    setLoading(false);
  }

  if (loading) return <><NavBar /><PaintSplatter /></>;
  if (!artist) return <><NavBar /><div className="min-h-screen flex items-center justify-center"><p className="text-cream/50 font-body">Artist not found.</p></div></>;

  return (
    <>
      <NavBar />
      <div className="min-h-screen bg-dark">

        {/* Hero header */}
        <div className="bg-stone-900 border-b border-stone-800">
          <div className="max-w-5xl mx-auto px-6 py-12">
            <FadeUp>
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                {/* Avatar */}
                {artist.avatar_url ? (
                  <img
                    src={artist.avatar_url}
                    alt={artist.display_name}
                    className="w-24 h-24 rounded-full object-cover border-2 border-burnt/30 shrink-0"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-burnt/20 flex items-center justify-center shrink-0">
                    <span className="font-heading text-4xl text-burnt">
                      {(artist.display_name || "A")[0].toUpperCase()}
                    </span>
                  </div>
                )}

                {/* Info */}
                <div className="text-center sm:text-left">
                  <h1 className="font-heading text-4xl md:text-5xl text-cream mb-2">
                    {artist.display_name || artist.email}
                  </h1>
                  {artist.about_me && (
                    <p className="text-cream/60 font-body leading-relaxed max-w-xl mb-4">
                      {artist.about_me}
                    </p>
                  )}

                  {/* Medium chips */}
                  {artist.mediums?.length > 0 && (
                    <div className="flex flex-wrap gap-2 justify-center sm:justify-start mb-2">
                      {artist.mediums.map(m => (
                        <span key={m} className="chip text-xs">{m}</span>
                      ))}
                    </div>
                  )}

                  {/* Category chips */}
                  {artist.categories?.length > 0 && (
                    <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                      {artist.categories.map(c => (
                        <span key={c} className="chip text-xs" style={{ borderColor: "#a855f7", color: "#a855f7" }}>{c}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </FadeUp>

            {/* Stats strip */}
            <FadeUp delay={150}>
              <div className="flex gap-8 mt-8 justify-center sm:justify-start">
                <div className="text-center">
                  <p className="font-heading text-3xl text-cream">{artworks.length}</p>
                  <p className="text-cream/40 font-body text-xs uppercase tracking-widest">Artworks</p>
                </div>
                <div className="text-center">
                  <p className="font-heading text-3xl text-cream">{totalLikes}</p>
                  <p className="text-cream/40 font-body text-xs uppercase tracking-widest">Likes received</p>
                </div>
                {artist.training_start_year && (
                  <div className="text-center">
                    <p className="font-heading text-3xl text-cream">{artist.training_start_year}</p>
                    <p className="text-cream/40 font-body text-xs uppercase tracking-widest">Training since</p>
                  </div>
                )}
              </div>
            </FadeUp>
          </div>
        </div>

        {/* Artwork grid */}
        <div className="max-w-7xl mx-auto px-4 py-10">
          {artworks.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-cream/30 font-body">No artworks posted yet.</p>
            </div>
          ) : (
            <div className="masonry-grid">
              {artworks.map((artwork, i) => (
                <FadeUp key={artwork.id} delay={i * 50}>
                  <ArtworkCard artwork={artwork} onClick={() => setSelected(artwork)} />
                </FadeUp>
              ))}
            </div>
          )}
        </div>

        {/* Floating portfolio button (own profile only) */}
        {isOwnProfile && (
          <Link
            to={`/portfolio/${username}`}
            className="fixed bottom-8 right-8 bg-burnt text-dark font-body font-bold px-5 py-3 rounded-full shadow-2xl hover:scale-105 transition-transform flex items-center gap-2 no-print"
          >
            <span>🎨</span> Generate My Portfolio
          </Link>
        )}

        {selected && (
          <ArtworkModal artwork={selected} onClose={() => { setSelected(null); loadProfile(); }} />
        )}
      </div>
    </>
  );
}
