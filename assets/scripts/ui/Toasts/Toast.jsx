import React from 'react'
import PropTypes from 'prop-types'
import CloseButton from '../CloseButton'
import './Toast.scss'

Toast.propTypes = {
  item: PropTypes.shape({
    type: PropTypes.oneOf(['success', 'warning']),
    message: PropTypes.string.isRequired,
    title: PropTypes.string,
    action: PropTypes.string
  }),
  setRef: PropTypes.func.isRequired,
  handleClose: PropTypes.func.isRequired,
  handleAction: PropTypes.func
}

function Toast (props) {
  const { item, setRef, handleClose, handleAction = () => {} } = props
  const { type, title, message, action } = item

  const classNames = ['toast']
  if (type) {
    classNames.push('toast-' + type)
  }

  return (
    <div className={classNames.join(' ')} ref={setRef}>
      <div className="toast-content">
        <CloseButton onClick={handleClose} />
        {title && <h3>{title}</h3>}
        <p>{message}</p>
        {action && (
          <button className="toast-action" onClick={handleAction}>
            {action}
          </button>
        )}
      </div>
    </div>
  )
}

export default Toast
