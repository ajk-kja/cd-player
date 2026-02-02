import { useRef, useEffect } from 'react'

export function Waveform({ getWaveformData, width, height }) {
  const canvasRef = useRef(null)
  const animationRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')

    const draw = () => {
      const waveformData = getWaveformData()

      // Clear canvas with slight fade for trail effect
      ctx.fillStyle = 'rgba(0, 0, 0, 0.15)'
      ctx.fillRect(0, 0, width, height)

      // Draw oscilloscope line
      ctx.beginPath()
      ctx.strokeStyle = '#00ff41'
      ctx.lineWidth = 2
      ctx.shadowColor = '#00ff41'
      ctx.shadowBlur = 15

      const sliceWidth = width / waveformData.length
      let x = 0

      for (let i = 0; i < waveformData.length; i++) {
        const v = waveformData[i] / 128.0
        const y = (v * height) / 2

        if (i === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }

        x += sliceWidth
      }

      ctx.stroke()
      ctx.shadowBlur = 0

      // Draw center line (reference)
      ctx.beginPath()
      ctx.strokeStyle = 'rgba(0, 255, 65, 0.2)'
      ctx.lineWidth = 1
      ctx.setLineDash([5, 5])
      ctx.moveTo(0, height / 2)
      ctx.lineTo(width, height / 2)
      ctx.stroke()
      ctx.setLineDash([])

      animationRef.current = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [getWaveformData, width, height])

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      style={{ display: 'block' }}
    />
  )
}
