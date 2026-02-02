import { useRef, useEffect } from 'react'

export function ShaderVisualizer({ getFrequencyData, width, height }) {
  const canvasRef = useRef(null)
  const animationRef = useRef(null)
  const timeRef = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')

    const draw = () => {
      const frequencyData = getFrequencyData()
      timeRef.current += 0.03

      // Calculate bass intensity for effect modulation
      let bassIntensity = 0
      for (let i = 0; i < 8; i++) {
        bassIntensity += frequencyData[i]
      }
      bassIntensity = bassIntensity / 8 / 255

      // Create shader-like effect with pixel manipulation
      const imageData = ctx.createImageData(width, height)
      const data = imageData.data

      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const i = (y * width + x) * 4

          // Normalize coordinates
          const ux = x / width
          const uy = y / height

          // Create plasma-like effect
          const cx = ux - 0.5
          const cy = uy - 0.5

          const dist = Math.sqrt(cx * cx + cy * cy)
          const angle = Math.atan2(cy, cx)

          // Audio-reactive parameters
          const freqIndex = Math.floor(Math.abs(angle) / Math.PI * frequencyData.length / 2)
          const freqValue = frequencyData[freqIndex] / 255

          // Shader-like calculations
          const v1 = Math.sin(dist * 10 - timeRef.current * 2 + freqValue * 5)
          const v2 = Math.sin(angle * 4 + timeRef.current + bassIntensity * 3)
          const v3 = Math.sin((ux + uy) * 5 + timeRef.current * 1.5)

          const value = (v1 + v2 + v3) / 3

          // Phosphor green color with variations
          const intensity = (value + 1) / 2 * (0.3 + freqValue * 0.7)
          const green = Math.floor(255 * intensity)
          const red = Math.floor(green * 0.1)
          const blue = Math.floor(green * 0.2)

          data[i] = red
          data[i + 1] = green
          data[i + 2] = blue
          data[i + 3] = 255
        }
      }

      ctx.putImageData(imageData, 0, 0)

      animationRef.current = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [getFrequencyData, width, height])

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      style={{ display: 'block' }}
    />
  )
}
