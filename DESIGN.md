---
name: Non-Steam Adder
description: A native-feeling utility to seamlessly integrate non-Steam games into the Steam Library.
colors:
  primary: "#66c0f4"
  primary-hover: "#7ed1ff"
  neutral-bg: "#0d121a"
  neutral-surface: "#171a21"
  neutral-surface-light: "#212c3d"
  steam-blue: "#1a9fff"
  steam-border: "#2a475e"
  text-main: "#c7d5e0"
  text-muted: "#8f98a0"
typography:
  display:
    fontFamily: "Motiva Sans, Inter, system-ui, sans-serif"
    fontSize: "3rem"
    fontWeight: 900
    lineHeight: 1
    letterSpacing: "-0.05em"
  body:
    fontFamily: "Motiva Sans, Inter, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Motiva Sans, Inter, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 700
    letterSpacing: "0.1em"
rounded:
  sm: "4px"
  md: "8px"
  lg: "12px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "40px"
components:
  button-primary:
    backgroundColor: "#66c0f4"
    textColor: "#1b2838"
    rounded: "{rounded.sm}"
    padding: "12px 24px"
  button-primary-hover:
    backgroundColor: "#7ed1ff"
  button-secondary:
    backgroundColor: "rgba(255,255,255,0.05)"
    textColor: "#ffffff"
    rounded: "{rounded.sm}"
    padding: "12px 24px"
---

# Design System: Non-Steam Adder

## 1. Overview

**Creative North Star: "The Steam Engine Extension"**

The Non-Steam Adder is designed to feel like an organic, "hidden" utility within the Steam ecosystem. It avoids the typical "app-like" polish of modern SaaS tools in favor of the functional, high-density, and slightly utilitarian aesthetic of the Steam Desktop Client. The goal is to minimize cognitive friction for users who are already deep in the Steam ecosystem.

**Key Characteristics:**
- **High Information Density:** No wasted space; focus on utility and visual data.
- **Deep Tonal Contrast:** Dark blue-grays paired with vibrant, high-contrast highlights.
- **Tactile Transitions:** Quick, responsive animations that provide immediate feedback without overstaying their welcome.
- **Steam-Native Details:** Use of radial gradients, subtle borders, and the specific "Motiva Sans" feel.

## 2. Colors

The palette is strictly restrained, using the classic Steam blue-gray spectrum.

### Primary
- **Steam Blue** (#66c0f4): Used for primary actions, focus states, and key highlights. It is the primary "signal" color.

### Neutral
- **Deep Void** (#0d121a): The primary background color, providing the deep canvas for the UI.
- **Panel Dark** (#171a21): Used for grouping elements and secondary surfaces.
- **Steel Gray** (#3d4450): Used for secondary buttons and less emphasized borders.
- **Text Main** (#c7d5e0): High-legibility text for primary content.
- **Text Muted** (#8f98a0): Used for descriptions, labels, and metadata.

### Named Rules
**The Rarity Rule.** The vibrant Steam Blue accent is used on ≤10% of any given screen. Its presence should always indicate a path forward or an active state.

## 3. Typography

**Display Font:** Motiva Sans (fallback: Inter, system-ui)
**Body Font:** Motiva Sans (fallback: Inter, system-ui)

**Character:** Bold and functional. Hierarchy is established through extreme weight contrast rather than complex size scales.

### Hierarchy
- **Display** (900, 3rem, 1): Used for page titles and major headings. Features tight tracking and often a subtle gradient.
- **Body** (400, 1rem, 1.5): Standard reading text.
- **Label** (700, 0.75rem, normal): Small caps or uppercase used for metadata, slot labels, and auxiliary information.

## 4. Elevation

The system uses tonal layering and radial gradients instead of traditional elevation shadows to create depth, mirroring the Steam client's "flat but deep" look.

### Shadow Vocabulary
- **Steam Glow** (`box-shadow: 0 0 15px rgba(102, 192, 244, 0.4)`): Used specifically for active or primary elements like the dropzone or primary CTA.

### Named Rules
**The Surface Layer Rule.** Depth is communicated through color shifts (Neutral Surface vs Neutral BG) rather than shadow intensity. Shadows are reserved for "glow" and status, not structural separation.

## 5. Components

### Buttons
- **Shape:** Sharp or slightly rounded (4px radius).
- **Primary:** Steam Blue background with Dark Blue text. High-contrast, high-utility.
- **Secondary:** Transparent background with a subtle border (#2a475e) or low-opacity white fill.

### Art Slots
- **Style:** A container for game artwork. Always features a dark background and a label overlay at the bottom.
- **Hover:** Subtle scale increase (1.01) and border color shift to Steam Blue.

### Modals
- **Style:** High-opacity black backdrop (85%) with a backdrop blur (sm).
- **Container:** Dark panel with a distinct top border and a shadow to lift it from the background.

## 6. Do's and Don'ts

### Do:
- **Do** use radial gradients on the background to create a sense of focus.
- **Do** use uppercase and wide tracking for labels and slot headers.
- **Do** prioritize the artwork aspect ratio—never crop or stretch cover art.

### Don't:
- **Don't** use standard "system" shadows; stick to the tonal layering.
- **Don't** use rounded corners greater than 12px; stay closer to the 4px-8px range to maintain the utilitarian feel.
- **Don't** add generic "SaaS" animations; keep transitions snappy and functional.
