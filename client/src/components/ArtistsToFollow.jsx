import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function ArtistsToFollow({ currentUserId }) {
  const [artists, setArtists] = useState([]);
  const [followedIds, setFollowedIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [pendingIds, setPendingIds] = useState(new Set());

  useEffect(() => {
    async function load() {
      // Run both queries in parallel
      const [artistRes, followRes] = await Promise.all([
        supabase
          .from("users")
          .select("id, display_name, username, avatar_url, artworks(count)")
          .eq("type", "artist")
          .eq("approved", true)
          .neq("id", currentUserId ?? "00000000-0000-0000-0000-000000000000")
          .limit(12),
        currentUserId
          ? supabase.from("follows").select("following_id").eq("follower_id", currentUserId)
          : Promise.resolve({ data: [] }),
      ]);

      if (artistRes.data) {
        // Fetch follower counts separately to avoid FK alias issues
        const artistsWithCounts = await Promise.all(
          artistRes.data.map(async (artist) => {
            const { count } = await supabase
              .from("follows")
              .select("*", { count: "exact", head: true })
              .eq("following_id", artist.id);
            return { ...artist, follower_count: count ?? 0 };
          })
        );
        setArtists(artistsWithCounts);
      }

      if (followRes.data) {
        setFollowedIds(new Set(followRes.data.map((f) => f.following_id)));
      }

      setLoading(false);
    }
    load();
  }, [currentUserId]);

  async function toggleFollow(artistId) {
    if (!currentUserId || pendingIds.has(artistId)) return;
    const isFollowing = followedIds.has(artistId);

    // Optimistic update
    setPendingIds((p) => new Set([...p, artistId]));
    setFollowedIds((prev) => {
      const next = new Set(prev);
      isFollowing ? next.delete(artistId) : next.add(artistId);
      return next;
    });
    setArtists((prev) =>
      prev.map((a) =>
        a.id === artistId
          ? { ...a, follower_count: a.follower_count + (isFollowing ? -1 : 1) }
          : a
      )
    );

    if (isFollowing) {
      await supabase.from("follows").delete().match({ follower_id: currentUserId, following_id: artistId });
    } else {
      await supabase.from("follows").insert({ follower_id: currentUserId, following_id: artistId });
    }

    setPendingIds((p) => { const n = new Set(p); n.delete(artistId); return n; });
  }

  if (loading) {
    return (
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-3 animate-pulse">
            <div className="w-16 h-16 rounded-full bg-stone-800" />
            <div className="h-2 bg-stone-800 rounded w-16" />
          </div>
        ))}
      </div>
    );
  }

  if (artists.length === 0) {
    return <p className="text-cream/30 font-body text-sm">No artists yet.</p>;
  }

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-6">
      {artists.map((artist) => {
        const isFollowing = followedIds.has(artist.id);
        const artworkCount = artist.artworks?.[0]?.count ?? 0;

        return (
          <div key={artist.id} className="artist-follow-card flex flex-col items-center gap-2">
            {/* Avatar */}
            <Link to={`/artist/${artist.username}`} className="relative block">
              {artist.avatar_url ? (
                <img
                  src={artist.avatar_url}
                  alt={artist.display_name}
                  className="w-16 h-16 rounded-full object-cover border-2 border-stone-700 hover:border-burnt transition-colors duration-200"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-burnt/20 border-2 border-stone-700 hover:border-burnt transition-colors duration-200 flex items-center justify-center">
                  <span className="font-heading text-burnt text-xl">
                    {artist.display_name?.[0]?.toUpperCase() || "?"}
                  </span>
                </div>
              )}
            </Link>

            {/* Name + stats — revealed on hover */}
            <div className="artist-card-info flex flex-col items-center gap-1 text-center">
              <Link
                to={`/artist/${artist.username}`}
                className="font-body text-xs font-semibold text-cream hover:text-burnt transition-colors line-clamp-1"
              >
                {artist.display_name}
              </Link>
              <p className="text-cream/40 font-body text-xs">
                {artist.follower_count} {artist.follower_count === 1 ? "follower" : "followers"} · {artworkCount} {artworkCount === 1 ? "work" : "works"}
              </p>
            </div>

            {/* Follow button */}
            {currentUserId && (
              <button
                onClick={() => toggleFollow(artist.id)}
                disabled={pendingIds.has(artist.id)}
                className={`text-xs px-3 py-1 rounded-full font-body font-semibold transition-all duration-200 border disabled:opacity-50 ${
                  isFollowing
                    ? "border-burnt/50 text-burnt bg-transparent hover:bg-burnt/10"
                    : "bg-burnt text-dark border-burnt hover:bg-burnt/80"
                }`}
              >
                {isFollowing ? "Following" : "Follow"}
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
