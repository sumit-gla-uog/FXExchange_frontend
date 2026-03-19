import "@salt-ds/theme/index.css"
import "@salt-ds/icons/saltIcons.css"

import { StrictMode } from 'react'
import './lib/moduleRegistry'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from "react-router-dom"
import './index.css'
import App from './App.tsx'
import { SaltProvider } from "@salt-ds/core"

createRoot(document.getElementById('root')!).render(
  <StrictMode>
      <SaltProvider>
     <BrowserRouter>   
     <App />
     </BrowserRouter>
     </SaltProvider>
 
  </StrictMode>
)
