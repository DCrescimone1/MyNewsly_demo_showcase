import { useState, useEffect, useRef } from 'react'
import { motion } from 'motion/react'
import './App.css'

import Stage from './components/Stage'
import LogoGrid from './components/LogoGrid'
import ConnectionPath from './components/ConnectionPath'
import Dashboard from './components/Dashboard'

// ─── Dashboard bounds (must match Dashboard.jsx) ───────────────────────────
// left:280  right:1000  top:157  contentTop:193  bottom:~564
// width:720

// ─── Logo edge centers (the point where the connection line starts) ─────────
// Left col  → right edge center  = (card_x+90, card_y+30)
// Right col → left edge center   = (card_x,    card_y+30)
// Top row   → bottom edge center = (card_x+45, card_y+60)
// Bottom row→ top edge center    = (card_x+45, card_y)

const LOGO_EDGES = {
  // Left column (card x=20)
  gmail:      { sx: 110,  sy: 110  },
  reuters:    { sx: 110,  sy: 245  },
  wired:      { sx: 110,  sy: 380  },
  forbes:     { sx: 110,  sy: 510  },
  // Top row (card y=20)
  bbc:        { sx: 240,  sy: 80   },
  techcrunch: { sx: 640,  sy: 80   },
  natgeo:     { sx: 1040, sy: 80   },
  // Right column (card x=1170)
  outlook:    { sx: 1170, sy: 110  },
  nyt:        { sx: 1170, sy: 245  },
  adobepdf:   { sx: 1170, sy: 380  },
  wsj:        { sx: 1170, sy: 510  },
}

// ─── Wave connection definitions ───────────────────────────────────────────
// ex/ey = arrival point on the dashboard edge, near where that article appears.
// The dashboard content spans y: 209→547 and x: 380→900.
//
// Content layout based on the actual screenshots:
//   - Breaking News section: ~y 220-270 (top of content)
//   - Business & Markets:    ~y 300-370
//   - Tech & Innovation:     ~y 370-450

function makeConnection(id, ex, ey, strokeWidth = 2, delay = 0) {
  const { sx, sy } = LOGO_EDGES[id]
  return { id, sx, sy, ex, ey, strokeWidth, delay }
}

// Dashboard edge reference (left:280, right:1000, contentTop:193, bottom:~564)

// Wave 1: Only Wired → left edge, Tech & Innovation area
const WAVE1 = [
  makeConnection('wired', 280, 290, 2, 0),
]

// Wave 2: Reuters (Breaking News, top) + Forbes (Business & Markets, middle)
const WAVE2 = [
  makeConnection('reuters', 280, 235, 2.5, 0),
  makeConnection('forbes',  280, 360, 2.5, 0.1),
]

// Wave 3: All → dashboard, 0.04s stagger
const WAVE3 = [
  // Left col → dashboard left edge (x=280)
  makeConnection('gmail',      280, 240, 3,   0.00),
  makeConnection('reuters',    280, 255, 3,   0.04),
  makeConnection('wired',      280, 305, 3,   0.08),
  makeConnection('forbes',     280, 370, 3,   0.12),
  // Top row → dashboard top edge (y=193)
  makeConnection('bbc',        450, 193, 3,   0.20),
  makeConnection('techcrunch', 630, 193, 3,   0.24),
  makeConnection('natgeo',     840, 193, 3,   0.28),
  // Right col → dashboard right edge (x=1000)
  makeConnection('outlook',    1000, 245, 3,   0.32),
  makeConnection('nyt',        1000, 265, 3,   0.36),
  makeConnection('adobepdf',   1000, 330, 3,   0.40),
  makeConnection('wsj',        1000, 400, 3,   0.44),
]

const WAVE_MAP = { 1: WAVE1, 2: WAVE2, 3: WAVE3 }

// All source IDs for wave 3 flash
const ALL_IDS = Object.keys(LOGO_EDGES)

export default function App() {
  const [logoPhase,    setLogoPhase]    = useState('idle')
  const [activeSources,setActiveSources]= useState([])
  const [activeWave,   setActiveWave]   = useState(null)   // null | 1 | 2 | 3
  const [dashState,    setDashState]    = useState('empty')
  const [showDash,     setShowDash]     = useState(false)
  const [masterOpacity,setMasterOpacity]= useState(1)
  const timers = useRef([])

  function after(ms, fn) {
    const id = setTimeout(fn, ms)
    timers.current.push(id)
  }

  function runTimeline() {
    timers.current.forEach(clearTimeout)
    timers.current = []

    setMasterOpacity(1)
    setLogoPhase('idle')
    setActiveSources([])
    setActiveWave(null)
    setDashState('empty')
    setShowDash(false)

    // t=1.0s  Dashboard slides in
    after(1000, () => setShowDash(true))

    // t=1.5s  Logos breathe
    after(1500, () => setLogoPhase('active'))

    // ── Wave 1: Wired ──────────────────────────────────────────────────
    after(1500, () => {
      setActiveSources(['wired'])
      setActiveWave(1)
    })
    after(2300, () => {
      setDashState('wave1')
      setActiveSources([])
    })
    // Clear wave so path fades; ConnectionPath handles its own exit via AnimatePresence
    after(3000, () => setActiveWave(null))

    // ── Wave 2: Reuters + Forbes ───────────────────────────────────────
    after(3500, () => {
      setActiveSources(['reuters', 'forbes'])
      setActiveWave(2)
    })
    after(4300, () => {
      setDashState('wave2')
      setActiveSources([])
    })
    after(5000, () => setActiveWave(null))

    // ── Wave 3: Everything ────────────────────────────────────────────
    after(5500, () => {
      setActiveSources(ALL_IDS)
      setActiveWave(3)
    })
    after(6300, () => {
      setDashState('wave3')
      setActiveSources([])
      setLogoPhase('done')
    })
    after(7200, () => setActiveWave(null))

    // ── Fade out + loop ───────────────────────────────────────────────
    after(8000, () => setMasterOpacity(0))
    after(9000, () => runTimeline())
  }

  useEffect(() => {
    runTimeline()
    return () => timers.current.forEach(clearTimeout)
  }, [])

  const connections = activeWave ? WAVE_MAP[activeWave] : []

  return (
    <div style={{
      width: '100vw', height: '100vh',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#0A0A0F',
    }}>
      <motion.div
        animate={{ opacity: masterOpacity }}
        transition={{ duration: 1, ease: 'easeInOut' }}
        style={{
          width: 1280, height: 720,
          position: 'relative', overflow: 'hidden',
          willChange: 'opacity',
        }}
      >
        <Stage />
        <LogoGrid phase={logoPhase} activeSources={activeSources} />
        {connections.length > 0 && (
          <ConnectionPath connections={connections} />
        )}
        {showDash && <Dashboard state={dashState} />}
      </motion.div>
    </div>
  )
}
