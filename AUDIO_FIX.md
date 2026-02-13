# iOS Audio Volume Fix

## Problem
Mute and dim buttons don't work on iOS because Safari restricts direct `audio.volume` manipulation after playback starts.

## Solution
Use Web Audio API GainNode for volume control (cross-platform compatible).

## Changes Required

### File: `src/components/AudioManager.jsx`

Replace the volume control effect (around line 167) with this:

```javascript
// Add gainNode ref at the top with other refs
const gainNodeRef = useRef(null)

// Update connectAnalyzer to include GainNode
const connectAnalyzer = useCallback(() => {
  const audio = audioRef.current
  if (!audio || isConnectedRef.current) return

  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext
    audioContextRef.current = new AudioContext()

    analyzerRef.current = audioContextRef.current.createAnalyser()
    analyzerRef.current.fftSize = 256
    analyzerRef.current.smoothingTimeConstant = 0.8

    // Create GainNode for volume control
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

// Replace the volume control effect with this:
useEffect(() => {
  const audio = audioRef.current
  if (!audio) return

  // Calculate target volume
  const targetVolume = isMuted ? 0 : isDimmed ? 0.5 : volume

  // Use GainNode if available (iOS-compatible), fallback to audio.volume
  if (gainNodeRef.current) {
    // Use gainNode (Web Audio API) - works on all platforms including iOS
    gainNodeRef.current.gain.setValueAtTime(
      targetVolume,
      audioContextRef.current.currentTime
    )
  } else {
    // Fallback for initial setup before GainNode is connected
    audio.volume = targetVolume
  }
}, [volume, isMuted, isDimmed])
```

## Why This Works

1. **Web Audio API GainNode**: iOS respects gain changes via Web Audio API
2. **Cross-platform**: Works on desktop, Android, and iOS
3. **Smooth transitions**: `setValueAtTime` provides clean volume changes
4. **Backward compatible**: Falls back to `audio.volume` if GainNode isn't ready yet

## Testing Steps

1. Build and deploy: `npm run build && docker compose up -d cd-player`
2. Test on iOS Safari (mute/dim buttons)
3. Test on Android Chrome
4. Test on Desktop browsers

## Additional iOS Improvements (Optional)

If users report other iOS issues, consider:
- Add visual feedback when buttons are tapped (iOS can feel unresponsive)
- Handle iOS silent mode switch (inform users to unmute device)
- Add "tap to unmute" overlay if audio fails to start
