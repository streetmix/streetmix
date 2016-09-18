import React from 'react'

export default class StreetMetaData extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      street: this.props.street
    }
  }

  componentWillReceiveProps (nextProps) {
    this.setState({
      street: nextProps.street
    })
  }

  render () {
    return (
      <div>
        <span id='street-metadata-width'>
          <span id='street-width-read' title='Change width of the street'>
            <span id='street-width-read-width' />
            &nbsp;
            <span id='street-width-read-difference' />
          </span>
          <select id='street-width' />
        </span>
        <span id='street-metadata-author' />
        <span id='street-metadata-date' />
      </div>
    )
  }
}

StreetMetaData.propTypes = {
  street: React.PropTypes.any
}
