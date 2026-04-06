import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";

function timeAgo(dateString) {
  const seconds = Math.floor((new Date() - new Date(dateString)) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateString).toLocaleDateString();
}

export default function RecentActivity() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      const { data } = await supabase
        .from("artworks")
        .select(`
          id, title, image_url, created_at,
          users!inner(id, display_name, username, approved, avatar_url)
        `)
        .eq("users.approved", true)
        .order("created_at", { ascending: false })
        .limit(8);

      if (data) setItems(data);
      setLoading(false);
    }
    fetch();
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 animate-pulse">
            <div className="w-12 h-12 rounded-lg bg-stone-800 flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-3 bg-stone-800 rounded w-2/3" />
              <div className="h-2 bg-stone-800 rounded w-1/4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return <p className="text-cream/30 font-body text-sm">No uploads yet.</p>;
  }

  return (
    <div className="activity-timeline space-y-5">
      {items.map((item) => (
        <div key={item.id} className="relative flex items-center gap-4 pl-2">
          <span className="activity-dot" />

          {/* Thumbnail */}
          <img
            src={item.image_url}
            alt={item.title}
            className="w-12 h-12 rounded-lg object-cover flex-shrink-0 border border-stone-700"
          />

          {/* Text */}
          <div className="flex-1 min-w-0">
            <p className="font-body text-sm text-cream/80 leading-snug">
              <Link
                to={`/artist/${item.users?.username}`}
                className="font-semibold text-cream hover:text-burnt transition-colors"
              >
                {item.users?.display_name}
              </Link>
              {" posted "}
              <span className="text-burnt italic">{item.title}</span>
            </p>
          </div>

          {/* Timestamp */}
          <span className="text-cream/30 font-body text-xs flex-shrink-0">
            {timeAgo(item.created_at)}
          </span>
        </div>
      ))}
    </div>
  );
}
