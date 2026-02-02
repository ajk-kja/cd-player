import { useStore } from '../store'

export function VignetteOverlay() {
  const cameraDistance = useStore((state) => state.cameraDistance)
  const isPlaying = useStore((state) => state.isPlaying)
  const viewMode = useStore((state) => state.viewMode)

  // Only show vignette in ALBUM view when zoomed in and playing
  const shouldShow = viewMode === 'ALBUM' && cameraDistance <= 3 && isPlaying

  // Calculate opacity based on camera distance
  // Distance 3 = start fading in, distance 2 = full opacity
  const opacity = shouldShow ? Math.max(0, Math.min(1, (3 - cameraDistance) / 1)) : 0

  return (
    <div
      className="vignette-overlay"
      style={{
        opacity,
        pointerEvents: 'none',
      }}
    />
  )
}
