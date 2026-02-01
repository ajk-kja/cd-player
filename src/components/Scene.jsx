import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, useTexture } from '@react-three/drei'
import { Suspense, useRef, useMemo, useState, useEffect } from 'react'
import { Shelf } from './Shelf'
import { useStore, tracks } from '../store'
import * as THREE from 'three'

function Lights() {
  return (
    <>
      {/* Bright diffuse ambient light */}
      <ambientLight intensity={0.8} />
      {/* Soft fill lights from multiple angles */}
      <directionalLight position={[5, 5, 5]} intensity={0.5} />
      <directionalLight position={[-5, 5, 5]} intensity={0.4} />
      <directionalLight position={[0, 5, -5]} intensity={0.3} />
      {/* Subtle warm accent */}
      <pointLight position={[-4, 2, 2]} intensity={0.3} color="#ffcc88" />
    </>
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
    <mesh position={[0, 0.05, 0.54]}>
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

function Dresser({ position }) {
  return (
    <group position={position}>
      {/* Main body */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[1.8, 1.2, 0.8]} />
        <meshStandardMaterial color="#4a3528" />
      </mesh>
      {/* Top surface */}
      <mesh position={[0, 0.62, 0]}>
        <boxGeometry args={[1.85, 0.04, 0.85]} />
        <meshStandardMaterial color="#3a2518" />
      </mesh>
      {/* Drawer fronts */}
      {[-0.3, 0.3].map((y, i) => (
        <mesh key={i} position={[0, y, 0.41]}>
          <boxGeometry args={[1.6, 0.45, 0.02]} />
          <meshStandardMaterial color="#5a4538" />
        </mesh>
      ))}
      {/* Drawer handles */}
      {[-0.3, 0.3].map((y, i) => (
        <mesh key={`handle-${i}`} position={[0, y, 0.45]}>
          <boxGeometry args={[0.3, 0.05, 0.05]} />
          <meshStandardMaterial color="#888866" metalness={0.5} />
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

function CRTTelevision() {
  const currentTrack = useStore((state) => state.currentTrack)
  const track = tracks[currentTrack] || tracks[0]
  const screenTexture = useTexture(track.coverUrl)
  screenTexture.colorSpace = THREE.SRGBColorSpace
  const screenRef = useRef()
  const timeRef = useRef(0)
  const prevTrackRef = useRef(currentTrack)
  const [isChanging, setIsChanging] = useState(false)

  // Detect track change and trigger channel change effect
  useEffect(() => {
    if (prevTrackRef.current !== currentTrack) {
      setIsChanging(true)
      const timer = setTimeout(() => setIsChanging(false), 300)
      prevTrackRef.current = currentTrack
      return () => clearTimeout(timer)
    }
  }, [currentTrack])

  useFrame((state, delta) => {
    if (screenRef.current && !isChanging) {
      timeRef.current += delta
      // Gentle emissive flicker
      const flicker = 0.9 +
        Math.sin(timeRef.current * 2.1) * 0.05 +
        Math.sin(timeRef.current * 5.3) * 0.03
      screenRef.current.emissiveIntensity = flicker * 0.4
    }
  })

  return (
    <group position={[5.5, 0.3, -3]} rotation={[0, -0.5, 0]}>
      {/* Dresser underneath */}
      <Dresser position={[0, -1.2, 0.3]} />

      {/* TV Body */}
      <mesh>
        <boxGeometry args={[1.2, 1, 1]} />
        <meshStandardMaterial color="#2a2a2a" />
      </mesh>
      {/* Screen bezel */}
      <mesh position={[0, 0.05, 0.51]}>
        <boxGeometry args={[1, 0.8, 0.02]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      {/* Screen displaying album art - emissive */}
      {!isChanging && (
        <mesh position={[0, 0.05, 0.53]} ref={screenRef}>
          <planeGeometry args={[0.75, 0.75]} />
          <meshStandardMaterial
            map={screenTexture}
            emissive="#ffffff"
            emissiveMap={screenTexture}
            emissiveIntensity={0.4}
          />
        </mesh>
      )}
      {/* TV Static during channel change */}
      {isChanging && <TVStatic />}
      {/* CRT Scanlines overlay */}
      <CRTScanlines />
      {/* Screen curvature/glass effect */}
      <mesh position={[0, 0.05, 0.545]}>
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
  const track = tracks[currentTrack] || tracks[0]
  const posterTexture = useTexture(track.coverUrl)
  posterTexture.colorSpace = THREE.SRGBColorSpace

  const posterRef = useRef()
  const prevTrackRef = useRef(currentTrack)
  const scrollOffset = useRef(0)
  const [isScrolling, setIsScrolling] = useState(false)

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
    <group position={[-4.5, 1.8, -4.9]}>
      {/* Poster frame */}
      <mesh>
        <boxGeometry args={[2.5, 2.5, 0.05]} />
        <meshStandardMaterial color="#2a2220" />
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
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#3a2f2a" />
      </mesh>
      {/* Back wall */}
      <mesh position={[0, 3, -5]}>
        <planeGeometry args={[20, 10]} />
        <meshStandardMaterial color="#2a2530" />
      </mesh>
      {/* Left wall */}
      <mesh position={[-10, 3, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[20, 10]} />
        <meshStandardMaterial color="#252530" />
      </mesh>
    </group>
  )
}

function CameraController() {
  const controlsRef = useRef()
  const viewMode = useStore((state) => state.viewMode)
  const setCameraDistance = useStore((state) => state.setCameraDistance)

  // Album focus position (where the album animates to)
  const focusTarget = useMemo(() => new THREE.Vector3(0, 0.5, 3), [])
  const shelfTarget = useMemo(() => new THREE.Vector3(0, 0, 0), [])

  useFrame((state, delta) => {
    if (controlsRef.current) {
      const target = viewMode === 'FOCUS' ? focusTarget : shelfTarget
      controlsRef.current.target.lerp(target, delta * 5)
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
        <CameraController />
      </Suspense>
    </Canvas>
  )
}
