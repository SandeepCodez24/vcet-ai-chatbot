# VCET AI Chatbot - Quick Reference

## 🚀 Quick Start Commands

### Development
```bash
# Start Python Flask server
npm run dev
# Runs: python server.py

# Start live-server for frontend only
npm run dev:frontend
```

### Build
```bash
# Full build (recommended before deployment)
npm run build

# Build public directory only
npm run build:public

# Copy static assets
npm run build:static
```

### Code Quality
```bash
# Lint and fix JavaScript files
npm run lint

# Check linting without fixing
npm run lint:check

# Format all code
npm run format

# Check formatting without changes
npm run format:check

# Validate everything (lint + format)
npm run validate
```

### Deployment
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy to production
netlify deploy --prod

# View function logs
netlify functions:log query
```

## 📁 Project Structure

```
VCET_V6/
├── static/
│   ├── css/               # Stylesheets
│   │   ├── base/          # Variables, reset, animations
│   │   ├── components/    # Buttons, forms, chat, modal
│   │   ├── layouts/       # Header, sidebar, main
│   │   └── index.css      # Main CSS entry point
│   └── js/
│       ├── services/      # API, storage services
│       ├── utils/         # Helpers, gestures
│       └── main.js        # Application entry point
├── netlify/functions/     # Serverless functions
├── templates/             # Flask templates
└── public/                # Build output (generated)
```

## 🎨 CSS Architecture

### Imports Order (index.css)
1. **Base**: variables → reset → animations
2. **Layouts**: header → sidebar → main
3. **Components**: buttons → forms → chat → modal
4. **Features**: loading → settings → notifications → mobile

### CSS Variables Quick Reference
```css
/* Colors */
--primary: #1e3a8a
--secondary: #f59e0b
--accent: #10b981
--danger: #ef4444

/* Spacing */
--spacing-xs: 0.25rem   /* 4px */
--spacing-sm: 0.5rem    /* 8px */
--spacing-md: 1rem      /* 16px */
--spacing-lg: 1.5rem    /* 24px */
--spacing-xl: 2rem      /* 32px */

/* Typography */
--text-sm: 0.875rem
--text-base: 0.9375rem
--text-lg: 1rem
--text-xl: 1.125rem
--text-2xl: 1.5rem
```

## 💻 JavaScript API

### Services
```javascript
// Storage Service
storageService.get(key, defaultValue)
storageService.set(key, value)
storageService.getApiKey()
storageService.setApiKey(key)
storageService.getTheme()
storageService.setTheme('dark'|'light')

// API Service
apiService.sendQuery(query)
apiService.getStats()
apiService.checkHealth()
apiService.getSuggestions()
```

### Utilities
```javascript
// DOM
$(selector)                    // querySelector
$$(selector)                   // querySelectorAll
createElement(tag, attrs, children)

// Clipboard
copyToClipboard(text)

// Timing
debounce(func, wait)
throttle(func, limit)
sleep(ms)

// Formatting
formatDate(date)
formatTime(date)
escapeHTML(text)
truncateText(text, maxLength)

// Validation
isValidEmail(email)
isMobile()
isTouchDevice()
```

## 🌐 API Endpoints

### Development (Flask)
```
POST   /api/query           # Process user query
GET    /api/stats           # System statistics
GET    /api/suggestions     # Get suggestions
GET    /api/health          # Health check
POST   /api/clear-cache     # Clear cache
```

### Production (Netlify)
```
POST   /.netlify/functions/query
GET    /.netlify/functions/stats
GET    /.netlify/functions/suggestions
GET    /.netlify/functions/health
```

## ⚙️ Environment Variables

### Required
```bash
GROQ_API_KEY=gsk_...           # Groq API key
```

### Optional
```bash
LLM_MODEL=llama-3.3-70b-versatile
EMBEDDING_MODEL=BAAI/bge-base-en-v1.5
NODE_VERSION=18
```

## 🔧 Configuration Files

| File | Purpose |
|------|---------|
| `.eslintrc.js` | JavaScript linting rules |
| `.prettierrc` | Code formatting rules |
| `netlify.toml` | Netlify deployment config |
| `package.json` | NPM dependencies & scripts |

## 📝 File Naming Conventions

### CSS
- `kebab-case.css` - All lowercase with hyphens
- Components: `component-name.css`
- Layouts: `layout-name.css`

### JavaScript
- `camelCase.js` - Start lowercase
- Services: `serviceName.js`
- Utilities: `utilityName.js`

### Documentation
- `UPPERCASE.md` - All caps for major docs
- `Title-Case.md` - For guides

## 🎯 Common Tasks

### Add a New CSS Component
1. Create `static/css/components/mycomponent.css`
2. Add `@import 'components/mycomponent.css';` to `index.css`
3. Use CSS variables for values
4. Add documentation comments

### Add a New Service
1. Create `static/js/services/myservice.js`
2. Add JSDoc comments
3. Export globally: `window.myService = new MyService()`
4. Import in `index.html` before `main.js`

### Add a New Utility Function
1. Add to `static/js/utils/helpers.js`
2. Add JSDoc comment
3. Export globally: `window.myFunction = myFunction`

### Add a New Netlify Function
1. Create `netlify/functions/myfunction.js`
2. Export `handler` function
3. Add CORS headers
4. Handle OPTIONS requests
5. Document in DEPLOYMENT.md

## 🐛 Debugging

### Check Logs
```bash
# Flask logs
npm run dev

# Netlify function logs
netlify functions:log functionName

# Build logs
npm run build
```

### Common Issues

**CSS not loading**: Check import order in `index.css`  
**JS error**: Check script loading order in `index.html`  
**API failing**: Verify API key in localStorage or env vars  
**Build failing**: Run `npm install` and check Node version  
**Functions 404**: Verify `netlify.toml` functions directory

## 📚 Documentation

| File | Description |
|------|-------------|
| `README.md` | Project overview |
| `CODEBASE_STRUCTURE.md` | Architecture guide |
| `DEPLOYMENT.md` | Deployment instructions |
| `IMPLEMENTATION_SUMMARY.md` | Phase 5 & 7 summary |
| `NETLIFY_PRODUCTION_GUIDE.md` | Original production guide |

## 🔗 Useful Links

- **Groq API**: https://console.groq.com
- **Netlify Docs**: https://docs.netlify.com
- **MDN Web Docs**: https://developer.mozilla.org
- **ESLint Rules**: https://eslint.org/docs/rules
- **Prettier Options**: https://prettier.io/docs/en/options

## ✅ Pre-Deployment Checklist

- [ ] Code linted (`npm run lint:check`)
- [ ] Code formatted (`npm run format:check`)
- [ ] Build successful (`npm run build`)
- [ ] API key configured
- [ ] Functions tested locally
- [ ] Environment variables set
- [ ] Documentation updated
- [ ] Mobile tested

---

**Version**: 2.0.0  
**Last Updated**: 2026-02-03
