import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { FormattedMessage } from 'react-intl'

FirstTimeNewStreet.propTypes = {
  touch: PropTypes.bool
}

FirstTimeNewStreet.defaultProps = {
  touch: false
}

function FirstTimeNewStreet (props) {
  return (
    <div className="welcome-panel-content first-time-new-street">
      <h1>
        <FormattedMessage
          id="dialogs.welcome.heading"
          defaultMessage="Welcome to Streetmix."
        />
      </h1>
      <p>
        <FormattedMessage
          id="dialogs.welcome.new.intro"
          defaultMessage="Design, remix, and share your neighborhood street.
            Add trees or bike paths, widen sidewalks or traffic lanes, learn
            how your decisions can impact your community."
        />
      </p>
      <p className="important">
        <FormattedMessage
          id="dialogs.welcome.new.instruct"
          defaultMessage="Start by moving some segments around with {pointer}."
          values={{
            pointer: (props.touch)
              ? (
                <FormattedMessage
                  id="dialogs.welcome.new.instruct-pointer-finger"
                  defaultMessage="your finger"
                />
              ) : (
                <FormattedMessage
                  id="dialogs.welcome.new.instruct-pointer-mouse"
                  defaultMessage="your mouse"
                />
              )
          }}
        />
      </p>
    </div>
  )
}

function mapStateToProps (state) {
  return {
    touch: state.system.touch
  }
}

export default connect(mapStateToProps)(FirstTimeNewStreet)
