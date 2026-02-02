import { useStore, tracks } from '../store'

export function PosterInfo() {
  const viewMode = useStore((state) => state.viewMode)
  const currentTrack = useStore((state) => state.currentTrack)

  const track = tracks[currentTrack] || tracks[0]

  // Only show when in POSTER view mode
  if (viewMode !== 'POSTER') {
    return null
  }

  return (
    <div className="poster-info">
      <div className="poster-info-content">
        <div className="poster-info-title">{track.title}</div>
        <div className="poster-info-artist">{track.artist}</div>
        <div className="poster-info-track">
          TRACK {String(currentTrack + 1).padStart(2, '0')}
        </div>
      </div>
      {/* Dot matrix decorative elements */}
      <div className="poster-info-dots">
        {Array.from({ length: 20 }).map((_, i) => (
          <span key={i} className="dot" />
        ))}
      </div>
    </div>
  )
}
