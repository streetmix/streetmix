import React from 'react'
import { msg } from '../app/messages'
import ReactDOM from 'react-dom'
import { setAndSaveStreet } from './data_model'

// Output using cmap2file as per
// http://www.typophile.com/node/64147#comment-380776

const STREET_NAME_FONT_GLYPHS = ' !"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[]^_`abcdefghijklmnopqrstuvwxyz{|}~¡¢£¤¥¦§¨©ª«¬®¯°±²³´µ¶·¸¹º»¼½¾¿ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖ×ØÙÚÛÜÝÞßàáâãäåæçèéêëìíîïðñòóôõö÷øùúûüýþÿĀāĂăĆćĈĉĊċČčĎďĒĔĕĖėĜĝĞğĠġĤĥĨĩĪīĬĭİıĴĵĹĺĽľŁłŃŇňŌōŎŏŐőŒœŔŕŘřŚśŜŝŞşŠšŤťŨũŪūŬŭŮůŰűŴŵŶŷŸŹźŻżŽžƒˆˇ˘˙˚˛˜˝–—‘’‚“”„†‡•…‰‹›⁄€™−'
const MAX_STREET_NAME_WIDTH = 50

export default class StreetName extends React.Component {

  constructor (props) {
    super(props)

    this.state = {
      width: 'auto',
      street: props.street
    }
    this.clickStreetName = this.clickStreetName.bind(this)
    this.updateWidths = this.updateWidths.bind(this)
  }

  componentDidMount () {
    this._node = ReactDOM.findDOMNode(this)
    window.addEventListener('resize', this.updateWidths)
  }

  componentWillUnmount () {
    window.removeEventListener('resize', this.updateWidths)
  }

  componentWillReceiveProps (nextProps) {
    this.setState({
      street: nextProps.street
    })
  }

  updateWidths () {
    var rect = this._node.getBoundingClientRect()

    if (rect.width > this.props.parentOffsetWidth) {
      var width = this.props.parentOffsetWidth + 'px'
      if (this.state.width !== width) {
        this.setState({
          width
        })
      }
    } else {
      if (this.state.width !== 'auto') {
        this.setState({
          width: 'auto'
        })
      }
    }
  }

  /**
   * Some processing needed to display street name
   *
   * @public for main street name ¯\_(ツ)_/¯
   * @params {string} name - Street name to check
   */
  static normalizeStreetName (name) {
    if (!name) {
      return ''
    }

    name = name.trim()

    if (name.length > MAX_STREET_NAME_WIDTH) {
      name = name.substr(0, MAX_STREET_NAME_WIDTH) + '…'
    }

    return name
  }

  /**
   * Check if street name requires a Unicode font to render correctly
   *
   * @static
   * @params {string} name - Street name to check
   */
  needsUnicodeFont () {
    let needUnicodeFont = false

    if (!this.state.street.name) {
      return false
    }

    for (let character of this.state.street.name) {
      if (STREET_NAME_FONT_GLYPHS.indexOf(character) === -1) {
        needUnicodeFont = true
        break
      }
    }

    return needUnicodeFont
  }

  clickStreetName () {
    if (!this.props.allowEditing) {
      return
    }

    const newName = window.prompt(msg('PROMPT_NEW_STREET_NAME'), this.state.street.name)

    if (newName) {
      const street = Object.assign({}, this.state.street)
      street.name = StreetName.normalizeStreetName(newName)
      setAndSaveStreet(street)
    }
  }

  render () {
    let classString = 'street-name-text ' + (this.needsUnicodeFont() ? 'fallback-unicode-font' : 'fallback-unicode-font')
    return (
      <div
        ref='streetName'
        id='street-name'
        className='street-name'
        style={{width: this.state.width}}
        onClick={this.clickStreetName}
      >
        <div className={classString}>{StreetName.normalizeStreetName(this.state.street.name)}</div>
      </div>
    )
  }
}

StreetName.propTypes = {
  allowEditing: React.PropTypes.bool,
  street: React.PropTypes.any,
  parentOffsetWidth: React.PropTypes.number
}

