import React from 'react'
import { msg } from '../app/messages'
import { setAndSaveStreet } from './data_model'

// Output using cmap2file as per
// http://www.typophile.com/node/64147#comment-380776

const STREET_NAME_FONT_GLYPHS = ' !"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[]^_`abcdefghijklmnopqrstuvwxyz{|}~¡¢£¤¥¦§¨©ª«¬®¯°±²³´µ¶·¸¹º»¼½¾¿ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖ×ØÙÚÛÜÝÞßàáâãäåæçèéêëìíîïðñòóôõö÷øùúûüýþÿĀāĂăĆćĈĉĊċČčĎďĒĔĕĖėĜĝĞğĠġĤĥĨĩĪīĬĭİıĴĵĹĺĽľŁłŃŇňŌōŎŏŐőŒœŔŕŘřŚśŜŝŞşŠšŤťŨũŪūŬŭŮůŰűŴŵŶŷŸŹźŻżŽžƒˆˇ˘˙˚˛˜˝–—‘’‚“”„†‡•…‰‹›⁄€™−'
const MAX_STREET_NAME_WIDTH = 50

export default class StreetName extends React.Component {

  constructor (props) {
    super(props)

    this.lastSentCoords = null

    this.clickStreetName = this.clickStreetName.bind(this)
    this.updateCoords = this.updateCoords.bind(this)
  }

  componentDidMount () {
    window.addEventListener('resize', this.updateCoords)
  }

  componentWillUnmount () {
    window.removeEventListener('resize', this.updateCoords)
  }

  updateCoords () {
    var rect = this.streetName.getBoundingClientRect()
    const coords = {
      left: rect.left,
      width: rect.width
    }
    if (!this.lastSentCoords || coords.left !== this.lastSentCoords.left || coords.width !== this.lastSentCoords.width) {
      this.lastSentCoords = coords
      this.props.handleResize(coords)
    }
  }

  componentDidUpdate (nextProps, nextState) {
    this.updateCoords()
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

    if (!this.props.street.name) {
      return false
    }

    for (let character of this.props.street.name) {
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

    const newName = window.prompt(msg('PROMPT_NEW_STREET_NAME'), this.props.street.name)

    if (newName) {
      const street = Object.assign({}, this.props.street)
      street.name = StreetName.normalizeStreetName(newName)
      setAndSaveStreet(street)
    }
  }

  render () {
    let classString = 'street-name-text ' + (!this.needsUnicodeFont() ? '' : 'fallback-unicode-font')
    return (
      <div
        ref={(ref) => { this.streetName = ref }}
        id='street-name'
        className='street-name'
        onClick={this.clickStreetName}
      >
        <div className={classString}>{StreetName.normalizeStreetName(this.props.street.name)}</div>
      </div>
    )
  }
}

StreetName.propTypes = {
  allowEditing: React.PropTypes.bool,
  street: React.PropTypes.any,
  handleResize: React.PropTypes.func
}

