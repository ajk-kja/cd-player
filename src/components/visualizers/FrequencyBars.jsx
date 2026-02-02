import { useRef, useEffect } from 'react'

export function FrequencyBars({ getFrequencyData, width, height }) {
  const canvasRef = useRef(null)
  const animationRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    const barCount = 32
    const barGap = 2

    const draw = () => {
      const frequencyData = getFrequencyData()

      // Clear canvas
      ctx.fillStyle = 'rgba(0, 0, 0, 0.2)'
      ctx.fillRect(0, 0, width, height)

      // Calculate bar width
      const barWidth = (width - (barCount - 1) * barGap) / barCount

      // Draw bars
      for (let i = 0; i < barCount; i++) {
        // Sample frequency data
        const dataIndex = Math.floor((i / barCount) * frequencyData.length)
        const value = frequencyData[dataIndex] || 0
        const barHeight = (value / 255) * height * 0.9

        const x = i * (barWidth + barGap)
        const y = height - barHeight

        // Phosphor green gradient
        const gradient = ctx.createLinearGradient(x, height, x, y)
        gradient.addColorStop(0, '#00ff41')
        gradient.addColorStop(0.5, '#00dd35')
        gradient.addColorStop(1, '#00aa28')

        ctx.fillStyle = gradient
        ctx.fillRect(x, y, barWidth, barHeight)

        // Glow effect
        ctx.shadowColor = '#00ff41'
        ctx.shadowBlur = 10
        ctx.fillRect(x, y, barWidth, barHeight)
        ctx.shadowBlur = 0
      }

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
