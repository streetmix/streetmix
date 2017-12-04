/**
 * BlockingError.jsx
 *
 * Displays a blocking error message on top of the application.
 *
 * @module BlockingError
 */
import React from 'react'

class BlockingError extends React.PureComponent {
  render () {
    return (
      <div id="error">
        <div className="clouds-background">
          <div className="rear-clouds" />
          <div className="front-clouds" />
        </div>
        <div className="error-content">
          <h1 id="error-title" />
          <div id="error-description" className="error-description" />
        </div>
      </div>
    )
  }
}

export default BlockingError
