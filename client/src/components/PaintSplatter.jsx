export default function PaintSplatter({ fullscreen = false }) {
  if (fullscreen) {
    return (
      <div className="fixed inset-0 bg-dark flex flex-col items-center justify-center gap-4 z-50">
        <Splatter />
        <p className="text-cream/50 font-body text-sm">Loading Artspace…</p>
      </div>
    );
  }
  return (
    <div className="flex items-center justify-center py-12">
      <Splatter />
    </div>
  );
}

function Splatter() {
  return (
    <div className="paint-splatter">
      <span /><span /><span /><span />
      <span /><span /><span /><span />
    </div>
  );
}
