import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { useTexture } from '@react-three/drei'
import { useStore } from '../store'
import * as THREE from 'three'

export function JewelCase({ track, index, position }) {
  const meshRef = useRef()
  const discRef = useRef()
  const glowRef = useRef()
  const caseFrontRef = useRef()
  const [hovered, setHovered] = useState(false)

  const viewMode = useStore((state) => state.viewMode)
  const isPlaying = useStore((state) => state.isPlaying)
  const currentTrack = useStore((state) => state.currentTrack)
  const cameraDistance = useStore((state) => state.cameraDistance)
  const setViewMode = useStore((state) => state.setViewMode)
  const setCurrentTrack = useStore((state) => state.setCurrentTrack)
  const setIsPlaying = useStore((state) => state.setIsPlaying)

  const coverTexture = useTexture(track.coverUrl)
  coverTexture.colorSpace = THREE.SRGBColorSpace

  const isFocused = viewMode === 'ALBUM' && currentTrack === index
  const isThisTrack = currentTrack === index
  const showGlow = viewMode === 'SHELF'

  const targetPosition = isFocused
    ? new THREE.Vector3(0, 0.5, 3)
    : new THREE.Vector3(...position)

  const targetRotation = isFocused
    ? new THREE.Euler(0, 0, 0)
    : new THREE.Euler(0, 0, 0)

  const targetScale = isFocused ? 2.5 : hovered ? 1.15 : 1

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.position.lerp(targetPosition, delta * 5)
      meshRef.current.scale.lerp(
        new THREE.Vector3(targetScale, targetScale, targetScale),
        delta * 8
      )

      if (hovered && !isFocused) {
        meshRef.current.position.z = THREE.MathUtils.lerp(
          meshRef.current.position.z,
          position[2] + 0.3,
          delta * 8
        )
      }
    }

    if (discRef.current && isPlaying && isThisTrack) {
      // Spin clockwise when viewed from front (negative Z rotation)
      discRef.current.rotation.z -= delta * 2
    }

    // Pulsing glow effect when in shelf mode
    if (glowRef.current && showGlow) {
      const time = state.clock.elapsedTime
      // Offset each album's pulse slightly for visual interest
      const pulse = 0.3 + Math.sin(time * 1.5 + index * 0.8) * 0.25
      glowRef.current.material.opacity = pulse
    }

    // Immersion mode: fade out case front when zoomed in while playing
    if (caseFrontRef.current && isFocused) {
      const immersionActive = cameraDistance <= 3 && isPlaying
      const targetOpacity = immersionActive ? 0 : 0.2
      caseFrontRef.current.material.opacity = THREE.MathUtils.lerp(
        caseFrontRef.current.material.opacity,
        targetOpacity,
        delta * 3
      )
    }
  })

  const handleClick = (e) => {
    e.stopPropagation()
    if (viewMode === 'SHELF') {
      // Select album from shelf view
      setCurrentTrack(index)
      setViewMode('ALBUM')
      // Auto-play when album is selected
      setTimeout(() => setIsPlaying(true), 100)
    } else if (viewMode === 'TV' || viewMode === 'POSTER') {
      // Return to shelf from TV or poster view (music keeps playing)
      setViewMode('SHELF')
    } else if (viewMode === 'ALBUM' && currentTrack !== index) {
      // Different album clicked while in album view - return to shelf first
      setViewMode('SHELF')
    }
  }

  return (
    <group
      ref={meshRef}
      position={position}
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
      {/* Case back */}
      <mesh position={[0, 0, -0.03]} castShadow>
        <boxGeometry args={[0.5, 0.55, 0.04]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>

      {/* Cover art - positioned against the back */}
      <mesh position={[0, 0, -0.005]}>
        <planeGeometry args={[0.45, 0.45]} />
        <meshStandardMaterial
          map={coverTexture}
          polygonOffset
          polygonOffsetFactor={-1}
          polygonOffsetUnits={-1}
        />
      </mesh>

      {/* Case front (transparent) */}
      <mesh ref={caseFrontRef} position={[0, 0, 0.04]} castShadow>
        <boxGeometry args={[0.5, 0.55, 0.02]} />
        <meshStandardMaterial
          color="#ffffff"
          transparent
          opacity={0.2}
          roughness={0.1}
          depthWrite={false}
        />
      </mesh>

      {/* Pulsing glow outline - visible only in shelf mode */}
      {showGlow && (
        <mesh ref={glowRef} position={[0, 0, 0.05]}>
          <planeGeometry args={[0.58, 0.63]} />
          <meshBasicMaterial
            color="#66aaff"
            transparent
            opacity={0.3}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      )}

      {/* CD Disc (visible only when focused in ALBUM view) - rotated to face viewer */}
      {isFocused && (
        <group position={[0.6, 0, 0]}>
          <group ref={discRef}>
            {/* Main disc body - rotated so flat face points toward viewer */}
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.22, 0.22, 0.01, 32]} />
              <meshStandardMaterial
                color="#c0c0c0"
                metalness={0.9}
                roughness={0.1}
              />
            </mesh>
            {/* Center hole */}
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.04, 0.04, 0.015, 16]} />
              <meshStandardMaterial color="#1a1a1a" />
            </mesh>
            {/* Label area - on the front face (facing viewer) */}
            <mesh position={[0, 0, 0.006]}>
              <ringGeometry args={[0.05, 0.18, 32]} />
              <meshStandardMaterial map={coverTexture} side={THREE.DoubleSide} />
            </mesh>
          </group>
        </group>
      )}

      {/* Spine */}
      <mesh position={[-0.26, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[0.08, 0.55]} />
        <meshStandardMaterial color="#2a2a2a" />
      </mesh>
    </group>
  )
}
