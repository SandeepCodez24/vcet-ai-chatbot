# VCET Bot — UI Analysis
> Framework: **React + Vite** | Design System: **Intellectual Noir**

---

## Design System Tokens

### Colors
```css
/* Backgrounds */
--surface:                #131313;   /* main canvas */
--surface-container-low:  #1c1b1b;   /* sidebar */
--surface-container:      #20201f;   /* cards */
--surface-container-high: #2a2a2a;   /* inputs/chips */
--surface-bright:         #393939;   /* elevated elements */

/* Text */
--on-surface:             #e5e2e1;   /* primary text (cream) */
--on-surface-variant:     #dbc1b9;   /* secondary text */

/* Brand */
--primary:                #ffb59e;   /* coral/burnt orange — CTAs, brand accent */
--primary-container:      #d97757;   /* deeper coral */
--on-primary:             #5c1902;   /* text on primary buttons */

/* Outlines */
--outline:                #a38c85;
--outline-variant:        #55433d;
```

### Typography
```css
/* Font 1: Headings / Brand voice */
--font-serif: 'Source Serif 4', serif;

/* Font 2: UI / Body / Labels */
--font-sans: 'Hanken Grotesk', sans-serif;

/* Scale */
--display-lg:   32px / 40px  weight:500  tracking:-0.02em  (Source Serif 4)
--headline-md:  24px / 32px  weight:500                    (Source Serif 4)
--body-lg:      18px / 28px  weight:400                    (Hanken Grotesk)
--body-md:      16px / 24px  weight:400                    (Hanken Grotesk)
--label-md:     14px / 20px  weight:500  tracking:+0.01em  (Hanken Grotesk)
--label-sm:     12px / 16px  weight:400                    (Hanken Grotesk)
```

### Border Radius
```css
--radius-sm:   0.5rem   (8px)   /* small chips */
--radius-md:   1.5rem   (24px)  /* cards, containers */
--radius-lg:   2rem     (32px)  /* large containers */
--radius-full: 9999px           /* pill buttons, inputs */
```

### Spacing
```css
--margin-mobile:  1.25rem  (20px)  /* left/right page padding */
--stack-sm:       0.5rem   (8px)
--stack-md:       1rem     (16px)
--stack-lg:       2rem     (32px)
--inset-button:   0.75rem 1.5rem  (12px 24px)
--inset-input:    1rem     (16px)
```

---

## Screens Identified (4 Mobile Frames — 390px wide)

All screens are **mobile-only** designs (390×837–884px). No desktop designs were found.

---

## Screen 1 — Sign In / Auth Page
**Frame:** `Html → Body` | **Size:** 390×837

### Layout
- Black background `#131313`
- **Centered single-column** layout
- Logo area at top center
- Headline below logo
- Form inputs stacked vertically
- CTA button below form
- "or" divider + "Sign Up" link below CTA
- Terms text at very bottom

### Elements
| Element | Description |
|---|---|
| **Logo** | `✦ VCET` — asterisk/snowflake icon + "VCET" in serif font, top center |
| **Headline** | `"The AI for VCET Students"` — Source Serif 4, large, centered |
| **Email Input** | Pill-shaped, dark bg `#2a2a2a`, placeholder text "Enter your email" |
| **Password Input** | Pill-shaped, dark bg, "Enter your password" |
| **Confirm Password** | Pill-shaped, "Confirm password" |
| **Remember me** | Small checkbox + label-sm text |
| **Sign In Button** | Pill-shaped, `#d97757` coral/orange fill, "Sign In" in dark text — PRIMARY CTA |
| **"or" divider** | Small centered text |
| **Sign Up link** | "don't have account? **Sign Up**" — Sign Up is linked in coral color |
| **Terms text** | Very small label-sm, muted color, bottom of screen |

### Key Design Notes
- Inputs are **fully rounded (pill)** with `#2a2a2a` background
- Primary button uses the coral `#d97757` color (NOT white as per spec — brand color CTA)
- No visual dividers between inputs — just vertical spacing
- Very minimal, editorial feel

---

## Screen 2 — Welcome / Greeting Screen (New Chat State)
**Frame:** `Html → Body` | **Size:** 390×884

### Layout
- Black background `#131313`
- **Top bar** with hamburger menu icon (left) and settings/edit icon (right)
- **Center area**: Large centered asterisk/snowflake logo + greeting text
- **Bottom bar**: Chat input field + send button

### Elements
| Element | Description |
|---|---|
| **Top bar** | Minimal — hamburger ≡ (left), ellipsis or edit icon (right) |
| **Logo (center)** | Large `✦` coral asterisk icon, decorative, centered vertically |
| **Greeting** | `"Evening, Sandeep"` — Source Serif 4, headline-md, centered |
| **Bottom input** | `"Chat with Flyer"` placeholder — dark pill-shaped input, full width minus margins |
| **Send button** | White circular button with `▶` arrow icon, attached right of input |

