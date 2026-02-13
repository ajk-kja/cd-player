import { useEffect, useRef, useCallback } from 'react'
import { useStore, tracks } from '../store'

export function AudioManager() {
  const audioRef = useRef(null)
  const audioContextRef = useRef(null)
  const analyzerRef = useRef(null)
  const sourceRef = useRef(null)
  const gainNodeRef = useRef(null)
  const dataArrayRef = useRef(null)
  const currentTrackRef = useRef(null)
  const prevTrackRef = useRef(null)
  const isConnectedRef = useRef(false)

  const isPlaying = useStore((state) => state.isPlaying)
  const currentTrack = useStore((state) => state.currentTrack)
  const volume = useStore((state) => state.volume)
  const isMuted = useStore((state) => state.isMuted)
  const isDimmed = useStore((state) => state.isDimmed)
  const setCurrentTime = useStore((state) => state.setCurrentTime)
  const setDuration = useStore((state) => state.setDuration)
  const setIsPlaying = useStore((state) => state.setIsPlaying)
  const setAudioRef = useStore((state) => state.setAudioRef)
  const setAnalyzerData = useStore((state) => state.setAnalyzerData)
  const cycleVisualizer = useStore((state) => state.cycleVisualizer)

  const track = tracks[currentTrack]

  // Connect audio to Web Audio API for visualizer (only once)
  const connectAnalyzer = useCallback(() => {
    const audio = audioRef.current
    if (!audio || isConnectedRef.current) return

    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext
      audioContextRef.current = new AudioContext()

      analyzerRef.current = audioContextRef.current.createAnalyser()
      analyzerRef.current.fftSize = 256
      analyzerRef.current.smoothingTimeConstant = 0.8

      // Create GainNode for iOS-compatible volume control
      gainNodeRef.current = audioContextRef.current.createGain()
      gainNodeRef.current.gain.value = 0.7 // Default volume

      sourceRef.current = audioContextRef.current.createMediaElementSource(audio)
      
      // Connect: source -> gain -> analyzer -> destination
      sourceRef.current.connect(gainNodeRef.current)
      gainNodeRef.current.connect(analyzerRef.current)
      analyzerRef.current.connect(audioContextRef.current.destination)

      const bufferLength = analyzerRef.current.frequencyBinCount
      dataArrayRef.current = new Uint8Array(bufferLength)

      isConnectedRef.current = true

      // Store analyzer functions in the store
      setAnalyzerData({
        isInitialized: true,
        getFrequencyData: () => {
          if (analyzerRef.current && dataArrayRef.current) {
            analyzerRef.current.getByteFrequencyData(dataArrayRef.current)
            return dataArrayRef.current
          }
          return new Uint8Array(128).fill(0)
        },
        getWaveformData: () => {
          if (analyzerRef.current && dataArrayRef.current) {
            analyzerRef.current.getByteTimeDomainData(dataArrayRef.current)
            return dataArrayRef.current
          }
          return new Uint8Array(128).fill(128)
        }
      })
    } catch (error) {
      console.error('Failed to connect analyzer:', error)
    }
  }, [setAnalyzerData])

  // Resume AudioContext if suspended
  const resumeAudioContext = useCallback(() => {
    if (audioContextRef.current?.state === 'suspended') {
      audioContextRef.current.resume()
    }
  }, [])

  // Initialize audio element once
  useEffect(() => {
    const audio = new Audio()
    audio.preload = 'auto'
    audioRef.current = audio
    setAudioRef(audio)

    audio.addEventListener('timeupdate', () => setCurrentTime(audio.currentTime))
    audio.addEventListener('loadedmetadata', () => setDuration(audio.duration))
    audio.addEventListener('ended', () => {
      setIsPlaying(false)
      setCurrentTime(0)
    })

    // Connect analyzer on first user interaction (required by browsers)
    const handleFirstPlay = () => {
      connectAnalyzer()
      audio.removeEventListener('play', handleFirstPlay)
    }
    audio.addEventListener('play', handleFirstPlay)

    return () => {
      audio.pause()
      audio.src = ''
      if (sourceRef.current) {
        try { sourceRef.current.disconnect() } catch (e) {}
      }
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
    }
  }, [setAudioRef, setCurrentTime, setDuration, setIsPlaying, connectAnalyzer])

  // Track changes - load the new track
  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !track) return

    if (currentTrackRef.current !== currentTrack) {
      currentTrackRef.current = currentTrack
      audio.src = track.audioUrl
      audio.load()
      setCurrentTime(0)

      // If we should be playing, set up canplay handler
      const shouldPlay = useStore.getState().isPlaying
      if (shouldPlay) {
        const onCanPlay = () => {
          audio.removeEventListener('canplay', onCanPlay)
          resumeAudioContext()
          audio.play().catch(() => {})
        }
        audio.addEventListener('canplay', onCanPlay)
      }
    }
  }, [currentTrack, track, setCurrentTime, resumeAudioContext])

  // Play/pause state changes
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    if (isPlaying) {
      resumeAudioContext()
      if (audio.readyState >= 2) {
        audio.play().catch(() => {})
      } else {
        const onCanPlay = () => {
          audio.removeEventListener('canplay', onCanPlay)
          if (useStore.getState().isPlaying) {
            audio.play().catch(() => {})
          }
        }
        audio.addEventListener('canplay', onCanPlay)
      }
    } else {
      audio.pause()
    }
  }, [isPlaying, resumeAudioContext])

  // Volume control (iOS-compatible via Web Audio API GainNode)
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    // Calculate target volume
    const targetVolume = isMuted ? 0 : isDimmed ? 0.5 : volume

    // Use GainNode if available (iOS-compatible), fallback to audio.volume
    if (gainNodeRef.current && audioContextRef.current) {
      // Use GainNode (Web Audio API) - works on all platforms including iOS
      gainNodeRef.current.gain.setValueAtTime(
        targetVolume,
        audioContextRef.current.currentTime
      )
    } else {
      // Fallback for initial setup before GainNode is connected
      audio.volume = targetVolume
    }
  }, [volume, isMuted, isDimmed])

  // Cycle visualizer on track change
  useEffect(() => {
    if (prevTrackRef.current !== null && prevTrackRef.current !== currentTrack) {
      cycleVisualizer()
    }
    prevTrackRef.current = currentTrack
  }, [currentTrack, cycleVisualizer])

  return null
}
