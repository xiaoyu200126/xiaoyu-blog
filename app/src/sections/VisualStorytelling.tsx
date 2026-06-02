import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const polaroids = [
  {
    id: 1,
    image: '/images/polaroid-1.jpg',
    rotation: -3,
    offsetX: '-10%',
    offsetY: '5%',
    size: '280px',
  },
  {
    id: 2,
    image: '/images/polaroid-2.jpg',
    rotation: 2,
    offsetX: '15%',
    offsetY: '-8%',
    size: '240px',
  },
  {
    id: 3,
    image: '/images/featured-2.jpg',
    rotation: -1.5,
    offsetX: '-5%',
    offsetY: '20%',
    size: '220px',
  },
  {
    id: 4,
    image: '/images/polaroid-1.jpg',
    rotation: 4,
    offsetX: '8%',
    offsetY: '12%',
    size: '200px',
  },
]

function PolaroidFrame({
  image,
  rotation,
  size,
}: {
  image: string
  rotation: number
  size: string
}) {
  const figureRef = useRef<HTMLDivElement>(null)
  const tlRef = useRef<gsap.core.Timeline | null>(null)

  useEffect(() => {
    const figure = figureRef.current
    if (!figure) return

    // Create CMYK layers
    const layers = ['c', 'm', 'y', 'k']
    layers.forEach((layer) => {
      const div = document.createElement('div')
      div.className = `polaroid-layer polaroid-${layer}`
      div.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        opacity: 0;
        mix-blend-mode: multiply;
        pointer-events: none;
        background-image: url(${image});
        background-size: cover;
        background-position: center;
        z-index: ${layer === 'c' ? 4 : layer === 'm' ? 3 : layer === 'y' ? 2 : 1};
      `
      figure.appendChild(div)
    })

    // Add main image layer
    const mainImg = document.createElement('div')
    mainImg.className = 'polaroid-main'
    mainImg.style.cssText = `
      position: relative;
      z-index: 5;
      width: 100%;
      height: 100%;
      background-image: url(${image});
      background-size: cover;
      background-position: center;
      filter: drop-shadow(0 0 0 rgba(0,0,0,0));
    `
    figure.insertBefore(mainImg, figure.firstChild)

    // Add print-ready styles
    const style = document.createElement('style')
    style.textContent = `
      .polaroid-c { filter: drop-shadow(-4px 0 0 rgba(0, 255, 255, 0.6)); }
      .polaroid-m { filter: drop-shadow(4px 0 0 rgba(255, 0, 255, 0.6)); }
      .polaroid-y { filter: drop-shadow(0 4px 0 rgba(255, 255, 0, 0.6)); }
      .polaroid-k { filter: drop-shadow(0 0 0 rgba(0, 0, 0, 1)); }
      figure.print-ready .polaroid-c,
      figure.print-ready .polaroid-m,
      figure.print-ready .polaroid-y,
      figure.print-ready .polaroid-k {
        opacity: 0.8 !important;
        transition: opacity 0.8s ease-out;
      }
    `
    document.head.appendChild(style)

    // GSAP animation
    const layersSelector = figure.querySelectorAll('.polaroid-layer')

    const tl = gsap.timeline({
      paused: true,
      onStart: () => figure.classList.add('print-ready'),
    })

    // Scatter outward
    tl.fromTo(
      layersSelector,
      { x: 0, y: 0, rotation: 0 },
      {
        x: (i) => [-15, 15, 0, 0][i],
        y: (i) => [0, 0, 15, 0][i],
        rotation: (i) => [-5, 5, 0, 0][i],
        duration: 0.6,
        ease: 'power2.out',
        stagger: 0.05,
      },
      0
    )

    // Converge back with elastic
    tl.to(
      layersSelector,
      {
        x: 0,
        y: 0,
        rotation: 0,
        duration: 0.8,
        ease: 'elastic.out(1, 0.5)',
        stagger: 0.1,
      },
      0.5
    )

    tlRef.current = tl

    // Trigger on scroll
    const st = ScrollTrigger.create({
      trigger: figure,
      start: 'top 80%',
      onEnter: () => tl.play(),
      once: true,
    })

    return () => {
      tl.kill()
      st.kill()
      style.remove()
    }
  }, [image])

  return (
    <div
      ref={figureRef}
      style={{
        position: 'relative',
        width: size,
        height: `calc(${size} * 1.25)`,
        transform: `rotate(${rotation}deg)`,
        backgroundColor: 'var(--color-paper-white)',
        padding: '12px 12px 40px 12px',
        boxShadow: '0 8px 30px rgba(0,0,0,0.25)',
        overflow: 'hidden',
      }}
    />
  )
}

export default function VisualStorytelling() {
  return (
    <section
      style={{
        position: 'relative',
        minHeight: '100vh',
        backgroundColor: 'var(--color-dark)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 'clamp(80px, 10vw, 140px) 40px',
        overflow: 'hidden',
      }}
    >
      {/* Section label */}
      <div
        style={{
          textAlign: 'center',
          marginBottom: 'clamp(40px, 6vw, 80px)',
        }}
      >
        <span
          className="font-inter"
          style={{
            fontSize: '0.7rem',
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.4)',
          }}
        >
          Visual Storytelling
        </span>
      </div>

      {/* Polaroid grid */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '900px',
          height: 'clamp(400px, 50vw, 600px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {polaroids.map((p, i) => (
          <div
            key={p.id}
            style={{
              position: 'absolute',
              left: i % 2 === 0 ? p.offsetX : 'auto',
              right: i % 2 === 1 ? p.offsetX : 'auto',
              top: p.offsetY,
              zIndex: i + 1,
            }}
          >
            <PolaroidFrame
              image={p.image}
              rotation={p.rotation}
              size={p.size}
            />
          </div>
        ))}

        {/* Center quote */}
        <div
          style={{
            position: 'relative',
            zIndex: 10,
            textAlign: 'center',
            maxWidth: '480px',
            padding: '0 20px',
          }}
        >
          <p
            className="font-serif"
            style={{
              fontSize: 'clamp(1.1rem, 2vw, 1.5rem)',
              fontWeight: 400,
              lineHeight: 1.8,
              color: 'var(--color-paper-white)',
              fontStyle: 'italic',
              letterSpacing: '0.05em',
              textShadow: '0 2px 20px rgba(0,0,0,0.5)',
            }}
          >
            {"真正的发现之旅不在于寻找新的景观，而在于拥有新的眼光。"}
          </p>
          <span
            className="font-inter"
            style={{
              display: 'block',
              marginTop: '16px',
              fontSize: '0.7rem',
              letterSpacing: '0.15em',
              color: 'rgba(255,255,255,0.5)',
            }}
          >
            —— 马塞尔·普鲁斯特
          </span>
        </div>
      </div>
    </section>
  )
}
