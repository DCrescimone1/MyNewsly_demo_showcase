# MyNewsly — Act 1 Animation Script
### "From the World, To Your Dashboard"
**Format:** 1280×720px · 16s loop · Dark theme

---

## MODULES OVERVIEW

The animation is split into 4 independent modules.
Each module can be edited without touching the others.

```
MODULE A — Stage & Background    (always on, never changes)
MODULE B — Logo Grid             (how logos appear and behave)
MODULE C — Connection Animation  (the path from sources to dashboard)
MODULE D — Dashboard Population  (dashboard states and card waves)
```

---

## MODULE A — Stage & Background
**File:** `src/components/Stage.jsx`

- Full canvas: 1280×720px, background `#0A0A0F`
- A soft radial glow: `#9B30FF` at 8% opacity, centered left-third of canvas
- A second softer glow: `#2962FF` at 5% opacity, centered right-third of canvas
- Both glows are static. They never animate. They just set the mood.
- Grid dot pattern overlay (very subtle, 1px dots, 5% opacity white) — optional

---

## MODULE B — Logo Grid
**File:** `src/components/LogoGrid.jsx`
**Props:** `phase` (idle | active | sending | done)

### Layout
15 sources arranged in a **3-column x 5-row soft grid**,
positioned on the **LEFT half** of the canvas (x: 0 to 580px).
Each logo sits in a white pill/card: 90x60px, rounded-xl, subtle shadow.

### The 15 Sources (in grid order, top-left to bottom-right)
```
Row 1:  Gmail          Outlook         BBC
Row 2:  Reuters        NYT             TechCrunch
Row 3:  Wired          Reddit          National Geographic
Row 4:  Forbes         WSJ             YouTube (badge)
Row 5:  Bloomberg(b)   Wikipedia(b)    The Economist(b)
```
*(b) = styled text badge, no SVG*

**Badge colors:**
- YouTube:       bg #FF0000, white text, bold
- Bloomberg:     bg #000000, white text, medium
- Wikipedia:     bg #FFFFFF, border #A0A0A0, dark text
- The Economist: bg #E3120B, white text, bold

### Phase: `idle` (0s to 3s)
- All 15 logos are already placed in their grid positions
- They entrance as a group: each fades in + scales from 0.7 to 1
- Stagger: 0.07s per logo, reading order (top-left to bottom-right)
- Easing: spring (stiffness 200, damping 20)
- Duration of full entrance: ~2s

### Phase: `active` (3s to 5s)
- All logos gently pulse: scale 1 to 1.03 to 1, loop every 2s
- Each logo has a slightly different pulse offset (staggered phase)
- The grid feels "alive" and breathing
- Logo cards have a very faint gradient border glow (brand colors)

### Phase: `sending` (triggered per wave — see Module D)
When a source "sends" data to the dashboard:
- Its card briefly brightens (white flash, 0.15s)
- Scale pops to 1.15 then snaps back (0.3s)
- A small sparkle particle emits from the card center toward the path

**Wave 1 — Wired sends (t=5.5s):**  Wired card activates
**Wave 2 — Forbes + Reuters send (t=8.5s):** Both cards activate simultaneously
**Wave 3 — All remaining send (t=11.5s):** All 12 remaining cards in fast stagger (0.04s each)

### Phase: `done` (after wave 3)
- All cards settle back to gentle pulse
- Slightly dimmer than active phase (opacity 0.75)
- Signals: "all content delivered"

---

## MODULE C — Connection Animation
**File:** `src/components/ConnectionPath.jsx`
**Props:** `wave` (1 | 2 | 3), `onComplete` callback

This module is the **creative centrepiece**. It should feel techy, smart, and premium.

### The Path
A smooth bezier curve from the **right edge of the logo grid**
to the **left edge of the dashboard**.

```
Start point:  x=580, y=360  (center-right of logo grid)
Control 1:    x=720, y=200  (curves upward)
Control 2:    x=800, y=500  (swoops back down)
End point:    x=950, y=360  (center-left of dashboard)
```

The path is **not visible at rest** — it only draws when a wave fires.

### Visual Style
- Dashed stroke: dash 8px, gap 6px
- Stroke color: brand gradient #9B30FF to #2962FF via SVG linearGradient
- Stroke width: 2.5px
- The path draws itself using pathLength 0 to 1, duration 0.8s
- After drawing, it fades out over 0.4s (disappears before next wave)

### The Traveller (3 options — swap by changing one prop)

**Option C1 — Paper Airplane (recommended, default)**
- Small SVG paper airplane, white, 20x20px
- Travels along path using offsetDistance 0% to 100%
- Rotates to follow path tangent (offsetRotate: auto)
- Leaves a trail: 4 small dots that fade out behind it
- Duration: 1.2s, easing: easeInOut

**Option C2 — Data Packet (techy alternative)**
- Glowing square, 6x6px, brand gradient fill
- 2-3 ghost copies follow 0.1s behind
- More "data transfer" feel, less playful