### Key Design Notes
- The "AI assistant name" shown here is **"Flyer"** (internal AI name)
- Greeting is personalized with user's name
- No conversation history visible — this is the empty/new chat state
- Bottom input bar is **anchored to bottom** of screen

---

## Screen 3 — Chat History / Sidebar (Navigation Drawer Open)
**Frame:** `Html → Body` | **Size:** 390×884

### Layout
- A **slide-over drawer** from the left side overlays the screen
- Drawer header shows `"Flyer"` title with an `✕` close button
- Below header: `"+ New chat"` button (pill-shaped, outlined/ghost style, coral `+` icon)
- **Recents section** with list of past conversations
- User avatar + name at the very bottom of the drawer

### Elements
| Element | Description |
|---|---|
| **Drawer header** | "Flyer" title text (serif) + `✕` close button (right) |
| **New chat button** | Ghost/outline pill button with `⊕` coral icon, "New chat" label |
| **RECENTS label** | Small `label-sm` section header, muted text |
| **Chat list items** | Recent conversation titles listed vertically, plain text rows |
| **Chat items (visible)** | "ML-guided JIT profiling innovation implem...", "Greeting exchange", "Indian freelancing platform market research", "Greeting exchange", "Hackathon strategy and track selection" |
| **User row** | Bottom — circular avatar with user initial "S" + "Sandeep" text + settings ⚙️ icon (right) |

### Key Design Notes
- Drawer uses slightly lighter bg than canvas (`#1c1b1b`)
- Chat history items are plain text with truncation (ellipsis)
- No icons on list items — minimalist
- User profile row pinned to bottom of drawer

---

## Screen 4 — Active Chat / Conversation View
**Frame:** `Html → Body` | **Size:** 390×884

### Layout
- Black background
- **Top bar**: hamburger ≡ (left) + `▪▪▪` menu (right) + `Hi` label/chip (top right corner)
- **Chat area**: Shows a bot message with action icons below it
- **Bottom area**: Reply input + send button

### Elements
| Element | Description |
|---|---|
| **Top bar** | ≡ hamburger (left), `•••` more options (right), `Hi` pill chip (far right) |
| **Mode chip** | `"✦ Thought process"` — small pill chip above the message, coral icon |
| **Bot message** | `"Hi! What's on your mind?"` — Source Serif 4, large, left-aligned |
| **Action row** | Below message: `↵ ♡ 👍 ✎ ↺` — react, like, edit, regenerate icons |
| **Reply input** | `"Reply to Flyer..."` placeholder — dark pill input, bottom anchored |
| **Send button** | White circular `▶` send button |

### Key Design Notes
- Bot responses use **serif font** (Source Serif 4) for editorial feel
- Action icons below each message (share, like, thumbs up, edit, regenerate)
- Mode chip shows `"Thought process"` — suggests thinking/reasoning mode indicator
- `Hi` chip in top right may be the user's initial/avatar shortcut

---

## Component Inventory

### Shared Components (reused across screens)
| Component | Props |
|---|---|
| `PillInput` | placeholder, icon, value, onChange |
| `PillButton` | label, variant (primary/ghost), onClick |
| `SendButton` | onClick — white circle with ▶ icon |
| `TopBar` | leftIcon, rightIcon, title? |
| `BottomInputBar` | placeholder, onSend |
| `LogoMark` | size variant (sm/lg) — the ✦ asterisk |

### Screen-specific Components
| Component | Screen |
|---|---|
| `AuthForm` | Sign In |
| `GreetingHero` | Welcome screen |
| `SidebarDrawer` | Chat history |
| `ChatMessage` | Active chat |
| `MessageActions` | Active chat |
| `ChatListItem` | Sidebar |
| `ModeChip` | Active chat |

---

## React + Vite Project Structure (Recommended)
```
vcet-frontend/
├── src/
│   ├── assets/            ← fonts, logo SVG
│   ├── styles/
│   │   ├── tokens.css     ← all CSS custom properties
│   │   └── global.css     ← reset + base styles
│   ├── components/
│   │   ├── ui/            ← PillInput, PillButton, SendButton, LogoMark
│   │   ├── layout/        ← TopBar, BottomInputBar, SidebarDrawer
│   │   └── chat/          ← ChatMessage, MessageActions, ModeChip, ChatListItem
│   ├── pages/
│   │   ├── AuthPage.jsx   ← Screen 1
│   │   ├── WelcomePage.jsx ← Screen 2
│   │   └── ChatPage.jsx   ← Screens 3 & 4 combined
│   ├── App.jsx
│   └── main.jsx
├── index.html
├── vite.config.js
└── package.json
```
