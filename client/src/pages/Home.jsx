export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6">
      <h1 className="font-heading text-6xl md:text-8xl text-cream mb-4">
        Artspace
      </h1>
      <p className="text-cream/70 text-lg md:text-xl max-w-xl text-center mb-8">
        A community for young artists to share, grow, and build their
        college-ready portfolio.
      </p>
      <button className="btn-fill border-2 border-burnt text-burnt px-8 py-3 rounded-full font-body font-semibold text-lg">
        Get Started
      </button>
    </main>
  );
}
