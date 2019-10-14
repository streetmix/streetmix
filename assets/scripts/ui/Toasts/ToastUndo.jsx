import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { useIntl } from 'react-intl'
import Toast from './Toast'
import { undo } from '../../store/actions/undo'

// Renders a specific type of Toast with Undo button.
ToastUndo.propTypes = {
  item: PropTypes.shape({
    component: PropTypes.oneOf['TOAST_UNDO'],
    message: PropTypes.string.isRequired,
    action: PropTypes.string,
    handleAction: PropTypes.func
  }),
  setRef: PropTypes.func.isRequired,
  handleClose: PropTypes.func.isRequired,
  undo: PropTypes.func.isRequired
}

function ToastUndo (props) {
  const { item, setRef, handleClose, undo } = props
  const intl = useIntl()

  item.action = intl.formatMessage({
    id: 'btn.undo',
    defaultMessage: 'Undo'
  })

  item.handleAction = (event) => {
    undo()
    handleClose(event)
  }

  return (
    <Toast setRef={setRef} handleClose={handleClose} item={item} />
  )
}

const mapDispatchToProps = { undo }

export default connect(null, mapDispatchToProps)(ToastUndo)
