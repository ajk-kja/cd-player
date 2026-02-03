# CD Player

A 3D vinyl/CD visualizer built with React 19 and Three.js. Features an interactive vinyl player with album art, track visualization, and realistic 3D rendering.

## Tech Stack

- **React 19** - UI framework
- **Three.js** + React Three Fiber - 3D rendering
- **Zustand** - State management
- **Vite** - Build tool
- **Nginx** - Production server

## Quick Start (Docker)

```bash
# Build and run
docker compose up -d

# Access at http://localhost:3000
```

## Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build
```

## Project Structure

```
cd_player/
├── src/                  # React source code
├── public/               # Static assets
│   └── assets/
│       ├── tracks/       # Audio files and album art
│       └── textures/     # 3D textures
├── dist/                 # Production build output
├── Dockerfile            # Container definition
├── nginx.conf            # Nginx configuration
└── docker-compose.yml    # Standalone deployment
```

## Adding Tracks

Place audio files (.wav, .mp3) and corresponding album art (.png, .jpg) in `public/assets/tracks/`. The app automatically detects and displays available tracks.

## License

MIT
