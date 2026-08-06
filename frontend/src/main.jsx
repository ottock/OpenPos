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

// Fade out and remove the inline splash (see index.html) now that React has
// mounted. Runs after the first paint so the fade itself is visible.
const splash = document.getElementById('splash')
if (splash) {
  requestAnimationFrame(() => {
    splash.classList.add('splash-hidden')
    splash.addEventListener('transitionend', () => splash.remove(), { once: true })
    // Safety net in case the transition never fires (e.g. display:none ancestor).
    setTimeout(() => splash.remove(), 600)
  })
}
