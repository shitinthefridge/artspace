import { useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";

export default function ArtworkCard({ artwork, onClick }) {
  const { session, profile } = useAuth();
  const [liked, setLiked] = useState(artwork.userLiked || false);
  const [likeCount, setLikeCount] = useState(artwork.like_count || 0);
  const [burst, setBurst] = useState(false);

  const artist = artwork.users;

  async function handleLike(e) {
    e.stopPropagation();
    if (!session) return;

    if (liked) {
      await supabase.from("likes").delete().match({ user_id: session.user.id, artwork_id: artwork.id });
      setLikeCount(c => c - 1);
      setLiked(false);
    } else {
      await supabase.from("likes").insert({ user_id: session.user.id, artwork_id: artwork.id });
      setLikeCount(c => c + 1);
      setLiked(true);
      setBurst(true);
      setTimeout(() => setBurst(false), 700);
    }
  }

  return (
    <div
      className="masonry-grid-item card-tilt rounded-xl overflow-hidden bg-stone-900 relative group"
      onClick={onClick}
    >
      {/* Artwork image */}
      <img
        src={artwork.image_url}
        alt={artwork.title}
        className="w-full object-cover block"
        loading="lazy"
      />

      {/* Hover overlay */}
      <div className="card-overlay" />

      {/* Bottom info strip (always visible) */}
      <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-0">
        <div className="flex items-center justify-between">
          {/* Artist info */}
          <div className="flex items-center gap-2">
            {artist?.avatar_url ? (
              <img src={artist.avatar_url} alt={artist.display_name} className="w-6 h-6 rounded-full object-cover border border-burnt/40" />
            ) : (
              <div className="w-6 h-6 rounded-full bg-burnt/30 flex items-center justify-center text-xs text-burnt font-bold">
                {(artist?.display_name || "A")[0].toUpperCase()}
              </div>
            )}
            <span className="text-cream/80 text-xs font-body truncate max-w-[80px]">{artist?.display_name || "Artist"}</span>
          </div>

          {/* Medium chip */}
          <span className="text-xs text-burnt/80 font-body bg-burnt/10 px-2 py-0.5 rounded-full border border-burnt/20">
            {artwork.medium}
          </span>
        </div>

        {/* Stats on hover */}
        <div className="opacity-0 group-hover:opacity-100 transition-opacity mt-2 flex items-center gap-3">
          {/* Like button */}
          <button
            onClick={handleLike}
            className="flex items-center gap-1 text-xs font-body relative"
          >
            <span className="relative">
              {liked ? "❤️" : "🤍"}
              {burst && (
                <span className="like-burst absolute inset-0 flex items-center justify-center text-base">🧡</span>
              )}
            </span>
            <span className={liked ? "text-burnt" : "text-cream/60"}>{likeCount}</span>
          </button>

          {/* Comment count */}
          <span className="flex items-center gap-1 text-xs text-cream/60 font-body">
            💬 {artwork.comment_count || 0}
          </span>
        </div>
      </div>
    </div>
  );
}
