import { create } from 'zustand'

export const useStore = create((set) => ({
  viewMode: 'SHELF', // 'SHELF' | 'ALBUM' | 'TV' | 'POSTER'
  currentTrack: 0,
  isPlaying: false,
  volume: 0.7,
  currentTime: 0,
  duration: 0,
  cameraDistance: 6,
  isMuted: false,
  isDimmed: false,
  visualizerType: 0, // 0-3, cycles on track change
  dinoGameActive: false,
  dinoGameScore: 0,
  dinoJumpTrigger: 0, // Increment to trigger a jump
  audioRef: null, // Reference to audio element for visualizers
  analyzerData: {
    isInitialized: false,
    getFrequencyData: () => new Uint8Array(128).fill(0),
    getWaveformData: () => new Uint8Array(128).fill(128),
  },

  setViewMode: (mode) => set({ viewMode: mode }),
  setCurrentTrack: (track) => set({ currentTrack: track }),
  setIsPlaying: (playing) => set({ isPlaying: playing }),
  setVolume: (volume) => set({ volume }),
  setCurrentTime: (time) => set({ currentTime: time }),
  setDuration: (duration) => set({ duration }),
  setCameraDistance: (distance) => set({ cameraDistance: distance }),
  setAudioRef: (ref) => set({ audioRef: ref }),
  setAnalyzerData: (data) => set({ analyzerData: data }),

  togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),
  nextTrack: () => set((state) => ({
    currentTrack: state.currentTrack + 1,
    isPlaying: true, // Auto-play when advancing
  })),
  prevTrack: () => set((state) => ({
    currentTrack: Math.max(0, state.currentTrack - 1),
    isPlaying: true, // Auto-play when going back
  })),
  toggleMute: () => set((state) => ({
    isMuted: !state.isMuted,
    isDimmed: false, // Clear dim when toggling mute
  })),
  toggleDim: () => set((state) => ({
    isDimmed: !state.isDimmed,
    isMuted: false, // Clear mute when toggling dim
  })),
  cycleVisualizer: () => set((state) => ({
    visualizerType: (state.visualizerType + 1) % 4,
  })),
  setDinoGameActive: (active) => set({ dinoGameActive: active }),
  setDinoGameScore: (score) => set({ dinoGameScore: score }),
  triggerDinoJump: () => set((state) => ({ dinoJumpTrigger: state.dinoJumpTrigger + 1 })),
}))

export const tracks = [
  {
    id: 1,
    title: 'Down Your Scope',
    artist: 'Unknown Artist',
    audioUrl: '/assets/tracks/Down Your Scope.wav',
    coverUrl: '/assets/tracks/Down Your Scope.png',
  },
  {
    id: 2,
    title: 'No Scope Ramp',
    artist: 'Unknown Artist',
    audioUrl: '/assets/tracks/No Scope Ramp.wav',
    coverUrl: '/assets/tracks/No Scope Ramp.jpeg',
  },
  {
    id: 3,
    title: 'Djno Djscope',
    artist: 'Unknown Artist',
    audioUrl: '/assets/tracks/Djno Djscope.wav',
    coverUrl: '/assets/tracks/Djno Djscope.png',
  },
  {
    id: 4,
    title: 'No Sk(ope)8',
    artist: 'Unknown Artist',
    audioUrl: '/assets/tracks/No Sk(ope)8.wav',
    coverUrl: '/assets/tracks/No Sk(ope)8.png',
  },
]
