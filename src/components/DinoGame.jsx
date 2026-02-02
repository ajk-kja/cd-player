import { useRef, useEffect, useCallback } from 'react'
import { useStore } from '../store'

const CANVAS_WIDTH = 300
const CANVAS_HEIGHT = 150
const GROUND_Y = 120
const GRAVITY = 0.8
const JUMP_FORCE = -12
const GAME_SPEED_INITIAL = 4
const GAME_SPEED_INCREMENT = 0.001

export function DinoGame() {
  const canvasRef = useRef(null)
  const dinoGameActive = useStore((state) => state.dinoGameActive)
  const setDinoGameActive = useStore((state) => state.setDinoGameActive)
  const dinoGameScore = useStore((state) => state.dinoGameScore)
  const setDinoGameScore = useStore((state) => state.setDinoGameScore)

  // Game state refs (to avoid re-renders during animation)
  const gameStateRef = useRef({
    dino: {
      x: 40,
      y: GROUND_Y - 30,
      width: 20,
      height: 30,
      velocityY: 0,
      isJumping: false,
    },
    obstacles: [],
    score: 0,
    gameSpeed: GAME_SPEED_INITIAL,
    isRunning: true,
  })

  const animationRef = useRef(null)

  const jump = useCallback(() => {
    const state = gameStateRef.current
    if (!state.dino.isJumping && state.isRunning) {
      state.dino.velocityY = JUMP_FORCE
      state.dino.isJumping = true
    }
    // Restart game if it was game over
    if (!state.isRunning) {
      state.dino = {
        x: 40,
        y: GROUND_Y - 30,
        width: 20,
        height: 30,
        velocityY: 0,
        isJumping: false,
      }
      state.obstacles = []
      state.score = 0
      state.gameSpeed = GAME_SPEED_INITIAL
      state.isRunning = true
      setDinoGameScore(0)
    }
  }, [setDinoGameScore])

  const closeGame = useCallback(() => {
    setDinoGameActive(false)
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
    }
  }, [setDinoGameActive])

  useEffect(() => {
    if (!dinoGameActive) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    const state = gameStateRef.current

    // Reset game state
    state.dino = {
      x: 40,
      y: GROUND_Y - 30,
      width: 20,
      height: 30,
      velocityY: 0,
      isJumping: false,
    }
    state.obstacles = []
    state.score = 0
    state.gameSpeed = GAME_SPEED_INITIAL
    state.isRunning = true
    setDinoGameScore(0)

    let lastObstacleTime = Date.now()
    const minObstacleInterval = 1500

    const spawnObstacle = () => {
      const obstacleTypes = [
        { width: 15, height: 25 }, // Small
        { width: 20, height: 35 }, // Medium
        { width: 25, height: 20 }, // Wide low
      ]
      const type = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)]
      state.obstacles.push({
        x: CANVAS_WIDTH + 10,
        y: GROUND_Y - type.height,
        width: type.width,
        height: type.height,
      })
    }

    const checkCollision = (dino, obstacle) => {
      return (
        dino.x < obstacle.x + obstacle.width &&
        dino.x + dino.width > obstacle.x &&
        dino.y < obstacle.y + obstacle.height &&
        dino.y + dino.height > obstacle.y
      )
    }

    const gameLoop = () => {
      if (!state.isRunning) {
        // Game over screen
        ctx.fillStyle = '#000'
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

        ctx.fillStyle = '#00ff41'
        ctx.font = '16px monospace'
        ctx.textAlign = 'center'
        ctx.fillText('GAME OVER', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 10)
        ctx.font = '12px monospace'
        ctx.fillText(`SCORE: ${state.score}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 10)
        ctx.fillText('TAP TO RESTART', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 30)

        animationRef.current = requestAnimationFrame(gameLoop)
        return
      }

      // Clear canvas
      ctx.fillStyle = '#000'
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

      // Update dino physics
      state.dino.velocityY += GRAVITY
      state.dino.y += state.dino.velocityY

      // Ground collision
      if (state.dino.y >= GROUND_Y - state.dino.height) {
        state.dino.y = GROUND_Y - state.dino.height
        state.dino.velocityY = 0
        state.dino.isJumping = false
      }

      // Spawn obstacles
      const now = Date.now()
      if (now - lastObstacleTime > minObstacleInterval + Math.random() * 1000) {
        spawnObstacle()
        lastObstacleTime = now
      }

      // Update obstacles
      state.obstacles = state.obstacles.filter((obstacle) => {
        obstacle.x -= state.gameSpeed

        // Check collision
        if (checkCollision(state.dino, obstacle)) {
          state.isRunning = false
        }

        return obstacle.x + obstacle.width > 0
      })

      // Update score and speed
      state.score++
      setDinoGameScore(state.score)
      state.gameSpeed += GAME_SPEED_INCREMENT

      // Draw ground line
      ctx.strokeStyle = '#00ff41'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(0, GROUND_Y)
      ctx.lineTo(CANVAS_WIDTH, GROUND_Y)
      ctx.stroke()

      // Draw dino (triangle character)
      ctx.fillStyle = '#00ff41'
      ctx.shadowColor = '#00ff41'
      ctx.shadowBlur = 10

      ctx.beginPath()
      ctx.moveTo(state.dino.x + state.dino.width / 2, state.dino.y)
      ctx.lineTo(state.dino.x, state.dino.y + state.dino.height)
      ctx.lineTo(state.dino.x + state.dino.width, state.dino.y + state.dino.height)
      ctx.closePath()
      ctx.fill()

      // Draw obstacles (rectangles)
      state.obstacles.forEach((obstacle) => {
        ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height)
      })

      ctx.shadowBlur = 0

      // Draw score
      ctx.fillStyle = '#00ff41'
      ctx.font = '14px monospace'
      ctx.textAlign = 'right'
      ctx.fillText(`${state.score}`, CANVAS_WIDTH - 10, 25)

      animationRef.current = requestAnimationFrame(gameLoop)
    }

    gameLoop()

    // Input handlers
    const handleKeyDown = (e) => {
      if (e.code === 'Space' || e.key === ' ') {
        e.preventDefault()
        jump()
      }
      if (e.code === 'Escape') {
        closeGame()
      }
    }

    const handleClick = () => {
      jump()
    }

    const handleTouch = (e) => {
      e.preventDefault()
      jump()
    }

    window.addEventListener('keydown', handleKeyDown)
    canvas.addEventListener('click', handleClick)
    canvas.addEventListener('touchstart', handleTouch)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      window.removeEventListener('keydown', handleKeyDown)
      canvas.removeEventListener('click', handleClick)
      canvas.removeEventListener('touchstart', handleTouch)
    }
  }, [dinoGameActive, jump, closeGame, setDinoGameScore])

  if (!dinoGameActive) {
    return null
  }

  return (
    <div className="dino-game-container">
      <div className="dino-game-header">
        <span className="dino-game-title">RUNNER</span>
        <button className="dino-game-close" onClick={closeGame}>
          X
        </button>
      </div>
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="dino-game-canvas"
      />
      <div className="dino-game-instructions">
        SPACE / TAP TO JUMP | ESC TO EXIT
      </div>
    </div>
  )
}
