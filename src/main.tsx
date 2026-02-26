import "@salt-ds/theme/index.css";
import "@salt-ds/icons/saltIcons.css"; // optional, to use saltIcons-* CSS classes :contentReference[oaicite:3]{index=3}

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from "react-router-dom";
import './index.css'
import App from './App.tsx'
import { SaltProvider } from "@salt-ds/core";

createRoot(document.getElementById('root')!).render(
  <StrictMode>
      <SaltProvider>
     <BrowserRouter>   
     <App />
     </BrowserRouter>
     </SaltProvider>
 
  </StrictMode>
)
