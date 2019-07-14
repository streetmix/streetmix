import React from 'react'
import { FormattedMessage } from 'react-intl'
import Dialog from './Dialog'
import './WhatsNewDialog.scss'

const WhatsNewDialog = () => (
  <Dialog>
    {(closeDialog) => (
      <div className="whats-new-dialog">
        <header>
          <h1>
            <FormattedMessage id="dialogs.whatsnew.heading" defaultMessage="What’s new in Streetmix?&lrm;" />
          </h1>
        </header>
        <div className="dialog-content dialog-content-bleed">
          <iframe src="/pages/whats-new/" />
        </div>
        <button className="dialog-primary-action" onClick={closeDialog}>
          <FormattedMessage id="btn.close" defaultMessage="Close" />
        </button>
      </div>
    )}
  </Dialog>
)

export default WhatsNewDialog
