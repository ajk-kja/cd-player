import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, useTexture } from '@react-three/drei'
import { Suspense, useRef, useMemo, useState, useEffect, useCallback } from 'react'
import { Shelf } from './Shelf'
import { useStore, tracks } from '../store'
import { useAudioAnalyzer } from './visualizers/useAudioAnalyzer'
import * as THREE from 'three'

function Lights() {
  return (
    <>
      {/* Ambient light - balanced with lamps */}
      <ambientLight intensity={0.6} />
      {/* Soft fill lights from multiple angles */}
      <directionalLight position={[5, 5, 5]} intensity={0.4} />
      <directionalLight position={[-5, 5, 5]} intensity={0.35} />
      <directionalLight position={[0, 5, -5]} intensity={0.25} />
      {/* Warm bounce light from below to simulate floor reflection */}
      <pointLight position={[0, -1, 0]} intensity={0.3} color="#aa8866" distance={12} decay={2} />
    </>
  )
}

function TableLamp({ position }) {
  const lightRef = useRef()
  const timeRef = useRef(Math.random() * 100)

  // Subtle flicker for warmth
  useFrame((state, delta) => {
    if (lightRef.current) {
      timeRef.current += delta
      const flicker = 0.95 + Math.sin(timeRef.current * 1.5) * 0.03 + Math.sin(timeRef.current * 3.7) * 0.02
      lightRef.current.intensity = flicker * 1.8
    }
  })

  return (
    <group position={position}>
      {/* Side table */}
      <mesh position={[0, -1.4, 0]}>
        <boxGeometry args={[0.6, 0.6, 0.6]} />
        <meshStandardMaterial color="#3a2a20" />
      </mesh>
      {/* Table top */}
      <mesh position={[0, -1.08, 0]}>
        <boxGeometry args={[0.65, 0.04, 0.65]} />
        <meshStandardMaterial color="#2a1a10" />
      </mesh>
      {/* Lamp base */}
      <mesh position={[0, -0.9, 0]}>
        <cylinderGeometry args={[0.12, 0.15, 0.15, 16]} />
        <meshStandardMaterial color="#886644" metalness={0.6} roughness={0.3} />
      </mesh>
      {/* Lamp stem */}
      <mesh position={[0, -0.5, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 0.7, 8]} />
        <meshStandardMaterial color="#aa8866" metalness={0.5} roughness={0.4} />
      </mesh>
      {/* Lamp shade - emissive */}
      <mesh position={[0, -0.1, 0]}>
        <cylinderGeometry args={[0.2, 0.28, 0.35, 16, 1, true]} />
        <meshStandardMaterial
          color="#f5e6d3"
          emissive="#ffddaa"
          emissiveIntensity={0.8}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* Light bulb glow inside */}
      <mesh position={[0, -0.1, 0]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial
          color="#ffffee"
          emissive="#ffeecc"
          emissiveIntensity={2}
        />
      </mesh>
      {/* Point light for indirect illumination */}
      <pointLight
        ref={lightRef}
        position={[0, 0.1, 0]}
        intensity={1.2}
        color="#ffddaa"
        distance={8}
        decay={2}
      />
    </group>
  )
}

function FloorLamp({ position }) {
  const lightRef = useRef()
  const timeRef = useRef(Math.random() * 100)

  // Subtle flicker
  useFrame((state, delta) => {
    if (lightRef.current) {
      timeRef.current += delta
      const flicker = 0.95 + Math.sin(timeRef.current * 1.8) * 0.03 + Math.sin(timeRef.current * 4.1) * 0.02
      lightRef.current.intensity = flicker * 2.0
    }
  })

  return (
    <group position={position}>
      {/* Lamp base */}
      <mesh position={[0, -1.85, 0]}>
        <cylinderGeometry args={[0.25, 0.3, 0.1, 16]} />
        <meshStandardMaterial color="#222222" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* Lamp pole */}
      <mesh position={[0, -0.2, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 3.2, 8]} />
        <meshStandardMaterial color="#333333" metalness={0.6} roughness={0.4} />
      </mesh>
      {/* Lamp shade - emissive */}
      <mesh position={[0, 1.4, 0]}>
        <cylinderGeometry args={[0.15, 0.35, 0.5, 16, 1, true]} />
        <meshStandardMaterial
          color="#e8d8c8"
          emissive="#ffeedd"
          emissiveIntensity={0.7}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* Light bulb glow */}
      <mesh position={[0, 1.3, 0]}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial
          color="#ffffee"
          emissive="#ffeecc"
          emissiveIntensity={2}
        />
      </mesh>
      {/* Point light for indirect illumination - casts downward and outward */}
      <pointLight
        ref={lightRef}
        position={[0, 1.2, 0]}
        intensity={2.0}
        color="#ffeedd"
        distance={12}
        decay={2}
      />
      {/* Secondary fill light to simulate bounce */}
      <pointLight
        position={[0, 0, 0]}
        intensity={0.6}
        color="#ffddcc"
        distance={6}
        decay={2}
      />
    </group>
  )
}

