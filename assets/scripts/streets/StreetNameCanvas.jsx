import _ from 'lodash'
import React from 'react'
import StreetName from './StreetName'
import StreetMetaData from './StreetMetaData'
import { getStreet } from './data_model'
import ReactDOM from 'react-dom'

export default class StreetNameCanvas extends React.Component {
  constructor (props) {
    super(props)

    var street = getStreet()
    this.state = {
      classNames: [],
      street: street
    }
    this.streetUpdated = this.streetUpdated.bind(this)
    this.updatePositions = this.updatePositions.bind(this)
  }

  componentDidMount () {
    window.addEventListener('stmx:set_street', this.streetUpdated)
    window.addEventListener('stmx:width_updated', this.streetUpdated)
    window.addEventListener('resize', this.updatePositions)
  }

  componentWillUnmount () {
    window.removeEventListener('stmx:set_street', this.streetUpdated)
    window.removeEventListener('stmx:width_updated', this.streetUpdated)
    window.removeEventListener('resize', this.updatePositions)
  }

  componentDidUpdate () {
    this.updatePositions()
  }

  streetUpdated (e) {
    const street = getStreet()
    this.setState({street})
  }

  updatePositions () {
    // TODO don't use the DOM when the whole app is react
    const menuRect = document.querySelector('.menu-bar-right').getBoundingClientRect()

    // TODO there might be a better way to do this than findDomNode
    const streetNameRect = ReactDOM.findDOMNode(this.refs.streetName).getBoundingClientRect()
    const classNames = this.state.classNames.splice()

    const index = classNames.indexOf('move-down-for-menu')
    if (streetNameRect.left + streetNameRect.width > menuRect.left) {
      if (index === -1) {
        classNames.push('move-down-for-menu')
      }
    } else {
      if (index !== -1) {
        classNames.splice(index, 1)
      }
    }

    if (!_.isEqual(this.state.classNames, classNames)) {
      this.setState({
        classNames
      })
    }
  }

  render () {
    return (
      <div ref='street-name-canvas' id='street-name-canvas' className={this.state.classNames.join(' ')}>
        <StreetName
          ref='streetName'
          street={this.state.street}
          allowEditing={this.props.allowEditing}
          parentOffsetWidth={this.props.parentOffsetWidth}
        />
        <StreetMetaData id='street-metadata' street={this.state.street} />
      </div>
    )
  }
}

StreetNameCanvas.propTypes = {
  allowEditing: React.PropTypes.bool,
  parentOffsetWidth: React.PropTypes.any
}
