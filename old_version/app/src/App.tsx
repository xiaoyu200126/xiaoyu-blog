import { useEffect } from 'react'
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
import { useState } from 'react'

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
