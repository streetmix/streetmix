import React, { Component } from 'react'

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallbackComponent?: React.ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
}

/**
 * This is a stock error boundary component.
 * https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary
 */
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor (props: ErrorBoundaryProps) {
    super(props)

    this.state = {
      hasError: false
    }
  }

  // eslint-disable-next-line n/handle-callback-err
  static getDerivedStateFromError (error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI.
    return {
      hasError: true
    }
  }

  componentDidCatch (error: Error, errorInfo: React.ErrorInfo): void {
    // Log out a message
    console.error(error, errorInfo)
  }

  render (): React.ReactNode {
    if (this.state.hasError) {
      if (this.props.fallbackComponent !== undefined) {
        return this.props.fallbackComponent
      } else {
        // TODO: render a better custom fallback UI
        return <h1>Something went wrong.</h1>
      }
    }

    return this.props.children
  }
}

export default ErrorBoundary
