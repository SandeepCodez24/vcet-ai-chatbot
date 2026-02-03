# VCET AI Chatbot - Codebase Structure

## 📁 Project Organization

This document describes the modular architecture and organization of the VCET AI Chatbot codebase.

## Directory Structure

```
VCET_V6/
├── static/
│   ├── css/
│   │   ├── base/              # Base styles (variables, reset, animations)
│   │   │   ├── variables.css  # CSS custom properties & design tokens
│   │   │   ├── reset.css      # Modern CSS reset & base styles
│   │   │   └── animations.css # Reusable keyframe animations
│   │   ├── components/        # Reusable UI components
│   │   │   ├── buttons.css    # Button variants & styles
│   │   │   ├── forms.css      # Form inputs & validation
│   │   │   ├── chat.css       # Chat messages & welcome screen
│   │   │   └── modal.css      # Modals & popup overlays
│   │   ├── layouts/           # Page layout styles
│   │   │   ├── header.css     # Header navigation
│   │   │   ├── sidebar.css    # Sidebar panel
│   │   │   └── main.css       # Main content area
│   │   ├── index.css          # Main CSS entry point (imports all modules)
│   │   ├── style.css          # Legacy styles (deprecated)
│   │   ├── loading.css        # Loading overlay & progress
│   │   ├── settings.css       # Settings modal
│   │   ├── notifications.css  # Toast notifications & banners
│   │   └── mobile.css         # Mobile-specific enhancements
│   │
│   └── js/
│       ├── services/          # Business logic & API communication
│       │   ├── api.js         # Centralized API service
│       │   └── storage.js     # LocalStorage management
│       ├── utils/             # Utility functions & helpers
│       │   ├── helpers.js     # DOM utilities & common functions
│       │   └── gestures.js    # Touch gesture controllers
│       └── main.js            # Main application entry point
│
├── templates/
│   └── index.html             # Flask template (main page)
│
├── scripts/
│   └── build-public.js        # Build script for static deployment
│
├── netlify/
│   └── functions/             # Serverless functions (TODO)
│       ├── query.js
│       ├── health.js
│       ├── stats.js
│       └── suggestions.js
│
├── .eslintrc.js               # ESLint configuration
├── .prettierrc                # Prettier configuration
├── .prettierignore            # Prettier ignore patterns
├── package.json               # NPM dependencies & scripts
├── netlify.toml               # Netlify deployment config
└── server.py                  # Flask development server
```

## CSS Architecture

### Modular CSS Strategy

The CSS is organized using a **modular architecture** with clear separation of concerns:

#### 1. **Base Layer** (`css/base/`)
Foundation styles that everything else builds upon:
- **variables.css**: CSS custom properties (colors, spacing, typography, etc.)
- **reset.css**: Modern CSS reset and base element styles
- **animations.css**: Reusable keyframe animations

#### 2. **Layout Layer** (`css/layouts/`)
Structural page layouts:
- **header.css**: Top navigation bar
- **sidebar.css**: Side panel with actions
- **main.css**: Main content container & chat area

#### 3. **Component Layer** (`css/components/`)
Reusable UI components:
- **buttons.css**: All button variants (primary, ghost, icon, etc.)
- **forms.css**: Inputs, textareas, validation states
- **chat.css**: Message bubbles, typing indicator, suggestions
- **modal.css**: Modal dialogs and popups

#### 4. **Feature Layer** (root `css/`)
Feature-specific styles:
- **loading.css**: Loading overlay with progress indicators
- **settings.css**: Settings modal & API key management
- **notifications.css**: Toast notifications & rate limit banners
- **mobile.css**: Mobile-specific responsive enhancements

### Import Order

The `index.css` file imports all modules in the correct cascade order:

```css
/* 1. Base (variables first!) */
@import 'base/variables.css';
@import 'base/reset.css';
@import 'base/animations.css';

/* 2. Layouts */
@import 'layouts/header.css';
@import 'layouts/sidebar.css';
@import 'layouts/main.css';

/* 3. Components */
@import 'components/buttons.css';
@import 'components/forms.css';
@import 'components/chat.css';
@import 'components/modal.css';

/* 4. Features */
@import 'loading.css';
@import 'settings.css';
@import 'notifications.css';
@import 'mobile.css';
```

## JavaScript Architecture

### Modular JavaScript Strategy

The JavaScript follows a **service-oriented architecture**:

#### 1. **Service Layer** (`js/services/`)
Business logic and external communication:
- **api.js**: Centralized API communication with error handling
- **storage.js**: Type-safe localStorage wrapper

#### 2. **Utility Layer** (`js/utils/`)
Helper functions and reusable utilities:
- **helpers.js**: DOM manipulation, formatting, validation
- **gestures.js**: Touch gesture detection & controllers

