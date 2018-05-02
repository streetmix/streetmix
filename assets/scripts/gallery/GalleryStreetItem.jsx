/**
 * GalleryStreetItem
 *
 * One street in the gallery
 */
import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { injectIntl, intlShape } from 'react-intl'
import StreetName from '../streets/StreetName'
import DateTimeRelative from '../app/DateTimeRelative'
import CloseButton from '../ui/CloseButton'
import { drawStreetThumbnail } from './thumbnail'
import { getStreetUrl } from '../streets/data_model'

const THUMBNAIL_WIDTH = 180
const THUMBNAIL_HEIGHT = 110
const THUMBNAIL_MULTIPLIER = 0.1 * 2

export class GalleryStreetItem extends React.Component {
  static propTypes = {
    street: PropTypes.object.isRequired,
    intl: intlShape.isRequired,
    showStreetOwner: PropTypes.bool,
    selected: PropTypes.bool,
    allowDelete: PropTypes.bool,
    handleSelect: PropTypes.func,
    handleDelete: PropTypes.func,
    dpi: PropTypes.number
  }

  static defaultProps = {
    showStreetOwner: true,
    selected: false,
    allowDelete: false,
    handleSelect: () => {}, // no-op
    handleDelete: () => {}, // no-op
    dpi: 1
  }

  componentDidMount () {
    if (!this.props.street.data) return

    this.drawCanvas()
  }

  drawCanvas = () => {
    const ctx = this.thumbnailEl.getContext('2d')

    // TODO: document magic number 2
    drawStreetThumbnail(ctx, this.props.street.data.street,
      THUMBNAIL_WIDTH * 2, THUMBNAIL_HEIGHT * 2, this.props.dpi, THUMBNAIL_MULTIPLIER, true, false, true, false, false)
  }

  onClickGalleryStreet = (event) => {
    event.preventDefault()
    if (event.shiftKey || event.ctrlKey || event.metaKey) return
    this.props.handleSelect(this.props.street.id)
  }

  onClickDeleteGalleryStreet = (event) => {
    event.preventDefault()
    event.stopPropagation()

    const street = this.props.street
    const message = this.props.intl.formatMessage({
      id: 'prompt.delete-street',
      defaultMessage: 'Are you sure you want to permanently delete {streetName}? This cannot be undone.'
    }, {
      streetName: street.name || this.props.intl.formatMessage({ id: 'street.default-name', defaultMessage: 'Unnamed St' })
    })

    if (window.confirm(message)) {
      this.props.handleDelete(street.id)
    }
  }

  render () {
    const className = (this.props.selected) ? 'selected' : ''

    // TODO: handle data errors better
    if (!this.props.street.data) {
      console.error('No street data!', this.props.street)
      return null
    }

    return (
      <div className="gallery-street-item">
        <a
          href={getStreetUrl(this.props.street)}
          onClick={this.onClickGalleryStreet}
          className={className}
        >
          {/* TODO: document magic number 2 */}
          <canvas
            width={THUMBNAIL_WIDTH * this.props.dpi * 2}
            height={THUMBNAIL_HEIGHT * this.props.dpi * 2}
            ref={(ref) => { this.thumbnailEl = ref }}
          />

          <StreetName name={this.props.street.name} />

          <span className="gallery-street-item-date">
            <DateTimeRelative value={this.props.street.updatedAt} />
          </span>

          {/* Show street creator (owner) or 'Anonymous' */ }
          {this.props.showStreetOwner &&
            <span className="gallery-street-item-creator">
              {this.props.street.creatorId || this.props.intl.formatMessage({ id: 'users.anonymous', defaultMessage: 'Anonymous' })}
            </span>
          }

          {/* Only show delete button if allowed, e.g. if user is owner of the street */ }
          {this.props.allowDelete &&
            <CloseButton
              className="gallery-street-item-delete"
              title={this.props.intl.formatMessage({ id: 'gallery.delete-street-tooltip', defaultMessage: 'Delete street' })}
              onClick={this.onClickDeleteGalleryStreet}
            />
          }
        </a>
      </div>
    )
  }
}

function mapStateToProps (state) {
  return {
    dpi: state.system.hiDpi
  }
}

export default injectIntl(connect(mapStateToProps)(GalleryStreetItem))
