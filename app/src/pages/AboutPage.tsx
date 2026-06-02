import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

export default function AboutPage() {
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const content = contentRef.current
    if (!content) return

    gsap.fromTo(
      content,
      { opacity: 0, y: 40 },
      { opacity: 1, y: 0, duration: 1, ease: 'power3.out', delay: 0.2 }
    )
  }, [])

  return (
    <div
      style={{
        minHeight: '100vh',
        paddingTop: '140px',
        paddingBottom: '80px',
        backgroundColor: '#fff',
      }}
    >
      <div
        ref={contentRef}
        style={{
          maxWidth: '720px',
          margin: '0 auto',
          padding: '0 40px',
        }}
      >
        <span
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: '0.7rem',
            fontWeight: 500,
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
            color: 'var(--color-muted)',
            display: 'block',
            marginBottom: '24px',
          }}
        >
          About
        </span>

        <h1
          className="font-serif"
          style={{
            fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)',
            fontWeight: 700,
            lineHeight: 1.3,
            marginBottom: '48px',
            color: 'var(--color-ink)',
            letterSpacing: '0.02em',
          }}
        >
          XIAOYU的随笔 · 序章 · 缘起由来
        </h1>

        <div
          style={{
            fontFamily: "'Noto Sans SC', sans-serif",
            fontSize: '0.95rem',
            fontWeight: 400,
            lineHeight: 1.9,
            color: 'var(--color-ink)',
          }}
        >
          <p style={{ marginBottom: '2em', fontWeight: 500 }}>
            · 缘起
          </p>
          <p style={{ marginBottom: '2em' }}>
            {'\u201c摩西在诗篇90篇里面说：\u201c我们经过的日子都在你的震怒之下，我们渡尽的年岁好像是一生叹息。我们一生的年日是七十岁，若是强壮可到八十岁；但其中所矜夸的不过是劳苦愁烦，转眼成空，我们便如飞而去。\u201d\u201d'}
          </p>

          <p style={{ marginBottom: '2em', fontWeight: 500 }}>
            · 生活是一场湮灭的花火
          </p>
          <p style={{ marginBottom: '2em' }}>
            {"生活本身或许也没有啥子意义，不信你看：爱情会远去，身体会衰老，激情会消失。一切都将归于虚无。生活其实本质是虚无的，因为一切都会消逝，都将会被取代，曾经的印记终将片甲不留。湮灭于时光长河。"}
          </p>

          <p style={{ marginBottom: '2em', fontWeight: 500 }}>
            · 《摇摇晃晃的人间》
          </p>
          <p style={{ marginBottom: '2em' }}>
            {"我看了诗人余秀华的纪录片《摇摇晃晃的人间》，导演用重复大量的对身为农民和诗人的余秀华的日常镜头传达了她身份的矛盾和自己的坚持，田间劳作，割草喂兔，读书写作，余秀华的日常就是这样，她没有如花美貌，她说话口齿不清，她的老公是父母包办，她生活条件一点都不优渥，她说写诗是支撑自己生活的支柱。"}
          </p>

          <p style={{ marginBottom: '2em', fontWeight: 500 }}>
            · 生存、生活、生命
          </p>
          <p style={{ marginBottom: '2em' }}>
            {"对于别人而言或许在我们死后还会存在意义，如同伟人死后亦成为精神丰碑，生前轶事也被好事者寻出推敲斟酌，可我们没有这样的好福气，多数人只会如同祥林嫂那样，死了就逐渐消逝了，连同那根乞讨生活的竹竿和豁了口的瓷碗一样湮灭。"}
          </p>

          <p style={{ marginBottom: '2em', fontWeight: 500 }}>
            · 绽放的我们于是有了意义
          </p>
          <p style={{ marginBottom: '2em' }}>
            {"所以生命本身没有意义，有意义的是活着的我们，我们的喜怒哀乐，我们对生活的感知才有意义。"}
          </p>

          <p style={{ marginBottom: '2em', fontWeight: 500 }}>
            · 尾
          </p>
          <p>
            {'"XIAOYU的随笔"记录着发生过的事、遇见过的人、去过的地方。'}
          </p>
        </div>
      </div>
    </div>
  )
}
