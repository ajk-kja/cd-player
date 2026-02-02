import { useStore, tracks } from '../../store'
import { useAudioAnalyzer } from './useAudioAnalyzer'
import { FrequencyBars } from './FrequencyBars'
import { Waveform } from './Waveform'
import { AbstractPatterns } from './AbstractPatterns'
import { ShaderVisualizer } from './ShaderVisualizer'

const VISUALIZER_SIZE = 200

export function TVVisualizer() {
  const viewMode = useStore((state) => state.viewMode)
  const isPlaying = useStore((state) => state.isPlaying)
  const visualizerType = useStore((state) => state.visualizerType)
  const dinoGameActive = useStore((state) => state.dinoGameActive)
  const currentTrack = useStore((state) => state.currentTrack)

  const { getFrequencyData, getWaveformData, isInitialized } = useAudioAnalyzer()

  const track = tracks[currentTrack] || tracks[0]

  // Only show when in TV view and not playing dino game
  if (viewMode !== 'TV' || dinoGameActive) {
    return null
  }

  const visualizerProps = {
    width: VISUALIZER_SIZE,
    height: VISUALIZER_SIZE,
    getFrequencyData,
    getWaveformData,
  }

  const renderVisualizer = () => {
    if (!isPlaying || !isInitialized) {
      return (
        <div className="visualizer-placeholder">
          <span>PLAY TO VISUALIZE</span>
        </div>
      )
    }

    switch (visualizerType) {
      case 0:
        return <FrequencyBars {...visualizerProps} />
      case 1:
        return <Waveform {...visualizerProps} />
      case 2:
        return <AbstractPatterns {...visualizerProps} />
      case 3:
        return <ShaderVisualizer {...visualizerProps} />
      default:
        return <FrequencyBars {...visualizerProps} />
    }
  }

  const visualizerNames = ['FREQUENCY', 'WAVEFORM', 'PATTERNS', 'SHADER']

  return (
    <div className="tv-visualizer">
      {/* Album art background with reduced opacity */}
      <div
        className="visualizer-background"
        style={{ backgroundImage: `url(${track.coverUrl})` }}
      />

      {/* Visualizer canvas */}
      <div className="visualizer-content">
        {renderVisualizer()}
      </div>

      {/* CRT scanlines overlay */}
      <div className="visualizer-scanlines" />

      {/* Visualizer type indicator */}
      <div className="visualizer-label">
        {visualizerNames[visualizerType]}
      </div>
    </div>
  )
}
