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
  const viewMode = useStore((state) => state.viewMode)
  const cameraDistance = useStore((state) => state.cameraDistance)
  const isMuted = useStore((state) => state.isMuted)
  const isDimmed = useStore((state) => state.isDimmed)
  const togglePlay = useStore((state) => state.togglePlay)
  const toggleMute = useStore((state) => state.toggleMute)
  const toggleDim = useStore((state) => state.toggleDim)
  const prevTrack = useStore((state) => state.prevTrack)
  const nextTrack = useStore((state) => state.nextTrack)
  const setViewMode = useStore((state) => state.setViewMode)
  const setIsPlaying = useStore((state) => state.setIsPlaying)

  const track = tracks[currentTrack] || tracks[0]

  // Show controls in SHELF, ALBUM, or TV view modes
  const shouldShowControls = viewMode === 'SHELF' || viewMode === 'ALBUM' || viewMode === 'TV'

  // Calculate opacity based on camera distance
  // Distance range: 2 (min/closest) to 10 (max/furthest)
  // Fade starts at distance 5 (50% zoom), fully hidden at distance 2
  const calculateOpacity = () => {
    if (!shouldShowControls) return 0
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
    // Keep playing - don't stop the music when returning to shelf
  }

  const handlePlay = () => {
    // If in shelf mode and starting playback, bring album into focus
    if (viewMode === 'SHELF' && !isPlaying) {
      setViewMode('ALBUM')
    }
    togglePlay()
  }

  if (!shouldShowControls) return null

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

        <div className="controls-row secondary">
          <button
            className={`control-btn volume-btn ${isMuted ? 'active' : ''}`}
            onClick={toggleMute}
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            <span className="btn-icon">{isMuted ? '🔇' : '🔊'}</span>
          </button>
          <button
            className={`control-btn volume-btn ${isDimmed ? 'active' : ''}`}
            onClick={toggleDim}
            title={isDimmed ? 'Full volume' : '50% volume'}
          >
            <span className="btn-icon-text">50%</span>
          </button>
        </div>

        {viewMode === 'ALBUM' && (
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
