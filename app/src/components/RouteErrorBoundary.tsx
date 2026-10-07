import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  error: Error | null
}

/**
 * 路由级错误边界。
 *
 * 懒加载场景下不能省：chunk 加载失败（网络抖动、CDN 不一致、重新部署后
 * 旧 chunk 变 404）时，没有这层用户会永久卡在 Suspense 骨架屏，
 * 控制台只有一条警告。
 */
export default class RouteErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // 保留原始堆栈，便于排查 chunk 加载失败的真实原因
    console.error('[RouteErrorBoundary] 页面加载失败:', error, info.componentStack)
  }

  private handleRetry = () => {
    this.setState({ error: null })
    // 强制重新拉取失败的 chunk，而不是复用浏览器里那份失败缓存
    window.location.reload()
  }

  render() {
    const { error } = this.state
    if (!error) return this.props.children

    return (
      <div
        style={{
          minHeight: '60vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '16px',
          padding: '48px 24px',
          textAlign: 'center',
        }}
      >
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(20px, 3vw, 28px)',
            fontWeight: 300,
            color: 'var(--color-text)',
            letterSpacing: '0.04em',
          }}
        >
          这个页面没能加载出来
        </h1>
        <p
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '14px',
            color: 'var(--color-text-muted)',
            maxWidth: '420px',
            lineHeight: 1.7,
          }}
        >
          可能是网络波动，或站点刚刚更新过。刷新一下通常就能恢复。
        </p>
        <pre
          style={{
            fontSize: '11px',
            color: 'var(--color-text-muted)',
            opacity: 0.7,
            maxWidth: '560px',
            overflowX: 'auto',
            whiteSpace: 'pre-wrap',
            textAlign: 'left',
          }}
        >
          {error.message}
        </pre>
        <button
          onClick={this.handleRetry}
          style={{
            marginTop: '8px',
            padding: '10px 28px',
            border: '1px solid var(--color-border)',
            background: 'transparent',
            color: 'var(--color-text)',
            fontFamily: 'var(--font-body)',
            fontSize: '13px',
            letterSpacing: '0.06em',
            cursor: 'pointer',
          }}
        >
          重新加载
        </button>
      </div>
    )
  }
}
