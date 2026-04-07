import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { MEDIUMS, CATEGORIES, TEACHER_NAME } from "../lib/constants";
import PaintSplatter from "../components/PaintSplatter";

export default function Onboarding() {
  const { session, refreshProfile } = useAuth();
  const navigate = useNavigate();

  const [displayName, setDisplayName] = useState("");
  const [aboutMe, setAboutMe] = useState("");
  const [mediums, setMediums] = useState([]);
  const [categories, setCategories] = useState([]);
  const [topics, setTopics] = useState([]);
  const [topicInput, setTopicInput] = useState("");
  const [trainingYear, setTrainingYear] = useState("");
  const [city, setCity] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef();

  function toggleChip(arr, setArr, val) {
    setArr(arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val]);
  }

  function handleTopicKey(e) {
    if ((e.key === "Enter" || e.key === ",") && topicInput.trim()) {
      e.preventDefault();
      const t = topicInput.trim().toLowerCase();
      if (!topics.includes(t)) setTopics([...topics, t]);
      setTopicInput("");
    }
  }

  function onAvatarChange(e) {
    const f = e.target.files[0];
    if (!f) return;
    setAvatarFile(f);
    setAvatarPreview(URL.createObjectURL(f));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!displayName.trim()) { setError("Please enter your display name."); return; }
    setLoading(true);
    setError("");

    try {
      let avatarUrl = null;

      // Upload avatar if chosen
      if (avatarFile) {
        const ext = avatarFile.name.split(".").pop();
        const path = `${session.user.id}/avatar.${ext}`;
        const { error: upErr } = await supabase.storage
          .from("avatars")
          .upload(path, avatarFile, { upsert: true });
        if (upErr) throw upErr;
        const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(path);
        avatarUrl = publicUrl;
      }

      // Generate username from display name
      const username = displayName.toLowerCase()
        .replace(/\s+/g, "_")
        .replace(/[^a-z0-9_]/g, "")
        .slice(0, 30) + "_" + Math.floor(Math.random() * 100);

      // Update user profile
      const updatePayload = {
        display_name: displayName.trim(),
        about_me: aboutMe.trim(),
        mediums,
        categories,
        topics,
        training_start_year: trainingYear ? parseInt(trainingYear) : null,
        avatar_url: avatarUrl,
        username,
      };
      if (city.trim()) updatePayload.country = city.trim();

      const { error: updateErr } = await supabase.from("users").update(updatePayload).eq("id", session.user.id);

      if (updateErr) throw updateErr;

      await refreshProfile();
      navigate("/feed");
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 20 }, (_, i) => currentYear - i);

  return (
    <div className="min-h-screen bg-dark px-6 py-12">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="font-heading text-5xl text-cream mb-3">Your sketchbook page</h1>
          <p className="text-cream/50 font-body text-lg">
            Tell us about yourself as an artist. Take your time — this is your story.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-10">

          {/* Display name */}
          <section>
            <label className="text-cream/60 font-body text-xs uppercase tracking-widest mb-2 block">
              What should we call you?
            </label>
            <input
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              className="input-field text-lg"
              placeholder="Your artist name…"
              maxLength={50}
              required
            />
          </section>

          {/* Profile photo */}
          <section>
            <label className="text-cream/60 font-body text-xs uppercase tracking-widest mb-2 block">
              Profile photo
            </label>
            <div className="flex items-center gap-5">
              <div
                onClick={() => fileRef.current.click()}
                className="w-24 h-24 rounded-full border-2 border-dashed border-stone-700 flex items-center justify-center overflow-hidden relative group hover:border-burnt transition-colors"
              >
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar preview" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-cream/30 text-3xl group-hover:text-burnt transition-colors">+</span>
                )}
              </div>
              <div>
                <button type="button" onClick={() => fileRef.current.click()} className="btn-fill border border-stone-700 text-cream/60 px-4 py-2 rounded-full font-body text-sm hover:text-cream">
                  Choose photo
                </button>
                <p className="text-cream/30 font-body text-xs mt-1">JPG or PNG, under 5MB</p>
              </div>
            </div>
            <input ref={fileRef} type="file" accept="image/jpeg,image/png" onChange={onAvatarChange} className="hidden" />
          </section>

          {/* About Me */}
          <section>
            <label className="text-cream/60 font-body text-xs uppercase tracking-widest mb-2 block">
              Tell us your story as an artist
            </label>
            <textarea
              value={aboutMe}
              onChange={e => setAboutMe(e.target.value)}
              className="input-field"
              placeholder="What do you love about making art? What inspires you? Where do your ideas come from?"
              rows={5}
              maxLength={600}
            />
            <p className="text-cream/20 font-body text-xs mt-1 text-right">{aboutMe.length}/600</p>
          </section>

          {/* Mediums */}
          <section>
            <label className="text-cream/60 font-body text-xs uppercase tracking-widest mb-3 block">
              What mediums do you work in? (tap to select)
            </label>
            <div className="flex flex-wrap gap-2">
              {MEDIUMS.map(m => (
                <button
                  key={m}
                  type="button"
                  onClick={() => toggleChip(mediums, setMediums, m)}
                  className={`chip ${mediums.includes(m) ? "selected" : ""}`}
                >
                  {m}
                </button>
              ))}
            </div>
          </section>

          {/* Categories */}
          <section>
            <label className="text-cream/60 font-body text-xs uppercase tracking-widest mb-3 block">
              Favorite categories (tap to select)
            </label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => toggleChip(categories, setCategories, c)}
                  className={`chip ${categories.includes(c) ? "selected" : ""}`}
                >
                  {c}
                </button>
              ))}
            </div>
          </section>

          {/* Topics tag input */}
          <section>
            <label className="text-cream/60 font-body text-xs uppercase tracking-widest mb-2 block">
              Favorite topics <span className="normal-case text-cream/30">(type a word, press Enter)</span>
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {topics.map(t => (
                <span key={t} className="tag">
                  {t}
                  <button type="button" onClick={() => setTopics(topics.filter(x => x !== t))}>×</button>
                </span>
              ))}
            </div>
            <input
              value={topicInput}
              onChange={e => setTopicInput(e.target.value)}
              onKeyDown={handleTopicKey}
              className="input-field"
              placeholder="e.g. dreams, nature, identity…"
            />
          </section>

          {/* Location */}
          <section>
            <label className="text-cream/60 font-body text-xs uppercase tracking-widest mb-2 block">
              Where are you from?
            </label>
            <input
              value={city}
              onChange={e => setCity(e.target.value)}
              className="input-field"
              placeholder="e.g. Mumbai, India"
              maxLength={80}
            />
            <p className="text-cream/20 font-body text-xs mt-1">This appears on your profile and the globe on our homepage.</p>
          </section>

          {/* Training year */}
          <section>
            <label className="text-cream/60 font-body text-xs uppercase tracking-widest mb-2 block">
              Year you started training
            </label>
            <select
              value={trainingYear}
              onChange={e => setTrainingYear(e.target.value)}
              className="input-field"
            >
              <option value="">Select a year…</option>
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </section>

          {/* Auto-filled teacher credit */}
          <section>
            <label className="text-cream/60 font-body text-xs uppercase tracking-widest mb-2 block">
              Trained under
            </label>
            <div className="input-field opacity-50 text-cream/60 italic">
              {TEACHER_NAME}
            </div>
          </section>

          {error && <p className="text-red-400 font-body text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary py-4 text-lg w-full disabled:opacity-40"
          >
            {loading ? "Saving your profile…" : "Enter Artspace →"}
          </button>
        </form>
      </div>

      {loading && (
        <div className="fixed inset-0 bg-dark/80 flex items-center justify-center z-50">
          <PaintSplatter />
        </div>
      )}
    </div>
  );
}
