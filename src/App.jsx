import { Scene } from './components/Scene'
import { PlayerControls } from './components/PlayerControls'
import { AudioManager } from './components/AudioManager'

function App() {
  return (
    <div className="app">
      <div className="canvas-container">
        <Scene />
      </div>
      <PlayerControls />
      <AudioManager />
    </div>
  )
}

export default App
