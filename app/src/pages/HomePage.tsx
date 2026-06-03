import { useEffect } from 'react'
import AOS from 'aos'
import HeroSection from '../sections/HeroSection'
import LoopSection from '../sections/LoopSection'

export default function HomePage() {
  useEffect(() => {
    AOS.init({
      duration: 800,
      easing: 'ease-out-cubic',
      once: true,
      offset: 100,
    })
  }, [])

  return (
    <>
      <HeroSection />
      <LoopSection />
    </>
  )
}
