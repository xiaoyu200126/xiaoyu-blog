import { useEffect, useRef } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import Lenis from 'lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Header from './components/Header'
import MobileMenu from './components/MobileMenu'
import MagneticCursor from './components/MagneticCursor'
import HomePage from './pages/HomePage'
import AboutPage from './pages/AboutPage'
import ArchivesPage from './pages/ArchivesPage'
import LifePage from './pages/LifePage'
import PragmatismPage from './pages/PragmatismPage'
import BrandAIPage from './pages/BrandAIPage'
import FriendsPage from './pages/FriendsPage'
import ArticlePage from './pages/ArticlePage'
import Footer from './sections/Footer'
import { useState } from 'react'

gsap.registerPlugin(ScrollTrigger)

function App() {
  const lenisRef = useRef<Lenis | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const lenis = new Lenis({
      lerp: 0.08,
      smoothWheel: true,
    })
    lenisRef.current = lenis

    lenis.on('scroll', ScrollTrigger.update)

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000)
    })
    gsap.ticker.lagSmoothing(0)

    return () => {
      lenis.destroy()
      gsap.ticker.remove(lenis.raf as any)
    }
  }, [])

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location.pathname])

  return (
    <>
      <MagneticCursor />
      <Header onMenuClick={() => setMenuOpen(!menuOpen)} menuOpen={menuOpen} />
      <MobileMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
      <main style={{ backgroundColor: '#fff' }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/archives" element={<ArchivesPage />} />
          <Route path="/life" element={<LifePage />} />
          <Route path="/pragmatism" element={<PragmatismPage />} />
          <Route path="/brand-ai" element={<BrandAIPage />} />
          <Route path="/friends" element={<FriendsPage />} />
          <Route path="/article/:id" element={<ArticlePage />} />
        </Routes>
      </main>
      <Footer />
    </>
  )
}

export default App
