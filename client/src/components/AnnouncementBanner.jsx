import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function AnnouncementBanner() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    supabase
      .from("announcements")
      .select("content")
      .eq("active", true)
      .order("created_at", { ascending: false })
      .limit(1)
      .then(({ data }) => {
        if (data && data.length > 0) setMessage(data[0].content);
      });
  }, []);

  if (!message) return null;

  return (
    <div className="announcement-banner no-print">
      <p>{message}</p>
    </div>
  );
}
