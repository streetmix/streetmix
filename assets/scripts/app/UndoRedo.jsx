import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { IntlProvider, FormattedMessage } from 'react-intl'
import { undo, redo, isUndoAvailable, isRedoAvailable } from '../streets/undo_stack'

export class UndoRedo extends React.Component {
  static propTypes = {
    undo: PropTypes.object,
    locale: PropTypes.object
  }

  constructor (props) {
    super(props)

    this.state = {
      undoAvailable: false,
      redoAvailable: false
    }
  }

  componentWillReceiveProps (nextProps) {
    // Update undo or redo buttons if the undo position or stack has changed.
    if (this.props.undo.position !== nextProps.undo.position || this.props.undo.stack !== nextProps.undo.stack) {
      this.setState({
        undoAvailable: isUndoAvailable(),
        redoAvailable: isRedoAvailable()
      })
    }
  }

  render () {
    return (
      <IntlProvider
        locale={this.props.locale.locale}
        messages={this.props.locale.messages}
      >
        <React.Fragment>
          <button onClick={undo} disabled={!this.state.undoAvailable}>
            <FormattedMessage id="btn.undo" defaultMessage="Undo" />
          </button>
          <button onClick={redo} disabled={!this.state.redoAvailable}>
            <FormattedMessage id="btn.redo" defaultMessage="Redo" />
          </button>
        </React.Fragment>
      </IntlProvider>
    )
  }
}

function mapStateToProps (state) {
  return {
    undo: state.undo,
    locale: state.locale
  }
}

export default connect(mapStateToProps)(UndoRedo)
