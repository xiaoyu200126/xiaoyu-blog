import { useEffect, useState } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import Header from './components/Header'
import MobileMenu from './components/MobileMenu'
import MagneticCursor from './components/MagneticCursor'
import HomePage from './pages/HomePage'
import AboutPage from './pages/AboutPage'
import ArchivesPage from './pages/ArchivesPage'
import ArticlePage from './pages/ArticlePage'
import LifePage from './pages/LifePage'
import PragmatismConnectivismPage from './pages/PragmatismConnectivismPage'
import BrandAIPage from './pages/BrandAIPage'
import FriendsPage from './pages/FriendsPage'
import NotFoundPage from './pages/NotFoundPage'
import Footer from './sections/Footer'

// 说明：这里曾用 React.lazy 对 8 个页面做代码分割（首屏 gzip 212 kB → 148 kB），
// 但实测所有非首页路由都会永久停在 Suspense 骨架屏：chunk 全部 200、
// ErrorBoundary 不触发、console 无报错，在干净的生产构建与新端口下均可复现。
// 博客的 /archives 与 /article/:id 是最常被分享和被搜索引擎收录的地址，
// 让它们随时可能打不开，风险远高于首屏少几十 KB，因此这里保持同步导入。
// 若日后要重新引入，请先在真实浏览器里验证深链接，再上线。
function App() {
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location.pathname])

  return (
    <>
      <MagneticCursor />
      <Header onMenuClick={() => setMenuOpen(!menuOpen)} menuOpen={menuOpen} />
      <MobileMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/archives" element={<ArchivesPage />} />
          <Route path="/article/:id" element={<ArticlePage />} />
          <Route path="/life" element={<LifePage />} />
          <Route path="/pragmatism-connectivism" element={<PragmatismConnectivismPage />} />
          <Route path="/brand-ai" element={<BrandAIPage />} />
          <Route path="/friends" element={<FriendsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <Footer />
    </>
  )
}

export default App
