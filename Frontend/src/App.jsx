import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import AuthPage from './pages/AuthPage'
import WelcomePage from './pages/WelcomePage'
import ChatPage from './pages/ChatPage'
import ConnectionBanner from './components/layout/ConnectionBanner'
import ToastStack from './components/ui/ToastStack'
import { useSettingsStore, applyTheme } from './store/settingsStore'
import './styles/global.css'

function App() {
  const theme = useSettingsStore((s) => s.theme)

  /* Re-resolve 'system' whenever OS preference changes, or the user switches theme. */
  useEffect(() => {
    applyTheme(theme)
    if (theme !== 'system') return
    const mql = window.matchMedia('(prefers-color-scheme: light)')
    const onChange = () => applyTheme('system')
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [theme])

  return (
    <BrowserRouter>
      <ConnectionBanner />
      <Routes>
        <Route path="/" element={<Navigate to="/auth" replace />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/welcome" element={<WelcomePage />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/chat/:id" element={<ChatPage />} />
      </Routes>
      <ToastStack />
    </BrowserRouter>
  )
}

export default App
