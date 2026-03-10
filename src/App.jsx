import { useState, useEffect, useRef } from 'react'
import { motion } from 'motion/react'
import './App.css'

import Stage from './components/Stage'
import LogoGrid from './components/LogoGrid'
import ConnectionPath from './components/ConnectionPath'
import Dashboard from './components/Dashboard'
import AgentLogoColumn from './components/AgentLogoColumn'
import AgentBot from './components/AgentBot'
import AgentDashboard from './components/AgentDashboard'

// ─── Dashboard bounds (must match Dashboard.jsx) ───────────────────────────
// left:160  right:1120  top:145  contentTop:181
// width:960

// ─── Logo edge centers (the point where the connection line starts) ─────────
// Left col  → right edge center  = (card_x+90, card_y+30)
// Right col → left edge center   = (card_x,    card_y+30)
// Top row   → bottom edge center = (card_x+45, card_y+60)
// Bottom row→ top edge center    = (card_x+45, card_y)

const LOGO_EDGES = {
  // Left column (card x=20)
  guardian:   { sx: 110,  sy: 110  },
  reuters:    { sx: 110,  sy: 245  },
  wired:      { sx: 110,  sy: 380  },
  forbes:     { sx: 110,  sy: 510  },
  // Top row (card y=20)
  bbc:        { sx: 240,  sy: 80   },
  cnn:        { sx: 440,  sy: 80   },
  techcrunch: { sx: 590,  sy: 80   },
  vogue:      { sx: 740,  sy: 80   },
  natgeo:     { sx: 940,  sy: 80   },
  // Right column (card x=1170)
  economist:  { sx: 1170, sy: 110  },
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

// Dashboard edge reference (left:160, right:1120, contentTop:181)

// Wave 1: Only Wired → left edge, Tech & Innovation area
const WAVE1 = [
  makeConnection('wired', 160, 290, 2, 0),
]

// Wave 2: Reuters (Breaking News, top) + Forbes (Business & Markets, middle)
const WAVE2 = [
  makeConnection('reuters', 160, 235, 2.5, 0),
  makeConnection('forbes',  160, 360, 2.5, 0.1),
]

// Wave 3: All → dashboard, 0.04s stagger
const WAVE3 = [
  // Left col → dashboard left edge (x=160)
  makeConnection('guardian',   160, 240, 3,   0.00),
  makeConnection('reuters',    160, 255, 3,   0.04),
  makeConnection('wired',      160, 305, 3,   0.08),
  makeConnection('forbes',     160, 370, 3,   0.12),
  // Top row → dashboard top edge (y=181)
  makeConnection('bbc',        420, 181, 3,   0.20),
  makeConnection('cnn',        510, 181, 3,   0.24),
  makeConnection('techcrunch', 600, 181, 3,   0.28),
  makeConnection('vogue',      720, 181, 3,   0.32),
  makeConnection('natgeo',     840, 181, 3,   0.36),
  // Right col → dashboard right edge (x=1120)
  makeConnection('economist',  1120, 245, 3,   0.40),
  makeConnection('nyt',        1120, 265, 3,   0.44),
  makeConnection('adobepdf',   1120, 330, 3,   0.48),
  makeConnection('wsj',        1120, 400, 3,   0.52),
]

// ─── Agent connections ──────────────────────────────────────────────────────
// Robot: left=350, top=305, SVG 100×120
// Head rect: x=12 y=16 w=76 h=52 → head center SVG y=42 → canvas y=305+42=347
// Left face x = 350+12 = 362   Right face x = 350+88 = 438
// Slot y positions: [80,195,310,425,540]  card-center = y+30
const AGENT_WAVE_IN = [
  { id: 'slot0', sx: 110, sy: 110, ex: 362, ey: 347, strokeWidth: 2, delay: 0.00 },
  { id: 'slot1', sx: 110, sy: 225, ex: 362, ey: 347, strokeWidth: 2, delay: 0.08 },
  { id: 'slot2', sx: 110, sy: 340, ex: 362, ey: 347, strokeWidth: 2, delay: 0.16 },
  { id: 'slot3', sx: 110, sy: 455, ex: 362, ey: 347, strokeWidth: 2, delay: 0.24 },
  { id: 'slot4', sx: 110, sy: 570, ex: 362, ey: 347, strokeWidth: 2, delay: 0.32 },
]

// Robot right face (x=438, y=347) → dashboard row centers
// Dashboard: left=690, top=145, chrome=36, padding=12
// Row 0 center-y = 145+36+12+53 = 246
// Row 1 center-y = 246+53+10+53 = 362  (106px rows, 10px gap)
// Row 2 center-y = 362+53+10+53 = 478
const AGENT_WAVE_OUT = [
  { id: 'rss0', sx: 438, sy: 347, ex: 690, ey: 246, strokeWidth: 2, delay: 0.00 },
  { id: 'rss1', sx: 438, sy: 347, ex: 690, ey: 362, strokeWidth: 2, delay: 0.10 },
  { id: 'rss2', sx: 438, sy: 347, ex: 690, ey: 478, strokeWidth: 2, delay: 0.20 },
]

const WAVE_MAP = { 1: WAVE1, 2: WAVE2, 3: WAVE3, agentIn: AGENT_WAVE_IN, agentOut: AGENT_WAVE_OUT }

// All source IDs for wave 3 flash
const ALL_IDS = Object.keys(LOGO_EDGES)

// ─── Variant picker ────────────────────────────────────────────────────────
// Switch variants via URL query param:  ?v=full  |  ?v=wave3
// Default is 'full' when no param is present.
function getVariant() {
  return new URLSearchParams(window.location.search).get('v') || 'full'
}

export default function App() {
  const variant = getVariant()

  // ── Original variant state ──────────────────────────────────────────────
  const [logoPhase,    setLogoPhase]    = useState('idle')
  const [activeSources,setActiveSources]= useState([])
  const [activeWave,   setActiveWave]   = useState(null)
  const [dashState,    setDashState]    = useState('empty')
  const [showDash,     setShowDash]     = useState(false)
  const [masterOpacity,setMasterOpacity]= useState(1)
  const [flowMode,     setFlowMode]     = useState(false)

  // ── Agent variant state ─────────────────────────────────────────────────
  const [agentLogoPhase,   setAgentLogoPhase]   = useState('idle')
  const [agentLogoCycling, setAgentLogoCycling] = useState(false)
  const [agentBotState,    setAgentBotState]    = useState('hidden')
  const [agentConnections, setAgentConnections] = useState([])   // grows, never shrinks mid-cycle
  const [agentFlowMode,    setAgentFlowMode]    = useState(false)
  const [showAgentDash,    setShowAgentDash]    = useState(false)
  const [agentDashVisible, setAgentDashVisible] = useState(false) // rows animate in separately
  const [agentScrolling,   setAgentScrolling]   = useState(false)

  const timers = useRef([])

  function after(ms, fn) {
    const id = setTimeout(fn, ms)
    timers.current.push(id)
  }

  function reset() {
    timers.current.forEach(clearTimeout)
    timers.current = []
    setMasterOpacity(1)
    // Original state
    setLogoPhase('idle')
    setActiveSources([])
    setActiveWave(null)
    setDashState('empty')
    setShowDash(false)
    setFlowMode(false)
    // Agent state
    setAgentLogoPhase('idle')
    setAgentLogoCycling(false)
    setAgentBotState('hidden')
    setAgentConnections([])
    setShowAgentDash(false)
    setAgentDashVisible(false)
    setAgentScrolling(false)
  }

  // ── Variant: full (waves 1 → 2 → 3) ──────────────────────────────────────
  function runFull() {
    reset()

    after(1000, () => setShowDash(true))
    after(1500, () => setLogoPhase('active'))

    // Wave 1
    after(1500, () => { setActiveSources(['wired']); setActiveWave(1) })
    after(2300, () => { setDashState('wave1'); setActiveSources([]) })
    after(3000, () => setActiveWave(null))

    // Wave 2
    after(3500, () => { setActiveSources(['reuters', 'forbes']); setActiveWave(2) })
    after(4300, () => { setDashState('wave2'); setActiveSources([]) })
    after(5000, () => setActiveWave(null))

    // Wave 3
    after(5500, () => { setActiveSources(ALL_IDS); setActiveWave(3) })
    after(6300, () => { setDashState('wave3'); setActiveSources([]); setLogoPhase('done') })
    after(7200, () => setActiveWave(null))

    // Fade + loop
    after(8000, () => setMasterOpacity(0))
    after(9000, () => runFull())
  }

  // ── Variant: wave3 (dashboard + wave 3 only, shorter loop) ───────────────
  function runWave3() {
    reset()

    after(500,  () => setShowDash(true))
    after(1000, () => setLogoPhase('active'))

    // Wave 3 draw-in
    after(1000, () => { setActiveSources(ALL_IDS); setActiveWave(3) })
    after(1800, () => { setDashState('wave3'); setActiveSources([]); setLogoPhase('done') })

    // Lines stay — switch to flowing gradient animation (~200ms after draw completes)
    after(2000, () => setFlowMode(true))

    // Flow animation holds for 6 seconds (2000 + 6000 = 8000), then fade + loop
    after(8000, () => setMasterOpacity(0))
    after(9000, () => runWave3())
  }

  // ── Variant: agent (3-zone layout with AI agent in center) ───────────────
  // isLoop=false → first run: elements animate in from scratch
  // isLoop=true  → subsequent: robot + dashboard chrome already visible, just redraw
  function runAgent(isLoop = false) {
    timers.current.forEach(clearTimeout)
    timers.current = []
    setMasterOpacity(1)

    if (!isLoop) {
      // Full reset when entering this variant for the first time
      setLogoPhase('idle'); setActiveSources([]); setActiveWave(null)
      setDashState('empty'); setShowDash(false); setFlowMode(false)
      setAgentLogoPhase('idle')
      setAgentLogoCycling(false)
      setAgentBotState('hidden')
      setShowAgentDash(false)
    }

    // Always reset animation-only state (lines, flow, rows, tickers)
    setAgentConnections([])
    setAgentFlowMode(false)
    setAgentDashVisible(false)
    setAgentScrolling(false)

    if (!isLoop) {
      // First run: logos and robot animate in
      after(0,   () => { setAgentLogoPhase('active'); setAgentLogoCycling(true) })
      after(500, () => setAgentBotState('idle'))
    } else {
      // Loop: logos already cycling, robot already visible — just snap back to idle
      setAgentBotState('idle')
    }

    // Common timeline (same for first run and loop)
    after(1000, () => setAgentConnections(AGENT_WAVE_IN))
    after(1800, () => setAgentBotState('active'))
    // Flow animation starts after input lines finish drawing (~2200ms)
    after(2200, () => setAgentFlowMode(true))
    after(2500, () => {
      setShowAgentDash(true)
      setAgentConnections([...AGENT_WAVE_IN, ...AGENT_WAVE_OUT])
    })
    after(3300, () => setAgentDashVisible(true))
    after(3800, () => setAgentScrolling(true))
    after(8000, () => setMasterOpacity(0))
    after(9000, () => runAgent(true))
  }

  function runTimeline() {
    const v = getVariant()
    if (v === 'wave3') return runWave3()
    if (v === 'agent')  return runAgent(false)
    return runFull()
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
        {variant === 'agent' ? (
          <>
            <AgentLogoColumn phase={agentLogoPhase} cycling={agentLogoCycling} />
            {agentConnections.length > 0 && (
              <ConnectionPath connections={agentConnections} flowMode={agentFlowMode} />
            )}
            <AgentBot state={agentBotState} />
            {showAgentDash && (
              <AgentDashboard visible={agentDashVisible} scrolling={agentScrolling} />
            )}
          </>
        ) : (
          <>
            <LogoGrid phase={logoPhase} activeSources={activeSources} />
            {connections.length > 0 && (
              <ConnectionPath connections={connections} flowMode={flowMode} />
            )}
            {showDash && <Dashboard state={dashState} />}
          </>
        )}
      </motion.div>
    </div>
  )
}
