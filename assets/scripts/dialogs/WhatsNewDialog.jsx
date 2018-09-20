import React from 'react'
import PropTypes from 'prop-types'
import { FormattedMessage } from 'react-intl'

export default class WhatsNewDialog extends React.PureComponent {
  static propTypes = {
    closeDialog: PropTypes.func
  }

  render () {
    return (
      <div className="dialog-type-2 whats-new-dialog">
        <header>
          <h1>
            <FormattedMessage id="dialogs.whatsnew.heading" defaultMessage="What’s new in Streetmix?" />
          </h1>
        </header>
        <div className="dialog-content dialog-content-bleed">
          <iframe src="/pages/whats-new/" />
        </div>
        <footer onClick={this.props.closeDialog}>
          <FormattedMessage id="btn.close" defaultMessage="Close" />
        </footer>
      </div>
    )
  }
}
