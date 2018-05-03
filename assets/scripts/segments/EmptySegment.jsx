import React from 'react'

class EmptySegment extends React.Component {
  render () {
    return (
      <div className="segment empty">
        <span className="name" />
        <span className="width" />
        <span className="grid" />
      </div>
    )
  }
}

export default EmptySegment
