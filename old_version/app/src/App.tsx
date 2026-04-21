import { useEffect, useRef } from 'react'
import { Routes, Route } from 'react-router-dom'
import Lenis from 'lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Header from './components/Header'
import MobileMenu from './components/MobileMenu'
import MagneticCursor from './components/MagneticCursor'
import HomePage from './pages/HomePage'
import AboutPage from './pages/AboutPage'
import ArchivesPage from './pages/ArchivesPage'
import Footer from './sections/Footer'
import { useState } from 'react'

gsap.registerPlugin(ScrollTrigger)

function App() {
  const lenisRef = useRef<Lenis | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)

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

  return (
    <>
      <MagneticCursor />
      <Header onMenuClick={() => setMenuOpen(true)} />
      <MobileMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/archives" element={<ArchivesPage />} />
        </Routes>
      </main>
      <Footer />
    </>
  )
}

export default App
