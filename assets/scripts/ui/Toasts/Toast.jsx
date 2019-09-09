import React from 'react'
import PropTypes from 'prop-types'
import CloseButton from '../CloseButton'
import './Toast.scss'

Toast.propTypes = {
  item: PropTypes.shape({
    type: PropTypes.oneOf(['success', 'warning']),
    message: PropTypes.string.isRequired,
    title: PropTypes.string,
    action: PropTypes.string,
    handleAction: PropTypes.func
  }),
  setRef: PropTypes.func.isRequired,
  handleClose: PropTypes.func.isRequired
}

function Toast (props) {
  const { item, setRef, handleClose } = props
  const { type, title, message, action, handleAction = () => {} } = item

  const classNames = ['toast']
  if (type) {
    classNames.push('toast-' + type)
  }

  return (
    <div className={classNames.join(' ')} ref={setRef}>
      <div className="toast-content">
        <CloseButton onClick={handleClose} />
        {title && <h3>{title}</h3>}
        <p>
          {message}
          {action && (
            <button className="toast-action" onClick={handleAction}>
              {action}
            </button>
          )}
        </p>
      </div>
    </div>
  )
}

export default Toast
