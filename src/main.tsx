import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

try {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  )
} catch (error) {
  console.error('Falha fatal na inicialização:', error);
  const root = document.getElementById('root');
  if (root) {
    root.innerHTML = `
      <div style="padding: 20px; text-align: center; color: #ef4444; font-family: sans-serif;">
        <h1>Erro Crítico de Inicialização</h1>
        <p>${error instanceof Error ? error.message : 'Erro desconhecido'}</p>
        <p style="color: #666; font-size: 0.8em;">Verifique as variáveis de ambiente no console da Vercel.</p>
      </div>
    `;
  }
}
