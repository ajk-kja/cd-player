import { create } from 'zustand'

export const useStore = create((set) => ({
  viewMode: 'SHELF',
  currentTrack: 0,
  isPlaying: false,
  volume: 0.7,
  currentTime: 0,
  duration: 0,
  cameraDistance: 6,

  setViewMode: (mode) => set({ viewMode: mode }),
  setCurrentTrack: (track) => set({ currentTrack: track }),
  setIsPlaying: (playing) => set({ isPlaying: playing }),
  setVolume: (volume) => set({ volume }),
  setCurrentTime: (time) => set({ currentTime: time }),
  setDuration: (duration) => set({ duration }),
  setCameraDistance: (distance) => set({ cameraDistance: distance }),

  togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),
  nextTrack: () => set((state) => ({ currentTrack: state.currentTrack + 1 })),
  prevTrack: () => set((state) => ({ currentTrack: Math.max(0, state.currentTrack - 1) })),
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
