import { useEffect, useState, lazy, Suspense } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import Header from './components/Header'
import MobileMenu from './components/MobileMenu'
import MagneticCursor from './components/MagneticCursor'
import RouteErrorBoundary from './components/RouteErrorBoundary'
import { Skeleton } from './components/ui/skeleton'
import HomePage from './pages/HomePage'
import Footer from './sections/Footer'

// 首页是绝大多数流量的落地页，保持同步导入，让首屏不等任何网络往返。
// 其余 8 个页面按需切分：ArticlePage 尤其值得切，它会拖进
// react-markdown + remark-gfm 这条最重的依赖链，而只有 /article/:id 用得到。
const AboutPage = lazy(() => import('./pages/AboutPage'))
const ArchivesPage = lazy(() => import('./pages/ArchivesPage'))
const ArticlePage = lazy(() => import('./pages/ArticlePage'))
const LifePage = lazy(() => import('./pages/LifePage'))
const PragmatismConnectivismPage = lazy(() => import('./pages/PragmatismConnectivismPage'))
const BrandAIPage = lazy(() => import('./pages/BrandAIPage'))
const FriendsPage = lazy(() => import('./pages/FriendsPage'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'))

// 路由切换时的占位。刻意做得很轻：只给一个居中的呼吸块，
// 不去模拟各页面版式——那既难维护，也会在数据到达时产生明显跳变。
function RouteFallback() {
  return (
    <div className="min-h-[60vh] w-full px-6 py-24 md:px-12">
      <Skeleton className="mx-auto h-8 w-48 rounded-full" />
      <Skeleton className="mx-auto mt-6 h-4 w-72 max-w-full" />
      <Skeleton className="mx-auto mt-3 h-4 w-56 max-w-full" />
    </div>
  )
}

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
        <RouteErrorBoundary>
          <Suspense fallback={<RouteFallback />}>
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
          </Suspense>
        </RouteErrorBoundary>
      </main>
      <Footer />
    </>
  )
}

export default App
