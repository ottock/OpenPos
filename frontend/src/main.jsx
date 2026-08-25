// imports
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { applyTheme, getStoredTheme } from './presentation/assets/theme.js'
import './index.css'

// Apply the saved theme (loads both theme stylesheets and enables the right
// one) before the first paint, so there is no flash of the wrong theme.
const initialTheme = getStoredTheme()
applyTheme(initialTheme)

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

const themeLink = document.getElementById(initialTheme === 'dark' ? 'theme-link-dark' : 'theme-link-light')
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
