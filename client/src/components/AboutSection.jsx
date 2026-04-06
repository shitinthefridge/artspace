import { STUDIO_NAME, TEACHER_NAME } from "../lib/constants";

export default function AboutSection() {
  return (
    <section className="my-20 py-16 px-8 rounded-2xl bg-stone-900/50 border border-stone-800">
      <div className="flex flex-col md:flex-row gap-12 items-start">
        {/* Left: mission */}
        <div className="flex-1">
          <p className="text-burnt font-body text-xs uppercase tracking-widest mb-3">About the Studio</p>
          <h2 className="font-heading text-4xl text-cream mb-6 leading-tight">
            A space where young artists find their voice.
          </h2>
          <p className="text-cream/60 font-body text-base leading-relaxed max-w-lg">
            {STUDIO_NAME} is a curated community for artists aged 13–18, trained under a professional mentor.
            Every artwork here represents hours of dedication, growth, and creative exploration — documented
            as a living portfolio ready for college applications and beyond.
          </p>
          <hr className="border-burnt/20 mt-8 w-24" />
        </div>

        {/* Right: teacher info */}
        <div className="md:w-64 flex-shrink-0">
          <div className="border border-burnt/30 rounded-xl p-6">
            <p className="text-cream/40 font-body text-xs uppercase tracking-widest mb-2">Led by</p>
            <p className="font-heading text-2xl text-cream mb-3">{TEACHER_NAME}</p>
            <p className="text-cream/50 font-body text-sm leading-relaxed">
              Professional art educator and mentor, guiding young artists to develop their unique style
              and build compelling portfolios.
            </p>
            <div className="mt-4 flex gap-2">
              <span className="bg-burnt/10 text-burnt font-body text-xs px-3 py-1 rounded-full border border-burnt/20">
                Mentor
              </span>
              <span className="bg-burnt/10 text-burnt font-body text-xs px-3 py-1 rounded-full border border-burnt/20">
                Educator
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