function CRTScanlines() {
  const scanlineTexture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 4
    canvas.height = 64
    const ctx = canvas.getContext('2d')
    for (let i = 0; i < 64; i++) {
      ctx.fillStyle = i % 2 === 0 ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0)'
      ctx.fillRect(0, i, 4, 1)
    }
    const texture = new THREE.CanvasTexture(canvas)
    texture.wrapS = THREE.RepeatWrapping
    texture.wrapT = THREE.RepeatWrapping
    texture.repeat.set(1, 12)
    return texture
  }, [])

  return (
    <mesh position={[0, 0.05, 0.54]} raycast={() => null}>
      <planeGeometry args={[0.75, 0.75]} />
      <meshBasicMaterial map={scanlineTexture} transparent opacity={0.5} />
    </mesh>
  )
}

function TVScreenLight({ position }) {
  const lightRef = useRef()
  const timeRef = useRef(0)

  useFrame((state, delta) => {
    if (lightRef.current) {
      timeRef.current += delta
      // Smooth noise-based flicker using multiple sine waves
      const flicker = 0.85 +
        Math.sin(timeRef.current * 2.1) * 0.05 +
        Math.sin(timeRef.current * 5.3) * 0.03 +
        Math.sin(timeRef.current * 0.7) * 0.07
      lightRef.current.intensity = flicker * 0.6
    }
  })

  return (
    <pointLight
      ref={lightRef}
      position={position}
      intensity={0.6}
      color="#aaccff"
      distance={8}
      decay={2}
    />
  )
}

function Dresser({ position, onClick, onPointerOver, onPointerOut, glowing }) {
  const glowColor = glowing ? '#6a5540' : '#4a3528'
  const topColor = glowing ? '#5a4530' : '#3a2518'
  const drawerColor = glowing ? '#7a6550' : '#5a4538'
  const handleColor = glowing ? '#aabb88' : '#888866'

  return (
    <group
      position={position}
      onClick={onClick}
      onPointerOver={onPointerOver}
      onPointerOut={onPointerOut}
    >
      {/* Main body */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[1.8, 1.2, 0.8]} />
        <meshStandardMaterial
          color={glowColor}
          emissive={glowing ? '#332200' : '#000000'}
          emissiveIntensity={glowing ? 0.3 : 0}
        />
      </mesh>
      {/* Top surface */}
      <mesh position={[0, 0.62, 0]}>
        <boxGeometry args={[1.85, 0.04, 0.85]} />
        <meshStandardMaterial
          color={topColor}
          emissive={glowing ? '#221100' : '#000000'}
          emissiveIntensity={glowing ? 0.2 : 0}
        />
      </mesh>
      {/* Drawer fronts */}
      {[-0.3, 0.3].map((y, i) => (
        <mesh key={i} position={[0, y, 0.41]}>
          <boxGeometry args={[1.6, 0.45, 0.02]} />
          <meshStandardMaterial
            color={drawerColor}
            emissive={glowing ? '#443300' : '#000000'}
            emissiveIntensity={glowing ? 0.4 : 0}
          />
        </mesh>
      ))}
      {/* Drawer handles */}
      {[-0.3, 0.3].map((y, i) => (
        <mesh key={`handle-${i}`} position={[0, y, 0.45]}>
          <boxGeometry args={[0.3, 0.05, 0.05]} />
          <meshStandardMaterial
            color={handleColor}
            metalness={0.5}
            emissive={glowing ? '#445522' : '#000000'}
            emissiveIntensity={glowing ? 0.5 : 0}
          />
        </mesh>
      ))}
    </group>
  )
}

