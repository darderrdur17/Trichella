import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

/** Light theme tokens and `[data-theme="light"]` rules depend on this — set before paint. */
document.documentElement.setAttribute('data-theme', 'light')

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
