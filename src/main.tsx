import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './App.css'
import App from './App.tsx'
import { BusinessProvider } from './context/BusinessContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BusinessProvider>
      <App />
    </BusinessProvider>
  </StrictMode>,
)