function TVStatic() {
  const staticRef = useRef()
  const canvasRef = useRef(document.createElement('canvas'))
  const textureRef = useRef()

  useMemo(() => {
    canvasRef.current.width = 64
    canvasRef.current.height = 64
    textureRef.current = new THREE.CanvasTexture(canvasRef.current)
  }, [])

  useFrame(() => {
    const ctx = canvasRef.current.getContext('2d')
    const imageData = ctx.createImageData(64, 64)
    for (let i = 0; i < imageData.data.length; i += 4) {
      const v = Math.random() * 255
      imageData.data[i] = v
      imageData.data[i + 1] = v
      imageData.data[i + 2] = v
      imageData.data[i + 3] = 255
    }
    ctx.putImageData(imageData, 0, 0)
    if (textureRef.current) {
      textureRef.current.needsUpdate = true
    }
  })

  return (
    <mesh position={[0, 0.05, 0.535]}>
      <planeGeometry args={[0.75, 0.75]} />
      <meshBasicMaterial map={textureRef.current} />
    </mesh>
  )
}

// Dino game constants
const DINO_CANVAS_SIZE = 256
const DINO_GROUND_Y = 200
const DINO_GRAVITY = 0.8
const DINO_JUMP_FORCE = -12
const DINO_GAME_SPEED_INITIAL = 4
const DINO_GAME_SPEED_INCREMENT = 0.001

