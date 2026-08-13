import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { AppProvider } from './store/AppProvider'
import { Toaster } from '@/components/ui/toaster'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppProvider>
      <App />
      <Toaster />
    </AppProvider>
  </React.StrictMode>
)
