import React from 'react'
import PropTypes from 'prop-types'
import { FormattedMessage } from 'react-intl'
import './StreetName.scss'

const MAX_STREET_NAME_WIDTH = 50

export default class StreetName extends React.PureComponent {
  static propTypes = {
    id: PropTypes.string,
    name: PropTypes.string,
    childRef: PropTypes.func,
    onClick: PropTypes.func,
    editable: PropTypes.bool
  }

  static defaultProps = {
    name: '',
    editable: false
  }

  /**
   * Some processing needed to display street name
   *
   * @public for main street name ¯\_(ツ)_/¯
   * @params {string} name - Street name to check
   */
  static normalizeStreetName (name) {
    if (!name) return ''

    name = name.trim()

    if (name.length > MAX_STREET_NAME_WIDTH) {
      name = name.substr(0, MAX_STREET_NAME_WIDTH) + '…'
    }

    return name
  }

  constructor (props) {
    super(props)

    this.state = {
      isHovered: false
    }
  }

  handleMouseEnter = () => {
    this.setState({ isHovered: true })
  }

  handleMouseLeave = () => {
    this.setState({ isHovered: false })
  }

  renderHoverPrompt = () => {
    if (this.props.editable && this.state.isHovered) {
      return (
        <div className="street-name-hover-prompt">
          <FormattedMessage id="street.rename" defaultMessage="Click to rename" />
        </div>
      )
    }

    return null
  }

  render () {
    const displayName = StreetName.normalizeStreetName(this.props.name) || <FormattedMessage id="street.default-name" defaultMessage="Unnamed St" />

    return (
      <div
        className="street-name"
        ref={this.props.childRef}
        onMouseEnter={this.handleMouseEnter}
        onMouseLeave={this.handleMouseLeave}
        onClick={this.props.onClick}
        id={this.props.id}
      >
        {this.renderHoverPrompt()}
        <div className="street-name-text">{displayName}</div>
      </div>
    )
  }
}
