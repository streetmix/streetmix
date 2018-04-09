import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { needsUnicodeFont } from '../util/unicode'
import { t } from '../app/locale'

const MAX_STREET_NAME_WIDTH = 50

class StreetName extends React.PureComponent {
  static propTypes = {
    id: PropTypes.string,
    name: PropTypes.string,
    childRef: PropTypes.func,
    handleStreetNameChange: PropTypes.func,
    isStreetReadOnly: PropTypes.bool,
    isHoverable: PropTypes.bool,
    editable: PropTypes.bool
  }

  static defaultProps = {
    name: '',
    isStreetReadOnly: false,
    isHoverable: false
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
      isHovered: false,
      modify: false,
      inpVal: ''
    }
  }

  handleStreetNameChange = () => {
    let newName = this.state.inpVal
    if (newName) {
      this.props.handleStreetNameChange(newName)
      this.setState({
        modify: false,
        inpVal: '',
        isHovered: false
      })
    }
  }

  handleKeyUp = (evt) => {
    if (evt.key === 'Enter') {
      this.handleStreetNameChange()
    }
    if (evt.key === 'Escape') {
      this.setState({
        modify: false,
        inpVal: '',
        isHovered: false
      })
    }
  }

  componentDidMount () {
    window.addEventListener('mousedown', (event) => {
      if (!document.getElementById(this.props.id).contains(event.target)) {
        this.setState({
          isHovered: false,
          modify: false,
          inpVal: ''
        })
      }
    })
  }

  componentWillUnmount () {
    window.removeEventListener('mousedown', (event) => {
      if (!document.getElementById(this.props.id).contains(event.target)) {
        this.setState({
          isHovered: false,
          modify: false,
          inpVal: ''
        })
      }
    })
  }

  onMouseEnter = () => {
    this.setState({ isHovered: true })
  }

  onMouseLeave = () => {
    this.setState({ isHovered: false })
  }

  renderHoverPrompt = () => {
    if (this.props.isStreetReadOnly || !this.props.isHoverable) return null
    if (typeof this.props.handleStreetNameChange === 'function' && this.state.isHovered) {
      return (
        <div className="street-name-hover-prompt">
          {t('street.rename', 'Click to rename')}
        </div>
      )
    }
    return null
  }

  render () {
    let classString = 'street-name-text ' + (!needsUnicodeFont(this.props.name) ? '' : 'fallback-unicode-font')
    if (!this.state.modify) {
      return (<div
        className="street-name"
        ref={this.props.childRef}
        onMouseEnter={this.onMouseEnter}
        onMouseLeave={this.onMouseLeave}
        onClick={() => this.setState({modify: true})}
        id={this.props.id}>
        {this.renderHoverPrompt()}
        <div className={classString}>{StreetName.normalizeStreetName(this.props.name)}</div>
      </div>)
    } else if (this.state.modify && this.props.editable) {
      return (<div
        className="street-name"
        ref={this.props.childRef}
        id={this.props.id}>
        <input className={classString} type="text"
          placeholder={StreetName.normalizeStreetName(this.props.name)}
          onChange={(evt) => this.setState({ inpVal: evt.target.value })}
          onKeyUp={(evt) => this.handleKeyUp(evt)} autoFocus />
      </div>)
    }
  }
}

function mapStateToProps (state) {
  return {
    isStreetReadOnly: state.app.readOnly,
    isHoverable: !state.system.touch
  }
}

export default connect(mapStateToProps)(StreetName)
