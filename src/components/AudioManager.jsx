import { useEffect, useRef } from 'react'
import { useStore, tracks } from '../store'

export function AudioManager() {
  const audioRef = useRef(null)

  const isPlaying = useStore((state) => state.isPlaying)
  const currentTrack = useStore((state) => state.currentTrack)
  const volume = useStore((state) => state.volume)
  const setCurrentTime = useStore((state) => state.setCurrentTime)
  const setDuration = useStore((state) => state.setDuration)
  const setIsPlaying = useStore((state) => state.setIsPlaying)

  const track = tracks[currentTrack]

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio()
    }

    const audio = audioRef.current

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime)
    }

    const handleLoadedMetadata = () => {
      setDuration(audio.duration)
    }

    const handleEnded = () => {
      setIsPlaying(false)
      setCurrentTime(0)
    }

    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('loadedmetadata', handleLoadedMetadata)
    audio.addEventListener('ended', handleEnded)

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
      audio.removeEventListener('ended', handleEnded)
    }
  }, [setCurrentTime, setDuration, setIsPlaying])

  useEffect(() => {
    if (audioRef.current && track) {
      audioRef.current.src = track.audioUrl
      audioRef.current.load()
      setCurrentTime(0)
    }
  }, [track, setCurrentTime])

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume
    }
  }, [volume])

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch((err) => {
          console.error('Playback failed:', err)
          setIsPlaying(false)
        })
      } else {
        audioRef.current.pause()
      }
    }
  }, [isPlaying, setIsPlaying])

  return null
}
