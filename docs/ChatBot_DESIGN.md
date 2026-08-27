---
name: Intellectual Noir
colors:
  surface: '#131313'
  surface-dim: '#131313'
  surface-bright: '#393939'
  surface-container-lowest: '#0e0e0e'
  surface-container-low: '#1c1b1b'
  surface-container: '#20201f'
  surface-container-high: '#2a2a2a'
  surface-container-highest: '#353535'
  on-surface: '#e5e2e1'
  on-surface-variant: '#dbc1b9'
  inverse-surface: '#e5e2e1'
  inverse-on-surface: '#313030'
  outline: '#a38c85'
  outline-variant: '#55433d'
  surface-tint: '#ffb59e'
  primary: '#ffb59e'
  on-primary: '#5c1902'
  primary-container: '#d97757'
  on-primary-container: '#541400'
  inverse-primary: '#99462a'
  secondary: '#c6c6c7'
  on-secondary: '#2f3131'
  secondary-container: '#454747'
  on-secondary-container: '#b4b5b5'
  tertiary: '#c9c6c2'
  on-tertiary: '#31302d'
  tertiary-container: '#93928e'
  on-tertiary-container: '#2b2b28'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffdbd0'
  primary-fixed-dim: '#ffb59e'
  on-primary-fixed: '#390b00'
  on-primary-fixed-variant: '#7a2f15'
  secondary-fixed: '#e2e2e2'
  secondary-fixed-dim: '#c6c6c7'
  on-secondary-fixed: '#1a1c1c'
  on-secondary-fixed-variant: '#454747'
  tertiary-fixed: '#e5e2dd'
  tertiary-fixed-dim: '#c9c6c2'
  on-tertiary-fixed: '#1c1c19'
  on-tertiary-fixed-variant: '#474743'
  background: '#131313'
  on-background: '#e5e2e1'
  surface-variant: '#353535'
typography:
  display-lg:
    fontFamily: Source Serif 4
    fontSize: 32px
    fontWeight: '500'
    lineHeight: 40px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Source Serif 4
    fontSize: 28px
    fontWeight: '500'
    lineHeight: 36px
  headline-md:
    fontFamily: Source Serif 4
    fontSize: 24px
    fontWeight: '500'
    lineHeight: 32px
  body-lg:
    fontFamily: Hanken Grotesk
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Hanken Grotesk
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Hanken Grotesk
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Hanken Grotesk
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
rounded:
  sm: 0.5rem
  DEFAULT: 1rem
  md: 1.5rem
  lg: 2rem
  xl: 3rem
  full: 9999px
spacing:
  margin-mobile: 1.25rem
  gutter-md: 1rem
  stack-sm: 0.5rem
  stack-md: 1rem
  stack-lg: 2rem
  inset-button: 0.75rem 1.5rem
  inset-input: 1rem
---

## Brand & Style

The design system embodies a sophisticated, editorial aesthetic that positions technology as a high-end tool for thought. It targets a professional, creative, and intellectual audience who values focus and depth over over-stimulation.

The visual style is a blend of **Minimalism** and **Modern Corporate**, utilizing a "dark mode first" philosophy. It avoids common tech tropes like neon glows or heavy gradients in favor of a muted, "ink-on-paper" feel translated to a digital interface. The emotional response is one of calm, reliability, and academic rigor. Key characteristics include generous negative space, high-contrast serif typography for voice, and tactile, pill-shaped UI elements that provide a sense of approachability and modern ergonomics.

## Colors

This design system uses a deeply desaturated, warm-toned dark palette. The primary interaction color is a muted coral/burnt orange, used sparingly for brand markers and active indicators.

- **Backgrounds:** Use the deep charcoal (#1a1a1a) for main content areas and the darker obsidian (#141414) for navigation sidebars to create subtle depth.
- **Typography:** Avoid pure white. Use cream/off-white for high-contrast headings and a medium-light gray for body text to reduce eye strain.
- **Buttons:** Primary actions use high-contrast white backgrounds with dark text. Secondary inputs and containers use a lifted gray (#262626) to distinguish them from the canvas.

## Typography

The system utilizes a dual-font strategy: **Source Serif 4** provides an authoritative, literary voice for headings and greetings, while **Hanken Grotesk** offers a clean, neutral, and highly legible experience for functional body text and interface labels.

- **Headings:** Use tighter letter-spacing and medium weights to maintain a compact, editorial look.
- **Body:** Use generous line-heights (1.5x+) to ensure long-form text remains readable and comfortable during deep work sessions.
- **Links/Actions:** Maintain the sans-serif family for all interactive functional labels to distinguish them from content.

## Layout & Spacing

The layout philosophy follows a **Fluid Grid** model with high horizontal density and generous vertical rhythm. 

- **Mobile Constraints:** Maintain a consistent 20px (1.25rem) margin on the left and right edges of the device. 
- **Vertical Rhythm:** Content blocks should be separated by increments of 8px. Use larger gaps (32px+) to separate major sections, such as the logo area from the main interaction zone.
- **Alignment:** Center-align landing and onboarding states to emphasize the "quiet" nature of the product. Left-align functional chat and list interfaces for better scanning and utility.

## Elevation & Depth

Hierarchy is established through **Tonal Layering** rather than shadows. 

1. **Level 0 (Canvas):** The base background (#1a1a1a).
2. **Level 1 (Sidebar/Bottom Bar):** A darker shade (#141414) used to ground the navigation and primary input areas.
3. **Level 2 (Inputs/Chips):** A lighter shade (#262626) used for interactive fields and secondary buttons, creating a "lifted" effect.
4. **Outlines:** Use low-opacity borders (1px, white @ 10%) for secondary buttons and input fields to define boundaries without adding visual weight. Avoid heavy drop shadows entirely.

## Shapes

The design system uses a **Pill-shaped** language for primary interactive elements and high-radius rounding for containers.

- **Primary Buttons & Inputs:** Always use fully rounded (pill) ends to evoke a friendly, modern, and ergonomic feel.
- **Chat Bubbles & Containers:** Use a minimum radius of 16px (rounded-lg) to ensure the interface feels soft and approachable.
- **Avatars:** Use circular masks or high-radius squares for user and AI identity markers.

## Components

- **Buttons:**
  - *Primary:* White background, dark text, pill-shaped. High emphasis.
  - *Secondary:* Transparent with a subtle gray border or #262626 background.
- **Input Fields:** Darker than the canvas (#262626), pill-shaped, with placeholder text in `text_muted`. Ensure generous internal padding.
- **Chips:** Small, pill-shaped containers used for model switching or tagging. Use a dark background with small `label-sm` text.
- **Sidebar:** Vertical list items with 16px horizontal padding. Use minimalist, thin-stroke icons (1.5px stroke weight) aligned left.
- **Chat Interface:** Bottom-anchored input bar that spans the width (minus margins). Floating action buttons (like microphone or "new chat") should follow the circular/pill shape language.
- **Lists:** Clean rows with 1px subtle dividers or simple vertical spacing. High-contrast titles with muted metadata.