#### 3. **Application Layer**
Main application logic:
- **main.js**: Entry point, event handlers, UI orchestration

### Module Loading Order

Scripts are loaded in dependency order:

```html
<!-- 1. Services (no dependencies) -->
<script src="js/services/storage.js"></script>
<script src="js/services/api.js"></script>

<!-- 2. Utilities -->
<script src="js/utils/helpers.js"></script>
<script src="js/utils/gestures.js"></script>

<!-- 3. Main application -->
<script src="js/main.js"></script>
```

### Global API

Services and utilities are exposed globally for ease of use:

```javascript
// Services
window.storageService  // Storage management
window.apiService      // API communication

// Utilities
window.$               // querySelector wrapper
window.$$              // querySelectorAll wrapper
window.escapeHTML      // HTML escaping
window.copyToClipboard // Clipboard utility
window.debounce        // Function debouncing
window.throttle        // Function throttling
// ... and more
```

## Design Tokens (CSS Variables)

All design values are centralized in `css/base/variables.css`:

### Color System
```css
--primary: #1e3a8a;        /* VCET brand blue */
--primary-light: #3b82f6;
--secondary: #f59e0b;       /* Amber accents */
--accent: #10b981;          /* Success green */
--danger: #ef4444;          /* Error red */
```

### Spacing Scale
```css
--spacing-xs: 0.25rem;  /* 4px */
--spacing-sm: 0.5rem;   /* 8px */
--spacing-md: 1rem;     /* 16px */
--spacing-lg: 1.5rem;   /* 24px */
--spacing-xl: 2rem;     /* 32px */
```

### Typography
```css
--font-sans: 'Inter', sans-serif;
--font-heading: 'Poppins', sans-serif;
--text-sm: 0.875rem;
--text-base: 0.9375rem;
--text-lg: 1rem;
```

## Code Quality Tools

### ESLint Configuration
- **File**: `.eslintrc.js`
- **Purpose**: JavaScript linting and code quality
- **Run**: `npm run lint` or `npm run lint:check`

### Prettier Configuration
- **File**: `.prettierrc`
- **Purpose**: Code formatting consistency
- **Run**: `npm run format` or `npm run format:check`

### Validation
Run both linting and formatting checks:
```bash
npm run validate
```

## Build Process

### Development
```bash
npm run dev              # Start Flask development server
npm run dev:frontend     # Start live-server for static files
```

### Production Build
```bash
npm run build            # Build public/ directory for deployment
```

This generates:
- Static HTML from Flask templates
- Copies all CSS/JS assets
- Creates `robots.txt`, `manifest.json`, `sitemap.xml`

## Best Practices

### CSS Guidelines
1. **Use CSS custom properties** for any repeated value
2. **Follow BEM naming** for component classes
3. **Mobile-first responsive design** (min-width media queries)
4. **Prefer composition** over deep nesting
5. **Document complex selectors** with comments

### JavaScript Guidelines
1. **Use JSDoc comments** for all functions
2. **Prefer const/let** over var
3. **Use async/await** for asynchronous code
4. **Handle errors explicitly** with try/catch
5. **Keep functions small** and single-purpose

### File Organization
1. **One component per file** when possible
2. **Group related functionality** in directories
3. **Use descriptive names** for files and variables
4. **Add comments** for complex logic
5. **Keep imports organized** by type

## Migration Guide

### Moving from Legacy to Modular CSS

1. Update HTML to use `index.css`:
```html
<link rel="stylesheet" href="css/index.css">
```

2. Gradually move styles from `style.css` to appropriate modules
3. Use CSS custom properties instead of hardcoded values
4. Test thoroughly after each migration step

### Adopting Service Modules

1. Replace direct localStorage calls with `storageService`
2. Use `apiService` for all API requests
3. Leverage utility functions from `helpers.js`
4. Update code to use the new global APIs

## Future Improvements

- [ ] Add CSS modules or scoped styles
- [ ] Implement CSS-in-JS for dynamic theming
- [ ] Add TypeScript for type safety
- [ ] Create Storybook for component documentation
- [ ] Add unit tests for services and utilities
- [ ] Optimize bundle size with tree shaking
- [ ] Implement lazy loading for routes
- [ ] Add PWA offline support

## Resources

- [CSS Architecture Guide](https://philipwalton.com/articles/css-architecture/)
- [JavaScript Modules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules)
- [ESLint Rules](https://eslint.org/docs/rules/)
- [Prettier Options](https://prettier.io/docs/en/options.html)

---

**Last Updated**: 2026-02-03  
**Version**: 2.0.0  
**Maintained By**: VCET Development Team
