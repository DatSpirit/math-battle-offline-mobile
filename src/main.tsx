import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { MobileProvider } from './components/shared/MobileProvider';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MobileProvider>
      <App />
    </MobileProvider>
  </StrictMode>,
)
