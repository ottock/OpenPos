// imports
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { applyTheme, getStoredTheme } from './presentation/assets/theme.js'
import './index.css'

// Apply the saved theme (sets #theme-link href to a bundled CSS url) before the
// first paint, so there is no flash of the wrong theme.
applyTheme(getStoredTheme())

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

function dismissSplash() {
  const splash = document.getElementById('splash')
  if (!splash) return
  requestAnimationFrame(() => {
    splash.classList.add('splash-hidden')
    splash.addEventListener('transitionend', () => splash.remove(), { once: true })
    setTimeout(() => splash.remove(), 600)
  })
}

const themeLink = document.getElementById('theme-link')
if (themeLink && themeLink.getAttribute('href')) {
  if (themeLink.sheet) {
    dismissSplash()
  } else {
    themeLink.addEventListener('load', dismissSplash, { once: true })
    themeLink.addEventListener('error', dismissSplash, { once: true })
    setTimeout(dismissSplash, 3000)
  }
} else {
  dismissSplash()
}
