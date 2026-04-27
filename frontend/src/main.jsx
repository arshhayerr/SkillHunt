import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx'
import { SidebarProvider } from './context/SidebarContext.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <SidebarProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </SidebarProvider>
    </ThemeProvider>
  </React.StrictMode>,
)
