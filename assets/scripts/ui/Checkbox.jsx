import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { ICON_CHECK } from '../ui/icons'
import './Checkbox.scss'

let idCounter = 0

function Checkbox (props) {
  const id = props.id || `checkbox-id-${idCounter++}`
  const [ isChecked, setChecked ] = useState(props.checked)
  const handleChange = (event) => {
    setChecked(!isChecked)
    props.onChange(event)
  }

  return (
    <div className="checkbox-item">
      <input
        type="checkbox"
        id={id}
        checked={isChecked}
        value={props.value}
        disabled={props.disabled}
        onChange={handleChange}
      />
      <label htmlFor={id} className={props.labelClassName}>
        {props.children}
      </label>
      <FontAwesomeIcon icon={ICON_CHECK} />
    </div>
  )
}

Checkbox.propTypes = {
  children: PropTypes.node,
  checked: PropTypes.bool,
  value: PropTypes.string,
  disabled: PropTypes.bool,
  onChange: PropTypes.func,
  id: PropTypes.string,
  labelClassName: PropTypes.string
}

Checkbox.defaultProps = {
  checked: false,
  disabled: false,
  onChange: () => {},
  labelClassName: ''
}

export default Checkbox
