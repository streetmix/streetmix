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
  className: PropTypes.string,
  children: PropTypes.node
}

function Toast (props) {
  const {
    item,
    setRef,
    handleClose,
    handleAction = () => {},
    className,
    children
  } = props
  const { mode, title, message, action } = item

  const classNames = ['toast']
  if (mode) {
    classNames.push('toast-' + mode)
  }
  if (className) {
    classNames.push(className)
  }

  return (
    <div className={classNames.join(' ')} ref={setRef}>
      <div className="toast-content">
        <CloseButton onClick={handleClose} />
        <div className="toast-body">
          {title && <h3>{title}</h3>}
          {children || <p className="toast-message">{message}</p>}
        </div>
        {action && (
          <div className="toast-action">
            <button onClick={handleAction}>{action}</button>
          </div>
        )}
      </div>
    </div>
  )
}

export default Toast
