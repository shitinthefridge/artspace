import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import PaintSplatter from "../components/PaintSplatter";

const ADMIN_EMAIL    = import.meta.env.VITE_ADMIN_EMAIL    || "";
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || "";

export default function Admin() {
  const [authed, setAuthed] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  function tryLogin(e) {
    e.preventDefault();
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD && ADMIN_EMAIL !== "") {
      setAuthed(true);
      setError("");
    } else {
      setError("Incorrect email or password.");
    }
  }

  if (!authed) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center px-6">
        <div className="max-w-sm w-full">
          <Link to="/" className="text-cream/40 hover:text-cream font-body text-sm mb-8 block">← Back to site</Link>
          <h1 className="font-heading text-4xl text-cream mb-2">Admin Panel</h1>
          <p className="text-cream/40 font-body text-sm mb-8">For Artspace administrators only.</p>
          <form onSubmit={tryLogin} className="flex flex-col gap-4">
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="input-field"
              placeholder="Admin email"
              autoFocus
            />
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="input-field pr-12"
                placeholder="Admin password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-cream/40 hover:text-cream transition-colors"
                tabIndex={-1}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )}
              </button>
            </div>
            {error && <p className="text-red-400 font-body text-sm">{error}</p>}
            <button type="submit" className="btn-primary py-3">Sign In</button>
          </form>
        </div>
      </div>
    );
  }

  return <AdminDashboard />;
}

function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [announcement, setAnnouncement] = useState("");
  const [annSaving, setAnnSaving] = useState(false);
  const [annMsg, setAnnMsg] = useState("");
  const [tab, setTab] = useState("pending"); // 'pending' | 'all'

  useEffect(() => { loadUsers(); }, []);

  async function loadUsers() {
    setLoading(true);
    const { data, error } = await supabase.rpc("get_all_users_admin");
    if (!error && data) setUsers(data);
    setLoading(false);
  }

  async function setApproved(userId, approved) {
    await supabase.rpc("set_user_approved", { p_user_id: userId, p_approved: approved });
    await loadUsers();
  }

  async function saveAnnouncement(e) {
    e.preventDefault();
    setAnnSaving(true);
    await supabase.rpc("upsert_announcement", { p_content: announcement });
    setAnnMsg(announcement ? "✓ Announcement posted!" : "✓ Announcement cleared.");
    setTimeout(() => setAnnMsg(""), 3000);
    setAnnSaving(false);
  }

  const pending  = users.filter(u => u.type === "artist" && !u.approved);
  const approved = users.filter(u => u.type === "artist" && u.approved);
  const display  = tab === "pending" ? pending : users.filter(u => u.type === "artist");

  return (
    <div className="min-h-screen bg-dark px-6 py-10">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-heading text-4xl text-cream">Admin Panel</h1>
            <p className="text-cream/40 font-body text-sm mt-1">Artspace Studio Management</p>
          </div>
          <Link to="/" className="text-cream/40 hover:text-cream font-body text-sm">← Back to site</Link>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          {[
            { label: "Pending approval", value: pending.length, color: "text-yellow-400" },
            { label: "Approved artists", value: approved.length, color: "text-green-400" },
            { label: "Total users",      value: users.length,    color: "text-cream" },
          ].map(s => (
            <div key={s.label} className="bg-stone-900 rounded-xl p-5 border border-stone-800 text-center">
              <p className={`font-heading text-4xl ${s.color}`}>{s.value}</p>
              <p className="text-cream/40 font-body text-xs mt-1 uppercase tracking-widest">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Announcement */}
        <section className="bg-stone-900 rounded-xl p-6 border border-stone-800 mb-10">
          <h2 className="font-heading text-xl text-cream mb-1">Sitewide Announcement</h2>
          <p className="text-cream/40 font-body text-xs mb-4">This banner appears at the top of every page. Leave blank to remove it.</p>
          <form onSubmit={saveAnnouncement} className="flex gap-3">
            <input
              value={announcement}
              onChange={e => setAnnouncement(e.target.value)}
              className="input-field flex-1"
              placeholder="e.g. 🎨 Applications for Summer 2025 are now open!"
              maxLength={200}
            />
            <button type="submit" disabled={annSaving} className="btn-primary px-5 py-2 text-sm shrink-0">
              {annSaving ? "Saving…" : "Post"}
            </button>
          </form>
          {annMsg && <p className="text-green-400 font-body text-sm mt-2">{annMsg}</p>}
        </section>

        {/* Artist approval */}
        <section>
          <div className="flex items-center gap-4 mb-5">
            <h2 className="font-heading text-xl text-cream">Artists</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setTab("pending")}
                className={`text-xs font-body px-3 py-1.5 rounded-full border transition-all ${tab === "pending" ? "border-burnt bg-burnt/10 text-burnt" : "border-stone-700 text-cream/50"}`}
              >
                Pending ({pending.length})
              </button>
              <button
                onClick={() => setTab("all")}
                className={`text-xs font-body px-3 py-1.5 rounded-full border transition-all ${tab === "all" ? "border-burnt bg-burnt/10 text-burnt" : "border-stone-700 text-cream/50"}`}
              >
                All artists
              </button>
            </div>
          </div>

          {loading ? <PaintSplatter /> : (
            display.length === 0 ? (
              <p className="text-cream/30 font-body py-8 text-center">
                {tab === "pending" ? "No artists waiting for approval 🎉" : "No artists yet."}
              </p>
            ) : (
              <div className="flex flex-col gap-3">
                {display.map(user => (
                  <div key={user.id} className="flex items-center justify-between bg-stone-900 rounded-xl px-5 py-4 border border-stone-800">
                    <div className="flex items-center gap-3">
                      {user.avatar_url ? (
                        <img src={user.avatar_url} className="w-10 h-10 rounded-full object-cover" alt={user.display_name} />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-burnt/20 flex items-center justify-center text-burnt font-bold">
                          {(user.display_name || user.email || "?")[0].toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="text-cream font-body font-semibold text-sm">{user.display_name || "—"}</p>
                        <p className="text-cream/40 font-body text-xs">{user.email}</p>
                        {user.country && <p className="text-cream/30 font-body text-xs">{user.country}</p>}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {user.username && (
                        <Link
                          to={`/portfolio/${user.username}`}
                          target="_blank"
                          className="text-xs text-cream/40 hover:text-cream font-body border border-stone-700 px-3 py-1.5 rounded-full transition-colors"
                        >
                          View portfolio
                        </Link>
                      )}

                      {user.approved ? (
                        <button
                          onClick={() => setApproved(user.id, false)}
                          className="text-xs font-body border border-red-800 text-red-400 hover:bg-red-900/20 px-3 py-1.5 rounded-full transition-colors"
                        >
                          Revoke
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={() => setApproved(user.id, true)}
                            className="text-xs font-body bg-green-700 hover:bg-green-600 text-white px-4 py-1.5 rounded-full transition-colors"
                          >
                            ✓ Approve
                          </button>
                          <button
                            onClick={() => setApproved(user.id, false)}
                            className="text-xs font-body border border-stone-700 text-cream/40 hover:text-cream px-3 py-1.5 rounded-full transition-colors"
                          >
                            Reject
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </section>
      </div>
    </div>
  );
}
