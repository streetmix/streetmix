import React, { useLayoutEffect, useRef } from 'react'

// note: see _chrome.scss for styles

interface LoadingProps {
  isLoading: boolean
}

function Loading ({ isLoading = true }: LoadingProps): React.ReactElement {
  const loadingStuckNotice = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    // A "not loading" troubleshooting popup to provide a "way out" of totally
    // frozen UIs. Display this after 10 seconds if this component is still visible.
    const timer = window.setTimeout(function () {
      const el = loadingStuckNotice.current
      if (!el) return
      el.style.opacity = '1'
      el.style.transform = 'translateY(0)'
      el.setAttribute('aria-hidden', 'false')
    }, 10000)

    return () => {
      window.clearTimeout(timer)
    }
  })

  return (
    <div id="loading" className={isLoading ? '' : 'hidden'} hidden={!isLoading}>
      <div className="streetmix-logo" />
      <div className="loading-spinner" />
      <div
        ref={loadingStuckNotice}
        className="loading-stuck"
        aria-hidden="true"
      >
        <strong>Not loading?</strong>{' '}
        <a
          href="https://docs.streetmix.net/user-guide/support/troubleshooting"
          target="_blank"
          rel="noopener noreferrer"
        >
          Troubleshooting tips
        </a>
      </div>
    </div>
  )
}

export default Loading
