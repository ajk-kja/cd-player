import { useStore } from '../../store'

// This hook now just reads analyzer data from the store
// The actual Web Audio connection is managed by AudioManager
export function useAudioAnalyzer() {
  const analyzerData = useStore((state) => state.analyzerData)

  return {
    isInitialized: analyzerData.isInitialized,
    getFrequencyData: analyzerData.getFrequencyData,
    getWaveformData: analyzerData.getWaveformData,
  }
}
