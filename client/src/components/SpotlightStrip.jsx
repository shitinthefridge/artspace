export default function SpotlightStrip({ artworks, onSelect }) {
  if (!artworks || artworks.length === 0) return null;

  return (
    <div className="spotlight-strip px-6 py-6">
      {artworks.map((artwork) => (
        <div
          key={artwork.id}
          className="spotlight-card cursor-pointer group"
          onClick={() => onSelect(artwork)}
        >
          {/* Image */}
          <img
            src={artwork.image_url}
            alt={artwork.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />

          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Bottom info — always visible */}
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
            <div className="flex items-center gap-2 mb-1">
              {artwork.users?.avatar_url ? (
                <img
                  src={artwork.users.avatar_url}
                  alt={artwork.users.display_name}
                  className="w-6 h-6 rounded-full object-cover border border-cream/20"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-burnt/20 flex items-center justify-center">
                  <span className="text-burnt text-xs font-body font-bold">
                    {artwork.users?.display_name?.[0]?.toUpperCase() || "?"}
                  </span>
                </div>
              )}
              <span className="text-cream/70 font-body text-xs truncate">
                {artwork.users?.display_name}
              </span>
            </div>
            <p className="font-heading text-cream text-sm leading-tight line-clamp-2">
              {artwork.title}
            </p>
          </div>

          {/* Medium chip on hover */}
          {artwork.medium && (
            <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <span className="bg-burnt/80 text-cream font-body text-xs px-2 py-0.5 rounded-full">
                {artwork.medium}
              </span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