**Option C3 — Pulse Wave (minimal, most premium)**
- No moving object
- Dashed path draws itself
- A gradient pulse sweeps along it after drawing (like a radar sweep)

### Per-Wave Behavior

**Wave 1 (t=5.5s):**
Single path fires. Stroke 2px. One traveller.
Arrives at dashboard → triggers state switch to wave1

**Wave 2 (t=8.5s):**
Path fires again. Stroke 2.5px. Traveller slightly faster.
Arrives → triggers state switch to wave2

**Wave 3 (t=11.5s):**
Stroke 3px. Traveller is larger, trail is longer.
Arrives → triggers state switch to wave3

---

## MODULE D — Dashboard Population
**File:** `src/components/Dashboard.jsx`
**Props:** `state` (empty | wave1 | wave2 | wave3)

### Layout
The dashboard occupies the **RIGHT half** of the canvas (x: 640 to 1280px).
It sits inside a **browser window mockup**:
- Rounded rectangle, dark border (#1E1E2E)
- Top bar: 3 dots (red/yellow/green, 10px) + fake URL bar
- Drop shadow: large, soft, #9B30FF at 15% opacity

### Dashboard Images (from /public/)
```
empty   →  empty_dashboard.webp
wave1   →  1_dashboard_wired.webp
wave2   →  3_dashboard_wired_forbes_reuters.webp
wave3   →  full_dashboard  (no extension — check actual file format)
```

### State Transitions

**State `empty` (0s to 6.3s):**
- Shows empty_dashboard.webp
- Slides in from right on first appearance: x +80px to 0, opacity 0 to 1
- Duration: 0.6s, spring easing

**State `wave1` (triggered at t=6.3s when traveller arrives):**
- Cross-fade from empty to 1_dashboard_wired.webp, duration 0.4s
- Simultaneously: a highlight ring pulses around the Wired card area
  (white glow, scale 1 to 1.4 to 1, opacity 1 to 0, 0.6s)
- The new card area pops: scale 0.8 to 1, spring

**State `wave2` (at t=9.3s):**
- Cross-fade to 3_dashboard_wired_forbes_reuters.webp, duration 0.4s
- Two highlight rings pulse (Forbes area + Reuters area)

**State `wave3` (at t=12.3s):**
- Cross-fade to full_dashboard image, duration 0.5s
- A gradient glow sweeps across the whole dashboard (left to right wipe)
- After 1.5s on full state — everything fades to black — loop resets

---

## FULL TIMELINE

```
t=0.0s   Stage visible, background glows present
t=0.2s   Logo grid begins stagger entrance (MODULE B idle)
t=2.2s   All logos fully visible
t=2.5s   Empty dashboard slides in from right (MODULE D)
t=3.0s   Logos enter active phase, gentle breathing pulse begins

t=5.5s   Wired card sends (flash + sparkle)
t=5.5s   Wave 1 path draws + traveller departs (MODULE C)
t=6.3s   Dashboard switches to wave1, highlight pulse on Wired card

t=8.5s   Forbes + Reuters cards send (flash + sparkle)
t=8.5s   Wave 2 path draws + traveller departs
t=9.3s   Dashboard switches to wave2, two highlight rings

t=11.5s  All remaining 12 logos send in cascade (stagger 0.04s)
t=11.5s  Wave 3 path draws + traveller departs (bigger)
t=12.3s  Dashboard switches to wave3, full glow sweep

t=14.0s  All modules fade to black (opacity 0, duration 1s)
t=15.0s  Reset all state — loop begins again from t=0
```

---

## MODULAR SWAP GUIDE

| Want to change | Edit only |
|---|---|
| Which logos appear and their order | LogoGrid.jsx — sources array |
| Logo entrance animation | LogoGrid.jsx — idle phase variants |
| Path shape and curve | ConnectionPath.jsx — SVG path d attribute |
| Traveller style (plane / packet / pulse) | ConnectionPath.jsx — traveller prop |
| Path color and dash style | ConnectionPath.jsx — stroke props |
| Which image shows per wave | Dashboard.jsx — state to image map |
| Card highlight effect on arrival | Dashboard.jsx — highlight ring animation |
| Background glow colors | Stage.jsx |
| All wave timings | App.jsx — timeline array |

---

## NOTES FOR CLAUDE CODE

- Import motion from "motion/react" (Motion Studio already installed)
- All timing driven by useEffect + useState(phase) in App.jsx
- No hardcoded pixel coordinates — use refs if interactive cursor added later
- Dashboard images served from /public/ → reference as /empty_dashboard.webp etc.
- Logo SVGs served from /public/logos/ → reference as /logos/bbc-2.svg etc.
- Brand colors: see mynewsly-brand-reference.md in project root
- Default traveller: Option C1 (Paper Airplane)
- Target: smooth 60fps. Use will-change: transform on all animated elements.
- Each module is a separate file. App.jsx only handles the timeline.
