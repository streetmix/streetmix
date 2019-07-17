/**
 * Custom stylized checkbox component, so we control the look and
 * feel instead of relying on browser's default styles.
 */
import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { ICON_CHECK } from '../ui/icons'
import './Checkbox.scss'

// This stores an incrementing number for unique IDs.
let idCounter = 0

Checkbox.propTypes = {
  // Child nodes are wrapped in <label> when rendered.
  children: PropTypes.node.isRequired,

  // Initial checked state of the input.
  checked: PropTypes.bool,

  // Whether or not the input is disabled. Unlike vanilla HTML, this component
  // also changes the appearance of labels of disabled checkboxes.
  disabled: PropTypes.bool,

  // The value of a checkbox input can be optionally set.
  // By default, browsers set checked inputs to have a string value of "on".
  value: PropTypes.string,

  // The handler function that's called when the value of the input changes.
  onChange: PropTypes.func,

  // An `id` is associates a `label` with an `input` element. If you don't
  // provide one, the component automatically generates a unique ID. IDs
  // are meant "for internal use only".
  id: PropTypes.string
}

Checkbox.defaultProps = {
  checked: false,
  disabled: false,
  onChange: () => {}
}

function Checkbox (props) {
  // An `id` is required to associate a `label` with an `input` element.
  // You can provide one manually in props, otherwise, this component
  // will generate a unique ID on each render.
  const id = props.id || `checkbox-id-${idCounter++}`

  // This is a controlled component. The `useState` hook maintains
  // this component's internal state, and sets the initial state
  // based on the `checked` prop (which is `false` by default).
  const [ isChecked, setChecked ] = useState(props.checked)

  // When the value is changed, we update the state, and we also call
  // any `onChange` handler that is provided by the parent via props.
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
      <label htmlFor={id}>
        {props.children}
      </label>
      {/* The visual state of this checkbox is affected by the value of the input, via CSS. */}
      <FontAwesomeIcon icon={ICON_CHECK} />
    </div>
  )
}

export default Checkbox
