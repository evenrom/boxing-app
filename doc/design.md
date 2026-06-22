# Design System Specification - Fighter Styles HUD Update

## 1. Brand Aesthetic & Core Philosophy
- **Aesthetic Profile**: Tactical Glassmorphic HUD.
- **Visual Environment**: Engineered for instant visual telemetry interpretation inside low-light athletic training environments.
- **Core Mechanics**: Employs deep void fields, frosted translucent instrument layers, and high-visibility state-driven structural illumination blooms.

## 2. Visual Token Registries
```yaml
canvas:
  background-void: '#0b0b0b'             # Pure canvas contrast backdrop layer
  surface-glass-fill: 'rgba(20, 20, 20, 0.65)' # Translucent structural pane core
  glass-border-spec: '1px solid rgba(255, 255, 255, 0.08)' # Mechanical edge mapping track

accents:
  work-cyan: '#0099ff'                  # Work state timeline indicator & bloom glow
  work-bloom-rgba: 'rgba(0, 153, 255, 0.3)'
  rest-green: '#00ff99'                 # Recovery state breathing ambient indicator
  rest-bloom-rgba: 'rgba(0, 255, 153, 0.2)'
  alert-crimson: '#ff4444'              # Final 10-second round clock warning signal

shades:
  on-surface-high: '#e5e2e1'            # Primary crisp indicator values
  on-surface-variant: '#bfc7d5'         # Lower priority metadata strings
  border-interactive-high: 'rgba(255, 255, 255, 0.2)'
3. Typographic Hierarchy Regulations
Numeric Timers & Tactical Striking Indicators
Font Family: Teko, sans-serif

Weight Settings: 600 (Compressed, Bold Metrics)

Letter Case Mapping: Absolute Enforced Uppercase

Jitter Mitigation Rule: System nodes rendering dynamic time values must declare font-variant-numeric: tabular-nums to enforce rigid monospaced width footprints.

Text Labels, Subtitles & Technical Translations
Font Family: Assistant, sans-serif

Sizing & Layout Rule: Enforce clear, flat styling constraints for combo definitions. Explicit description subtitles translating sequence metrics must sit directly beneath the primary numeric target boxes.

4. Architectural Geometry & Spatial Scaling
Structural Corner Contours
Dashboard Blocks & Panes: Fixed 0.5rem (8px) boundary curvature radius.

Interactive Action Components / Stepper Inputs: Precision geometric 0.25rem (4px) block profiles. Avoid pill configurations.

Layout Perimeter Controls
Border Safety Margins: Maintain standard 32px desktop container padding limits to eliminate hardware display bezel clip risks.

5. Split Layout Configuration (Active HUD Mode)
Geometry Profile: Absolute 50/50 horizontal split layout grid mapping the device screen. Content wrapping or structural line-breaks are strictly banned to prevent layout shifting.

Left Control Panel: Dedicated exclusively to tracking runtime data clocks. Isolates down-counter clocks and total session duration tracks.

Right Tactical Panel: Dedicated exclusively to detailing fighter configuration steps.

Top 66% Viewport Frame: High-visibility glass card rendering active combinations.

Lower 33% Viewport Frame: Secondary lower-opacity container tracking upcoming sequence changes.