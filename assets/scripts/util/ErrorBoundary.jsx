import React from 'react'
import PropTypes from 'prop-types'

/**
 * This is a stock error boundary component.
 * See https://reactjs.org/docs/error-boundaries.html
 */
class ErrorBoundary extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      hasError: false
    }
  }

  // eslint-disable-next-line n/handle-callback-err
  static getDerivedStateFromError (error) {
    // Update state so the next render will show the fallback UI.
    return {
      hasError: true
    }
  }

  componentDidCatch (error, errorInfo) {
    // Log out a message
    console.error(error, errorInfo)
  }

  render () {
    if (this.state.hasError) {
      if (this.props.fallbackElement) {
        return this.props.fallbackElement
      } else {
        // TODO: render a better custom fallback UI
        return <h1>Something went wrong.</h1>
      }
    }

    return this.props.children
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node,
  fallbackElement: PropTypes.node
}

export default ErrorBoundary
