import { useRef } from 'react'
import { useTexture } from '@react-three/drei'
import { JewelCase } from './JewelCase'
import { tracks } from '../store'

function ShelfBoard({ position }) {
  const woodTexture = useTexture('/assets/textures/wood_shelf_texture_1769752028700.png')

  return (
    <mesh position={position} castShadow={false} receiveShadow={false}>
      <boxGeometry args={[5, 0.12, 1]} />
      <meshStandardMaterial map={woodTexture} color="#8b6914" />
    </mesh>
  )
}

function ShelfSide({ position }) {
  const woodTexture = useTexture('/assets/textures/wood_shelf_texture_1769752028700.png')

  return (
    <mesh position={position} castShadow={false} receiveShadow={false}>
      <boxGeometry args={[0.12, 3.5, 1]} />
      <meshStandardMaterial map={woodTexture} color="#6b4c12" />
    </mesh>
  )
}

const shelfYPositions = [1.2, 0, -1.2]
const ALBUMS_PER_SHELF = 4

export function Shelf() {
  const groupRef = useRef()

  const getShelfAndPosition = (index) => {
    const shelfIndex = Math.floor(index / ALBUMS_PER_SHELF)
    const positionInShelf = index % ALBUMS_PER_SHELF
    const shelfY = shelfYPositions[shelfIndex] || shelfYPositions[0]
    const x = -1.1 + positionInShelf * 0.7
    return [x, shelfY + 0.45, 0.15]
  }

  return (
    <group ref={groupRef} position={[0, 0, -4]}>
      {/* Shelf boards */}
      {shelfYPositions.map((y, i) => (
        <ShelfBoard key={`shelf-${i}`} position={[0, y, 0]} />
      ))}

      {/* Side panels */}
      <ShelfSide position={[-2.5, 0, 0]} />
      <ShelfSide position={[2.5, 0, 0]} />

      {/* CD cases distributed across shelves - 4 per shelf */}
      {tracks.map((track, index) => (
        <JewelCase
          key={track.id}
          track={track}
          index={index}
          position={getShelfAndPosition(index)}
        />
      ))}
    </group>
  )
}
