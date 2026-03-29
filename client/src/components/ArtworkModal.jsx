import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";

export default function ArtworkModal({ artwork, onClose }) {
  const { session, profile } = useAuth();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [liked, setLiked] = useState(artwork.userLiked || false);
  const [likeCount, setLikeCount] = useState(artwork.like_count || 0);
  const [burst, setBurst] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showInquiry, setShowInquiry] = useState(false);

  const artist = artwork.users;
  const canComment = !!session; // both artists and buyers can comment

  useEffect(() => {
    fetchComments();
    // Close on Escape key
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  async function fetchComments() {
    const { data } = await supabase
      .from("comments")
      .select("*, users(display_name, avatar_url)")
      .eq("artwork_id", artwork.id)
      .order("created_at", { ascending: true });
    if (data) setComments(data);
  }

  async function handleLike() {
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

  async function submitComment(e) {
    e.preventDefault();
    if (!newComment.trim() || !session) return;
    setSubmitting(true);
    const { error } = await supabase.from("comments").insert({
      user_id: session.user.id,
      artwork_id: artwork.id,
      content: newComment.trim(),
    });
    if (!error) {
      setNewComment("");
      await fetchComments();
    }
    setSubmitting(false);
  }

  return (
    <div className="modal-backdrop flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="modal-content bg-stone-900 rounded-2xl overflow-hidden max-w-5xl w-full max-h-[90vh] flex flex-col md:flex-row"
        onClick={e => e.stopPropagation()}
      >
        {/* Left — Image */}
        <div className="md:w-3/5 bg-stone-950 flex items-center justify-center min-h-[300px]">
          <img
            src={artwork.image_url}
            alt={artwork.title}
            className="max-h-[80vh] w-full object-contain"
          />
        </div>

        {/* Right — Info & comments */}
        <div className="md:w-2/5 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="p-5 border-b border-stone-800">
            <div className="flex items-start justify-between mb-3">
              <h2 className="font-heading text-2xl text-cream">{artwork.title}</h2>
              <button onClick={onClose} className="text-cream/40 hover:text-cream text-2xl leading-none ml-2">×</button>
            </div>

            {/* Artist */}
            <Link
              to={`/artist/${artist?.username}`}
              className="flex items-center gap-2 group"
              onClick={onClose}
            >
              {artist?.avatar_url ? (
                <img src={artist.avatar_url} className="w-8 h-8 rounded-full object-cover" alt={artist.display_name} />
              ) : (
                <div className="w-8 h-8 rounded-full bg-burnt/20 flex items-center justify-center text-burnt font-bold text-sm">
                  {(artist?.display_name || "A")[0].toUpperCase()}
                </div>
              )}
              <span className="text-cream/70 font-body text-sm group-hover:text-burnt transition-colors">
                {artist?.display_name || "Artist"}
              </span>
            </Link>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mt-3">
              <span className="chip text-xs">{artwork.medium}</span>
              <span className="chip text-xs">{artwork.category}</span>
              <span className="chip text-xs">{artwork.year}</span>
            </div>

            {/* Description */}
            {artwork.description && (
              <p className="text-cream/60 font-body text-sm mt-3 leading-relaxed">{artwork.description}</p>
            )}

            {/* Like + Inquire */}
            <div className="flex items-center gap-3 mt-4">
              <button
                onClick={handleLike}
                className="flex items-center gap-2 text-sm font-body relative"
              >
                <span className="relative text-xl">
                  {liked ? "❤️" : "🤍"}
                  {burst && (
                    <span className="like-burst absolute inset-0 flex items-center justify-center">🧡</span>
                  )}
                </span>
                <span className={liked ? "text-burnt font-semibold" : "text-cream/60"}>{likeCount}</span>
              </button>

              {/* Inquiry button for buyers */}
              {profile?.type === "buyer" && (
                <button
                  onClick={() => setShowInquiry(!showInquiry)}
                  className="ml-auto text-xs btn-fill border border-burnt text-burnt px-3 py-1.5 rounded-full font-body"
                >
                  Inquire about this artwork
                </button>
              )}
            </div>

            {/* Inquiry form */}
            {showInquiry && <InquiryForm artwork={artwork} onClose={() => setShowInquiry(false)} />}
          </div>

          {/* Comments */}
          <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-3">
            <h3 className="text-cream/50 font-body text-xs uppercase tracking-widest">Comments</h3>
            {comments.length === 0 && (
              <p className="text-cream/30 font-body text-sm">No comments yet. Be the first!</p>
            )}
            {comments.map(c => (
              <div key={c.id} className="flex gap-2">
                <div className="w-7 h-7 rounded-full bg-burnt/20 flex items-center justify-center text-burnt text-xs font-bold shrink-0">
                  {(c.users?.display_name || "?")[0].toUpperCase()}
                </div>
                <div>
                  <span className="text-cream/80 text-xs font-semibold font-body">{c.users?.display_name || "User"} </span>
                  <span className="text-cream/60 text-sm font-body">{c.content}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Comment input */}
          {canComment && (
            <form onSubmit={submitComment} className="p-4 border-t border-stone-800 flex gap-2">
              <input
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                placeholder="Add a comment…"
                className="input-field text-xs flex-1"
                maxLength={300}
              />
              <button
                type="submit"
                disabled={!newComment.trim() || submitting}
                className="btn-primary text-xs px-4 py-2 disabled:opacity-40"
              >
                Post
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

function InquiryForm({ artwork, onClose }) {
  const { profile } = useAuth();
  const [msg, setMsg] = useState("");
  const [sent, setSent] = useState(false);

  async function send(e) {
    e.preventDefault();
    // Store as a comment tagged [INQUIRY]
    const { error } = await supabase.from("comments").insert({
      user_id: profile?.id || null,
      artwork_id: artwork.id,
      content: `[INQUIRY] ${msg}`,
    });
    if (!error) setSent(true);
  }

  if (sent) return <p className="text-sm text-burnt mt-3 font-body">✓ Inquiry sent! The artist will be in touch.</p>;

  return (
    <form onSubmit={send} className="mt-3 flex flex-col gap-2">
      <textarea
        value={msg}
        onChange={e => setMsg(e.target.value)}
        placeholder="Write your inquiry about this artwork…"
        className="input-field text-xs"
        rows={3}
        required
      />
      <div className="flex gap-2">
        <button type="submit" className="btn-primary text-xs px-4 py-2">Send Inquiry</button>
        <button type="button" onClick={onClose} className="text-cream/40 text-xs font-body hover:text-cream">Cancel</button>
      </div>
    </form>
  );
}
