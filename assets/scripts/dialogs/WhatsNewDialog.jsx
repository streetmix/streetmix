import React from 'react'
import PropTypes from 'prop-types'
import { FormattedMessage } from 'react-intl'

export default class WhatsNewDialog extends React.PureComponent {
  static propTypes = {
    closeDialog: PropTypes.func
  }

  render () {
    return (
      <div className="whats-new-dialog">
        <header>
          <h1>
            <FormattedMessage id="dialogs.whatsnew.heading" defaultMessage="What’s new in Streetmix?&lrm;" />
          </h1>
        </header>
        <div className="dialog-content dialog-content-bleed">
          <iframe src="/pages/whats-new/" />
        </div>
        <button className="dialog-primary-action" onClick={this.props.closeDialog}>
          <FormattedMessage id="btn.close" defaultMessage="Close" />
        </button>
      </div>
    )
  }
}
