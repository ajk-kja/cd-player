import { useStore, tracks } from '../store'

function formatTime(seconds) {
  if (isNaN(seconds)) return '00:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

export function PlayerControls() {
  const isPlaying = useStore((state) => state.isPlaying)
  const currentTrack = useStore((state) => state.currentTrack)
  const currentTime = useStore((state) => state.currentTime)
  const duration = useStore((state) => state.duration)
  const volume = useStore((state) => state.volume)
  const viewMode = useStore((state) => state.viewMode)
  const cameraDistance = useStore((state) => state.cameraDistance)
  const togglePlay = useStore((state) => state.togglePlay)
  const setVolume = useStore((state) => state.setVolume)
  const prevTrack = useStore((state) => state.prevTrack)
  const nextTrack = useStore((state) => state.nextTrack)
  const setViewMode = useStore((state) => state.setViewMode)
  const setIsPlaying = useStore((state) => state.setIsPlaying)

  const track = tracks[currentTrack] || tracks[0]

  // Calculate opacity based on camera distance
  // Distance range: 2 (min/closest) to 10 (max/furthest)
  // Fade starts at distance 5 (50% zoom), fully hidden at distance 2
  const calculateOpacity = () => {
    if (viewMode === 'SHELF') return 1
    const fadeStart = 5  // Start fading at this distance
    const fadeEnd = 2    // Fully hidden at this distance
    if (cameraDistance >= fadeStart) return 1
    if (cameraDistance <= fadeEnd) return 0
    return (cameraDistance - fadeEnd) / (fadeStart - fadeEnd)
  }

  const controlsOpacity = calculateOpacity()

  const handleBack = () => {
    setViewMode('SHELF')
    setIsPlaying(false)
  }

  const handlePlay = () => {
    // If in shelf mode and starting playback, bring album into focus
    if (viewMode === 'SHELF' && !isPlaying) {
      setViewMode('FOCUS')
    }
    togglePlay()
  }

  return (
    <div
      className="player-controls"
      style={{
        opacity: controlsOpacity,
        pointerEvents: controlsOpacity < 0.1 ? 'none' : 'auto',
        transition: 'opacity 0.1s ease-out',
      }}
    >
      <div className="walkman-body compact">
        <div className="lcd-display">
          <div className="lcd-inner">
            <div className="track-info">
              <span className="track-number">
                {String(currentTrack + 1).padStart(2, '0')}
              </span>
              <span className="track-title">{track?.title || 'No Track'}</span>
            </div>
            <div className="time-display">
              <span>{formatTime(currentTime)}</span>
              <span className="separator">/</span>
              <span>{formatTime(duration)}</span>
            </div>
            <div className="status-bar">
              <div
                className="progress"
                style={{
                  width: `${duration ? (currentTime / duration) * 100 : 0}%`,
                }}
              />
            </div>
          </div>
        </div>

        <div className="controls-row">
          <button
            className="control-btn skip-btn"
            onClick={prevTrack}
            title="Previous"
          >
            <span className="btn-icon">⏮</span>
          </button>

          <button
            className={`control-btn play-btn ${isPlaying ? 'playing' : ''}`}
            onClick={handlePlay}
            title={isPlaying ? 'Pause' : 'Play'}
          >
            <span className="btn-icon">{isPlaying ? '⏸' : '▶'}</span>
          </button>

          <button
            className="control-btn skip-btn"
            onClick={nextTrack}
            title="Next"
          >
            <span className="btn-icon">⏭</span>
          </button>
        </div>

        <div className="volume-row">
          <span className="volume-label">VOL</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="volume-slider"
          />
        </div>

        {viewMode === 'FOCUS' && (
          <button
            className="back-btn"
            onClick={handleBack}
          >
            ← Back to Shelf
          </button>
        )}
      </div>
    </div>
  )
}
