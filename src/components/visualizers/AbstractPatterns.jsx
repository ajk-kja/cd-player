import { useRef, useEffect } from 'react'

export function AbstractPatterns({ getFrequencyData, width, height }) {
  const canvasRef = useRef(null)
  const animationRef = useRef(null)
  const timeRef = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    const centerX = width / 2
    const centerY = height / 2

    const draw = () => {
      const frequencyData = getFrequencyData()
      timeRef.current += 0.02

      // Fade background
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)'
      ctx.fillRect(0, 0, width, height)

      // Calculate average bass and treble
      let bass = 0
      let treble = 0
      const midPoint = Math.floor(frequencyData.length / 2)

      for (let i = 0; i < midPoint; i++) {
        bass += frequencyData[i]
      }
      for (let i = midPoint; i < frequencyData.length; i++) {
        treble += frequencyData[i]
      }

      bass = bass / midPoint / 255
      treble = treble / midPoint / 255

      // Draw geometric patterns
      const numShapes = 6
      const baseRadius = Math.min(width, height) * 0.3

      ctx.shadowColor = '#00ff41'
      ctx.shadowBlur = 20

      for (let i = 0; i < numShapes; i++) {
        const angle = (i / numShapes) * Math.PI * 2 + timeRef.current
        const freqIndex = Math.floor((i / numShapes) * frequencyData.length)
        const amplitude = frequencyData[freqIndex] / 255

        const radius = baseRadius * (0.3 + amplitude * 0.7)
        const x = centerX + Math.cos(angle) * radius * 0.3
        const y = centerY + Math.sin(angle) * radius * 0.3

        // Draw rotating shapes
        ctx.save()
        ctx.translate(x, y)
        ctx.rotate(timeRef.current * (i % 2 ? 1 : -1))

        const shapeSize = 20 + amplitude * 40
        const alpha = 0.3 + amplitude * 0.5

        ctx.strokeStyle = `rgba(0, 255, 65, ${alpha})`
        ctx.lineWidth = 2

        // Alternate between different shapes
        if (i % 3 === 0) {
          // Triangle
          ctx.beginPath()
          ctx.moveTo(0, -shapeSize)
          ctx.lineTo(-shapeSize * 0.866, shapeSize * 0.5)
          ctx.lineTo(shapeSize * 0.866, shapeSize * 0.5)
          ctx.closePath()
          ctx.stroke()
        } else if (i % 3 === 1) {
          // Square
          ctx.strokeRect(-shapeSize / 2, -shapeSize / 2, shapeSize, shapeSize)
        } else {
          // Circle
          ctx.beginPath()
          ctx.arc(0, 0, shapeSize / 2, 0, Math.PI * 2)
          ctx.stroke()
        }

        ctx.restore()
      }

      // Draw central pulsing ring
      const pulseRadius = baseRadius * 0.4 * (0.8 + bass * 0.5)
      ctx.beginPath()
      ctx.arc(centerX, centerY, pulseRadius, 0, Math.PI * 2)
      ctx.strokeStyle = `rgba(0, 255, 65, ${0.5 + treble * 0.5})`
      ctx.lineWidth = 3
      ctx.stroke()

      ctx.shadowBlur = 0

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
