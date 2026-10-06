import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import RouteErrorBoundary from './components/RouteErrorBoundary'
import './index.css'
import App from './App'

// RouteErrorBoundary 兜住渲染期异常，给出可恢复的「重新加载」而不是整页白屏。
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <RouteErrorBoundary>
        <App />
      </RouteErrorBoundary>
    </BrowserRouter>
  </StrictMode>,
)
