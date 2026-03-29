import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { MEDIUMS, CATEGORIES } from "../lib/constants";
import NavBar from "../components/NavBar";
import PaintSplatter from "../components/PaintSplatter";
import FadeUp from "../components/FadeUp";

export default function Upload() {
  const { session } = useAuth();
  const navigate = useNavigate();
  const fileRef = useRef();

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [title, setTitle] = useState("");
  const [medium, setMedium] = useState("");
  const [category, setCategory] = useState("");
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [description, setDescription] = useState("");
  const [inPortfolio, setInPortfolio] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 20 }, (_, i) => currentYear - i);

  function onFileChange(e) {
    const f = e.target.files[0];
    if (!f) return;
    if (f.size > 10 * 1024 * 1024) { setError("Image must be under 10MB."); return; }
    if (!["image/jpeg", "image/png"].includes(f.type)) { setError("Please use a JPG or PNG file."); return; }
    setImageFile(f);
    setImagePreview(URL.createObjectURL(f));
    setError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!imageFile) { setError("Please select an image."); return; }
    if (!title.trim()) { setError("Please add a title."); return; }
    if (!medium) { setError("Please select a medium."); return; }
    if (!category) { setError("Please select a category."); return; }

    setLoading(true);
    setError("");

    try {
      // Upload image to Supabase Storage
      const ext = imageFile.name.split(".").pop();
      const path = `${session.user.id}/${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("artworks")
        .upload(path, imageFile);
      if (upErr) throw upErr;

      const { data: { publicUrl } } = supabase.storage.from("artworks").getPublicUrl(path);

      // Save to artworks table
      const { error: insertErr } = await supabase.from("artworks").insert({
        user_id: session.user.id,
        title: title.trim(),
        medium,
        category,
        year: parseInt(year),
        description: description.trim() || null,
        image_url: publicUrl,
        in_portfolio: inPortfolio,
      });
      if (insertErr) throw insertErr;

      navigate("/feed");
    } catch (err) {
      setError(err.message || "Upload failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <NavBar />
      <div className="min-h-screen bg-dark px-6 py-12">
        <div className="max-w-2xl mx-auto">
          <FadeUp>
            <h1 className="font-heading text-5xl text-cream mb-2">Share your work</h1>
            <p className="text-cream/50 font-body mb-10">Upload your artwork to the Artspace community.</p>
          </FadeUp>

          <form onSubmit={handleSubmit} className="flex flex-col gap-8">

            {/* Image drop zone */}
            <FadeUp delay={100}>
              <div
                onClick={() => fileRef.current.click()}
                className="border-2 border-dashed border-stone-700 rounded-2xl p-6 text-center hover:border-burnt transition-colors relative overflow-hidden"
                style={{ minHeight: "200px" }}
              >
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="mx-auto max-h-80 rounded-xl object-contain" />
                ) : (
                  <div className="flex flex-col items-center justify-center gap-3 py-8">
                    <span className="text-5xl">🖼️</span>
                    <p className="text-cream/50 font-body">Click to choose your artwork</p>
                    <p className="text-cream/25 font-body text-xs">JPG or PNG · Max 10MB</p>
                  </div>
                )}
              </div>
              <input ref={fileRef} type="file" accept="image/jpeg,image/png" onChange={onFileChange} className="hidden" />
              {imagePreview && (
                <button type="button" onClick={() => fileRef.current.click()} className="mt-2 text-cream/40 text-xs font-body hover:text-cream">
                  Change image
                </button>
              )}
            </FadeUp>

            {/* Title */}
            <FadeUp delay={150}>
              <label className="text-cream/60 font-body text-xs uppercase tracking-widest mb-1.5 block">Title</label>
              <input
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="input-field"
                placeholder="Give your artwork a name…"
                maxLength={80}
                required
              />
            </FadeUp>

            {/* Medium + Category */}
            <div className="grid grid-cols-2 gap-4">
              <FadeUp delay={200}>
                <label className="text-cream/60 font-body text-xs uppercase tracking-widest mb-1.5 block">Medium</label>
                <select value={medium} onChange={e => setMedium(e.target.value)} className="input-field" required>
                  <option value="">Choose medium…</option>
                  {MEDIUMS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </FadeUp>
              <FadeUp delay={250}>
                <label className="text-cream/60 font-body text-xs uppercase tracking-widest mb-1.5 block">Category</label>
                <select value={category} onChange={e => setCategory(e.target.value)} className="input-field" required>
                  <option value="">Choose category…</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </FadeUp>
            </div>

            {/* Year */}
            <FadeUp delay={300}>
              <label className="text-cream/60 font-body text-xs uppercase tracking-widest mb-1.5 block">Year created</label>
              <select value={year} onChange={e => setYear(e.target.value)} className="input-field">
                {years.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </FadeUp>

            {/* Description */}
            <FadeUp delay={350}>
              <label className="text-cream/60 font-body text-xs uppercase tracking-widest mb-1.5 block">
                Description <span className="normal-case text-cream/30">(optional)</span>
              </label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="input-field"
                placeholder="Tell us about this piece — inspiration, process, meaning…"
                rows={3}
                maxLength={400}
              />
            </FadeUp>

            {/* Portfolio toggle */}
            <FadeUp delay={400}>
              <div className="flex items-center justify-between p-4 bg-stone-900 rounded-xl border border-stone-800">
                <div>
                  <p className="text-cream font-body font-semibold text-sm">Include in my portfolio</p>
                  <p className="text-cream/40 font-body text-xs mt-0.5">This artwork will appear on your shareable portfolio page</p>
                </div>
                <button
                  type="button"
                  onClick={() => setInPortfolio(!inPortfolio)}
                  className={`toggle-track ${inPortfolio ? "on" : ""}`}
                  aria-label="Toggle portfolio inclusion"
                >
                  <div className="toggle-thumb" />
                </button>
              </div>
            </FadeUp>

            {error && <p className="text-red-400 font-body text-sm">{error}</p>}

            <FadeUp delay={450}>
              <button type="submit" disabled={loading} className="btn-primary py-4 text-base w-full disabled:opacity-40">
                {loading ? "Uploading…" : "Publish artwork →"}
              </button>
            </FadeUp>
          </form>
        </div>

        {loading && (
          <div className="fixed inset-0 bg-dark/80 flex items-center justify-center z-50">
            <PaintSplatter />
          </div>
        )}
      </div>
    </>
  );
}