function TVDynamicScreen({ coverUrl, screenRef }) {
  const viewMode = useStore((state) => state.viewMode)
  const isPlaying = useStore((state) => state.isPlaying)
  const visualizerType = useStore((state) => state.visualizerType)
  const dinoGameActive = useStore((state) => state.dinoGameActive)
  const setDinoGameScore = useStore((state) => state.setDinoGameScore)
  const dinoJumpTrigger = useStore((state) => state.dinoJumpTrigger)

  const { getFrequencyData, getWaveformData, isInitialized } = useAudioAnalyzer()
  const lastJumpTriggerRef = useRef(dinoJumpTrigger)

  const canvasRef = useRef(document.createElement('canvas'))
  const textureRef = useRef()
  const coverImageRef = useRef(null)
  const coverLoadedRef = useRef(false)
  const timeRef = useRef(0)

  // Dino game state
  const gameStateRef = useRef({
    dino: { x: 30, y: DINO_GROUND_Y - 25, width: 16, height: 25, velocityY: 0, isJumping: false },
    obstacles: [],
    score: 0,
    gameSpeed: DINO_GAME_SPEED_INITIAL,
    isRunning: true,
    lastObstacleTime: Date.now(),
  })

  // Jump function for dino game
  const jump = useCallback(() => {
    const state = gameStateRef.current
    if (!state.dino.isJumping && state.isRunning) {
      state.dino.velocityY = DINO_JUMP_FORCE
      state.dino.isJumping = true
    }
    // Restart game if it was game over
    if (!state.isRunning) {
      state.dino = { x: 30, y: DINO_GROUND_Y - 25, width: 16, height: 25, velocityY: 0, isJumping: false }
      state.obstacles = []
      state.score = 0
      state.gameSpeed = DINO_GAME_SPEED_INITIAL
      state.isRunning = true
      setDinoGameScore(0)
    }
  }, [setDinoGameScore])

  // Initialize canvas and texture
  useMemo(() => {
    canvasRef.current.width = DINO_CANVAS_SIZE
    canvasRef.current.height = DINO_CANVAS_SIZE
    textureRef.current = new THREE.CanvasTexture(canvasRef.current)
    textureRef.current.colorSpace = THREE.SRGBColorSpace
  }, [])

  // Load cover image when URL changes
  useEffect(() => {
    coverLoadedRef.current = false
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      coverImageRef.current = img
      coverLoadedRef.current = true
    }
    img.src = coverUrl
  }, [coverUrl])

  // Reset game state when dino game becomes active
  useEffect(() => {
    if (dinoGameActive) {
      const state = gameStateRef.current
      state.dino = { x: 30, y: DINO_GROUND_Y - 25, width: 16, height: 25, velocityY: 0, isJumping: false }
      state.obstacles = []
      state.score = 0
      state.gameSpeed = DINO_GAME_SPEED_INITIAL
      state.isRunning = true
      state.lastObstacleTime = Date.now()
      setDinoGameScore(0)
    }
  }, [dinoGameActive, setDinoGameScore])

  // Handle keyboard for dino game
  useEffect(() => {
    if (!dinoGameActive) return

    const handleKeyDown = (e) => {
      if (e.code === 'Space' || e.key === ' ') {
        e.preventDefault()
        jump()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [dinoGameActive, jump])

  // Handle jump triggers from clicks on TV
  useEffect(() => {
    if (dinoGameActive && dinoJumpTrigger !== lastJumpTriggerRef.current) {
      lastJumpTriggerRef.current = dinoJumpTrigger
      jump()
    }
  }, [dinoGameActive, dinoJumpTrigger, jump])

  // Draw functions
  const drawAlbumArt = (ctx) => {
    if (coverLoadedRef.current && coverImageRef.current) {
      ctx.drawImage(coverImageRef.current, 0, 0, DINO_CANVAS_SIZE, DINO_CANVAS_SIZE)
    } else {
      ctx.fillStyle = '#111'
      ctx.fillRect(0, 0, DINO_CANVAS_SIZE, DINO_CANVAS_SIZE)
    }
  }

  const drawFrequencyBars = (ctx) => {
    const frequencyData = getFrequencyData()
    const barCount = 24
    const barGap = 3
    const barWidth = (DINO_CANVAS_SIZE - (barCount - 1) * barGap) / barCount

    for (let i = 0; i < barCount; i++) {
      const dataIndex = Math.floor((i / barCount) * frequencyData.length)
      const value = frequencyData[dataIndex] || 0
      const barHeight = (value / 255) * DINO_CANVAS_SIZE * 0.8

      const x = i * (barWidth + barGap)
      const y = DINO_CANVAS_SIZE - barHeight

      ctx.fillStyle = '#00ff41'
      ctx.shadowColor = '#00ff41'
      ctx.shadowBlur = 8
      ctx.fillRect(x, y, barWidth, barHeight)
    }
    ctx.shadowBlur = 0
  }

  const drawWaveform = (ctx) => {
    const waveformData = getWaveformData()

    ctx.beginPath()
    ctx.strokeStyle = '#00ff41'
    ctx.lineWidth = 2
    ctx.shadowColor = '#00ff41'
    ctx.shadowBlur = 12

    const sliceWidth = DINO_CANVAS_SIZE / waveformData.length
    let x = 0

    for (let i = 0; i < waveformData.length; i++) {
      const v = waveformData[i] / 128.0
      const y = (v * DINO_CANVAS_SIZE) / 2

      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
      x += sliceWidth
    }

    ctx.stroke()
    ctx.shadowBlur = 0

    // Center line
    ctx.beginPath()
    ctx.strokeStyle = 'rgba(0, 255, 65, 0.2)'
    ctx.lineWidth = 1
    ctx.setLineDash([5, 5])
    ctx.moveTo(0, DINO_CANVAS_SIZE / 2)
    ctx.lineTo(DINO_CANVAS_SIZE, DINO_CANVAS_SIZE / 2)
    ctx.stroke()
    ctx.setLineDash([])
  }

  const drawPatterns = (ctx, time) => {
    const frequencyData = getFrequencyData()
    const centerX = DINO_CANVAS_SIZE / 2
    const centerY = DINO_CANVAS_SIZE / 2

    for (let i = 0; i < 12; i++) {
      const dataIndex = Math.floor((i / 12) * frequencyData.length)
      const value = frequencyData[dataIndex] || 0
      const radius = 20 + (value / 255) * 80
      const angle = (i / 12) * Math.PI * 2 + time

      const x = centerX + Math.cos(angle) * radius * 0.5
      const y = centerY + Math.sin(angle) * radius * 0.5

      ctx.beginPath()
      ctx.arc(x, y, radius * 0.15, 0, Math.PI * 2)
      ctx.fillStyle = '#00ff41'
      ctx.shadowColor = '#00ff41'
      ctx.shadowBlur = 10
      ctx.fill()
    }
    ctx.shadowBlur = 0
  }

  const drawVisualizer = (ctx, time) => {
    // Semi-transparent black background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.85)'
    ctx.fillRect(0, 0, DINO_CANVAS_SIZE, DINO_CANVAS_SIZE)

    // Dim album art in background
    if (coverLoadedRef.current && coverImageRef.current) {
      ctx.globalAlpha = 0.15
      ctx.filter = 'blur(4px)'
      ctx.drawImage(coverImageRef.current, 0, 0, DINO_CANVAS_SIZE, DINO_CANVAS_SIZE)
      ctx.filter = 'none'
      ctx.globalAlpha = 1.0
    }

    if (!isPlaying || !isInitialized) {
      // Show "PLAY TO VISUALIZE" message
      ctx.fillStyle = '#00ff41'
      ctx.font = '14px monospace'
      ctx.textAlign = 'center'
      ctx.shadowColor = '#00ff41'
      ctx.shadowBlur = 10
      const blink = Math.sin(time * 3) > 0
      if (blink) {
        ctx.fillText('PLAY TO VISUALIZE', DINO_CANVAS_SIZE / 2, DINO_CANVAS_SIZE / 2)
      }
      ctx.shadowBlur = 0
    } else {
      switch (visualizerType) {
        case 0:
          drawFrequencyBars(ctx)
          break
        case 1:
          drawWaveform(ctx)
          break
        case 2:
          drawPatterns(ctx, time)
          break
        case 3:
          // Shader-like effect using frequency data
          drawFrequencyBars(ctx)
          drawWaveform(ctx)
          break
        default:
          drawFrequencyBars(ctx)
      }
    }

    // Visualizer type label
    const labels = ['FREQUENCY', 'WAVEFORM', 'PATTERNS', 'SHADER']
    ctx.fillStyle = '#00ff41'
    ctx.font = '10px monospace'
    ctx.textAlign = 'center'
    ctx.shadowColor = '#00ff41'
    ctx.shadowBlur = 6
    ctx.fillText(labels[visualizerType], DINO_CANVAS_SIZE / 2, DINO_CANVAS_SIZE - 12)
    ctx.shadowBlur = 0
  }

  const drawDinoGame = (ctx) => {
    const state = gameStateRef.current

    // Clear canvas
    ctx.fillStyle = '#000'
    ctx.fillRect(0, 0, DINO_CANVAS_SIZE, DINO_CANVAS_SIZE)

    if (!state.isRunning) {
      // Game over screen
      ctx.fillStyle = '#00ff41'
      ctx.font = '18px monospace'
      ctx.textAlign = 'center'
      ctx.shadowColor = '#00ff41'
      ctx.shadowBlur = 10
      ctx.fillText('GAME OVER', DINO_CANVAS_SIZE / 2, DINO_CANVAS_SIZE / 2 - 15)
      ctx.font = '12px monospace'
      ctx.fillText(`SCORE: ${state.score}`, DINO_CANVAS_SIZE / 2, DINO_CANVAS_SIZE / 2 + 10)
      ctx.fillText('TAP TV TO RESTART', DINO_CANVAS_SIZE / 2, DINO_CANVAS_SIZE / 2 + 35)
      ctx.shadowBlur = 0
      return
    }

    // Update dino physics
    state.dino.velocityY += DINO_GRAVITY
    state.dino.y += state.dino.velocityY

    // Ground collision
    if (state.dino.y >= DINO_GROUND_Y - state.dino.height) {
      state.dino.y = DINO_GROUND_Y - state.dino.height
      state.dino.velocityY = 0
      state.dino.isJumping = false
    }

    // Spawn obstacles
    const now = Date.now()
    if (now - state.lastObstacleTime > 1500 + Math.random() * 1000) {
      const types = [{ w: 12, h: 20 }, { w: 16, h: 28 }, { w: 20, h: 16 }]
      const type = types[Math.floor(Math.random() * types.length)]
      state.obstacles.push({ x: DINO_CANVAS_SIZE + 10, y: DINO_GROUND_Y - type.h, width: type.w, height: type.h })
      state.lastObstacleTime = now
    }

    // Update obstacles and check collisions
    state.obstacles = state.obstacles.filter((obs) => {
      obs.x -= state.gameSpeed

      // Collision check
      if (
        state.dino.x < obs.x + obs.width &&
        state.dino.x + state.dino.width > obs.x &&
        state.dino.y < obs.y + obs.height &&
        state.dino.y + state.dino.height > obs.y
      ) {
        state.isRunning = false
      }

      return obs.x + obs.width > 0
    })

    // Update score and speed
    state.score++
    setDinoGameScore(state.score)
    state.gameSpeed += DINO_GAME_SPEED_INCREMENT

    // Draw ground line
    ctx.strokeStyle = '#00ff41'
    ctx.lineWidth = 2
    ctx.shadowColor = '#00ff41'
    ctx.shadowBlur = 8
    ctx.beginPath()
    ctx.moveTo(0, DINO_GROUND_Y)
    ctx.lineTo(DINO_CANVAS_SIZE, DINO_GROUND_Y)
    ctx.stroke()

    // Draw dino (triangle)
    ctx.fillStyle = '#00ff41'
    ctx.beginPath()
    ctx.moveTo(state.dino.x + state.dino.width / 2, state.dino.y)
    ctx.lineTo(state.dino.x, state.dino.y + state.dino.height)
    ctx.lineTo(state.dino.x + state.dino.width, state.dino.y + state.dino.height)
    ctx.closePath()
    ctx.fill()

    // Draw obstacles
    state.obstacles.forEach((obs) => {
      ctx.fillRect(obs.x, obs.y, obs.width, obs.height)
    })

    ctx.shadowBlur = 0

    // Draw score
    ctx.fillStyle = '#00ff41'
    ctx.font = '14px monospace'
    ctx.textAlign = 'right'
    ctx.fillText(`${state.score}`, DINO_CANVAS_SIZE - 10, 25)

    // Draw instructions at top
    ctx.font = '8px monospace'
    ctx.textAlign = 'center'
    ctx.fillText('SPACE/TAP TO JUMP', DINO_CANVAS_SIZE / 2, 15)
  }

  // Main render loop
  useFrame((state, delta) => {
    const ctx = canvasRef.current.getContext('2d')
    timeRef.current += delta

    if (dinoGameActive) {
      drawDinoGame(ctx)
    } else if (viewMode === 'TV') {
      drawVisualizer(ctx, timeRef.current)
    } else {
      drawAlbumArt(ctx)
    }

    // Update texture
    if (textureRef.current) {
      textureRef.current.needsUpdate = true
    }

    // Update emissive flicker
    if (screenRef?.current) {
      const flicker = 0.9 + Math.sin(timeRef.current * 2.1) * 0.05 + Math.sin(timeRef.current * 5.3) * 0.03
      screenRef.current.emissiveIntensity = flicker * 0.5
    }
  })

  // Handle click on TV screen for dino game
  const handleScreenClick = useCallback((e) => {
    if (dinoGameActive) {
      e.stopPropagation()
      jump()
    }
  }, [dinoGameActive, jump])

  return (
    <mesh position={[0, 0.05, 0.53]} ref={screenRef} onClick={handleScreenClick}>
      <planeGeometry args={[0.75, 0.75]} />
      <meshStandardMaterial
        map={textureRef.current}
        emissive="#ffffff"
        emissiveMap={textureRef.current}
        emissiveIntensity={0.5}
      />
    </mesh>
  )
}

function CRTTelevision() {
  const currentTrack = useStore((state) => state.currentTrack)
  const viewMode = useStore((state) => state.viewMode)
  const setViewMode = useStore((state) => state.setViewMode)
  const dinoGameActive = useStore((state) => state.dinoGameActive)
  const setDinoGameActive = useStore((state) => state.setDinoGameActive)
  const triggerDinoJump = useStore((state) => state.triggerDinoJump)
  const track = tracks[currentTrack] || tracks[0]
  const screenRef = useRef()
  const prevTrackRef = useRef(currentTrack)
  const [isChanging, setIsChanging] = useState(false)
  const [tvHovered, setTvHovered] = useState(false)

  const handleTVClick = (e) => {
    e.stopPropagation()
    if (viewMode === 'TV') {
      if (dinoGameActive) {
        // Jump when game is active
        triggerDinoJump()
      } else {
        // Start dino game when clicking TV in TV view
        setDinoGameActive(true)
      }
    } else {
      setViewMode('TV')
    }
  }

  const handleDresserClick = (e) => {
    e.stopPropagation()
    if (viewMode === 'TV') {
      // Close dino game if active and return to shelf
      setDinoGameActive(false)
      setViewMode('SHELF')
    }
  }

  // Detect track change and trigger channel change effect
  useEffect(() => {
    if (prevTrackRef.current !== currentTrack) {
      setIsChanging(true)
      const timer = setTimeout(() => setIsChanging(false), 300)
      prevTrackRef.current = currentTrack
      return () => clearTimeout(timer)
    }
  }, [currentTrack])

  return (
    <group position={[6, 0.3, -3.5]} rotation={[0, -0.5, 0]}>
      {/* Dresser underneath - separate click target to return to shelf */}
      <Dresser
        position={[0, -1.2, 0.3]}
        onClick={handleDresserClick}
        glowing={viewMode === 'TV'}
        onPointerOver={(e) => {
          e.stopPropagation()
          if (viewMode === 'TV') {
            document.body.style.cursor = 'pointer'
          }
        }}
        onPointerOut={(e) => {
          e.stopPropagation()
          document.body.style.cursor = 'auto'
        }}
      />

      {/* TV Body - separate click target */}
      <group
        onClick={handleTVClick}
        onPointerOver={(e) => {
          e.stopPropagation()
          setTvHovered(true)
          document.body.style.cursor = 'pointer'
        }}
        onPointerOut={(e) => {
          e.stopPropagation()
          setTvHovered(false)
          document.body.style.cursor = 'auto'
        }}
      >
        <mesh>
          <boxGeometry args={[1.2, 1, 1]} />
          <meshStandardMaterial color={tvHovered ? '#3a3a3a' : '#2a2a2a'} />
        </mesh>
        {/* Screen bezel */}
        <mesh position={[0, 0.05, 0.51]}>
          <boxGeometry args={[1, 0.8, 0.02]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
        {/* Dynamic TV screen - renders album art, visualizer, or dino game */}
        {!isChanging && (
          <TVDynamicScreen coverUrl={track.coverUrl} screenRef={screenRef} />
        )}
        {/* TV Static during channel change */}
        {isChanging && <TVStatic />}
        {/* CRT Scanlines overlay */}
        <CRTScanlines />
        {/* Screen curvature/glass effect - raycast={null} to not intercept clicks */}
        <mesh position={[0, 0.05, 0.545]} raycast={() => null}>
          <planeGeometry args={[0.78, 0.78]} />
          <meshBasicMaterial color="#aaddff" transparent opacity={0.06} />
        </mesh>
        {/* TV Stand feet */}
        <mesh position={[-0.35, -0.55, 0.2]}>
          <boxGeometry args={[0.15, 0.1, 0.4]} />
          <meshStandardMaterial color="#222222" />
        </mesh>
        <mesh position={[0.35, -0.55, 0.2]}>
          <boxGeometry args={[0.15, 0.1, 0.4]} />
          <meshStandardMaterial color="#222222" />
        </mesh>
        {/* Antenna */}
        <mesh position={[-0.3, 0.7, -0.2]} rotation={[0, 0, -0.3]}>
          <cylinderGeometry args={[0.02, 0.02, 0.6, 8]} />
          <meshStandardMaterial color="#444444" />
        </mesh>
        <mesh position={[0.3, 0.7, -0.2]} rotation={[0, 0, 0.3]}>
          <cylinderGeometry args={[0.02, 0.02, 0.6, 8]} />
          <meshStandardMaterial color="#444444" />
        </mesh>
      </group>

      {/* TV Screen light */}
      <TVScreenLight position={[0, 0.05, 1.5]} />
    </group>
  )
}

function PaperTexture({ size = 2.2 }) {
  const paperTexture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 128
    canvas.height = 128
    const ctx = canvas.getContext('2d')
    // Create paper grain noise
    for (let x = 0; x < 128; x++) {
      for (let y = 0; y < 128; y++) {
        const noise = Math.random() * 30
        ctx.fillStyle = `rgba(${200 + noise}, ${195 + noise}, ${180 + noise}, 0.15)`
        ctx.fillRect(x, y, 1, 1)
      }
    }
    const texture = new THREE.CanvasTexture(canvas)
    texture.wrapS = THREE.RepeatWrapping
    texture.wrapT = THREE.RepeatWrapping
    texture.repeat.set(4, 4)
    return texture
  }, [])

  return (
    <mesh position={[0, 0, 0.035]}>
      <planeGeometry args={[size, size]} />
      <meshBasicMaterial map={paperTexture} transparent opacity={0.35} />
    </mesh>
  )
}

function WallPoster() {
  const currentTrack = useStore((state) => state.currentTrack)
  const viewMode = useStore((state) => state.viewMode)
  const setViewMode = useStore((state) => state.setViewMode)
  const track = tracks[currentTrack] || tracks[0]
  const posterTexture = useTexture(track.coverUrl)
  posterTexture.colorSpace = THREE.SRGBColorSpace

  const posterRef = useRef()
  const prevTrackRef = useRef(currentTrack)
  const scrollOffset = useRef(0)
  const [isScrolling, setIsScrolling] = useState(false)
  const [hovered, setHovered] = useState(false)

  const handleClick = (e) => {
    e.stopPropagation()
    if (viewMode === 'POSTER') {
      setViewMode('SHELF')
    } else {
      setViewMode('POSTER')
    }
  }

  // Detect track change and trigger scroll effect
  useEffect(() => {
    if (prevTrackRef.current !== currentTrack) {
      setIsScrolling(true)
      scrollOffset.current = 2.5 // Start from below
      prevTrackRef.current = currentTrack
    }
  }, [currentTrack])

  useFrame((state, delta) => {
    if (posterRef.current && isScrolling) {
      // Scroll up into view
      scrollOffset.current = THREE.MathUtils.lerp(scrollOffset.current, 0, delta * 6)
      posterRef.current.position.y = scrollOffset.current

      // Stop scrolling when close enough
      if (Math.abs(scrollOffset.current) < 0.01) {
        scrollOffset.current = 0
        posterRef.current.position.y = 0
        setIsScrolling(false)
      }
    }
  })

  return (
    <group
      position={[-5.5, 1.8, -4.9]}
      onClick={handleClick}
      onPointerOver={(e) => {
        e.stopPropagation()
        setHovered(true)
        document.body.style.cursor = 'pointer'
      }}
      onPointerOut={(e) => {
        e.stopPropagation()
        setHovered(false)
        document.body.style.cursor = 'auto'
      }}
    >
      {/* Poster frame */}
      <mesh>
        <boxGeometry args={[2.5, 2.5, 0.05]} />
        <meshStandardMaterial color={hovered ? '#3a3230' : '#2a2220'} />
      </mesh>
      {/* Clipping group for scroll effect */}
      <group ref={posterRef}>
        {/* Poster image - 1:1 aspect ratio */}
        <mesh position={[0, 0, 0.03]}>
          <planeGeometry args={[2.2, 2.2]} />
          <meshBasicMaterial map={posterTexture} />
        </mesh>
        {/* Paper texture overlay */}
        <PaperTexture size={2.2} />
      </group>
    </group>
  )
}

function Room() {
  return (
    <group>
      {/* Floor - warm wood tone */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#5a4a40" />
      </mesh>
      {/* Back wall - warmer, lighter tone with subtle ambient glow */}
      <mesh position={[0, 3, -5]}>
        <planeGeometry args={[20, 10]} />
        <meshStandardMaterial
          color="#6a5a60"
          emissive="#2a2025"
          emissiveIntensity={0.15}
        />
      </mesh>
      {/* Left wall - slightly lighter with warm ambient */}
      <mesh position={[-10, 3, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[20, 10]} />
        <meshStandardMaterial
          color="#5a5560"
          emissive="#252028"
          emissiveIntensity={0.12}
        />
      </mesh>
      {/* Right wall - for lamp light bounce */}
      <mesh position={[10, 3, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[20, 10]} />
        <meshStandardMaterial
          color="#5a5560"
          emissive="#252028"
          emissiveIntensity={0.12}
        />
      </mesh>
    </group>
  )
}

// Camera target positions for each view mode
const CAMERA_TARGETS = {
  SHELF: new THREE.Vector3(0, 0, -4),
  ALBUM: new THREE.Vector3(0, 0.5, -1),
  TV: new THREE.Vector3(6, 0.3, -2), // Facing the TV
  POSTER: new THREE.Vector3(-5.5, 1.8, -3), // Facing the poster
}

const CAMERA_POSITIONS = {
  SHELF: new THREE.Vector3(0, 0, 4),
  ALBUM: new THREE.Vector3(0, 1.5, 4),
  TV: new THREE.Vector3(6, 0.3, 0.5), // Closer to TV
  POSTER: new THREE.Vector3(-5.5, 1.8, -1), // In front of poster
}

function CameraController() {
  const controlsRef = useRef()
  const viewMode = useStore((state) => state.viewMode)
  const setCameraDistance = useStore((state) => state.setCameraDistance)

  useFrame((state, delta) => {
    if (controlsRef.current) {
      const target = CAMERA_TARGETS[viewMode] || CAMERA_TARGETS.SHELF
      const camPos = CAMERA_POSITIONS[viewMode] || CAMERA_POSITIONS.SHELF

      controlsRef.current.target.lerp(target, delta * 5)

      // Move camera toward target position for TV and POSTER views
      if (viewMode === 'TV' || viewMode === 'POSTER') {
        state.camera.position.lerp(camPos, delta * 3)
      }

      controlsRef.current.update()

      // Track camera distance for UI fade
      const distance = state.camera.position.distanceTo(controlsRef.current.target)
      setCameraDistance(distance)
    }
  })

  return (
    <OrbitControls
      ref={controlsRef}
      enablePan={false}
      enableZoom={true}
      minDistance={2}
      maxDistance={10}
      minPolarAngle={Math.PI / 4}
      maxPolarAngle={Math.PI / 2}
    />
  )
}

export function Scene() {
  return (
    <Canvas
      shadows={false}
      camera={{
        position: [0, 0, 6],
        fov: 50,
      }}
      style={{ background: '#1a1a1f' }}
      gl={{ antialias: false }}
    >
      <Suspense fallback={null}>
        <Lights />
        <Room />
        <Shelf />
        <CRTTelevision />
        <WallPoster />
        {/* Practical lights for ambient warmth */}
        <TableLamp position={[-7, 0, -3.5]} />
        <FloorLamp position={[8, 0, -4]} />
        <CameraController />
      </Suspense>
    </Canvas>
  )
}
