import { Scene } from './components/Scene'
import { PlayerControls } from './components/PlayerControls'
import { AudioManager } from './components/AudioManager'
import { PosterInfo } from './components/PosterInfo'
import { VignetteOverlay } from './components/VignetteOverlay'

function App() {
  return (
    <div className="app">
      <div className="canvas-container">
        <Scene />
      </div>
      <VignetteOverlay />
      <PlayerControls />
      <PosterInfo />
      <AudioManager />
    </div>
  )
}

export default App
