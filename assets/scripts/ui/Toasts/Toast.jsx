import React from 'react'
import PropTypes from 'prop-types'
import CloseButton from '../CloseButton'
import './Toast.scss'

Toast.propTypes = {
  item: PropTypes.shape({
    mode: PropTypes.oneOf(['success', 'warning']),
    message: PropTypes.string,
    title: PropTypes.string,
    action: PropTypes.string
  }),
  setRef: PropTypes.func.isRequired,
  handleClose: PropTypes.func.isRequired,
  handleAction: PropTypes.func,
  children: PropTypes.node
}

function Toast (props) {
  const { item, setRef, handleClose, handleAction = () => {}, children } = props
  const { mode, title, message, action } = item

  const classNames = ['toast']
  if (mode) {
    classNames.push('toast-' + mode)
  }

  return (
    <div className={classNames.join(' ')} ref={setRef}>
      <div className="toast-content">
        <CloseButton onClick={handleClose} />
        {title && <h3>{title}</h3>}
        <p>{children || message}</p>
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
