/**
 * BlockingError.jsx
 *
 * Displays a blocking error message on top of the application.
 *
 * @module BlockingError
 */
import React from 'react'
import { connect } from 'react-redux'
import Avatar from '../users/Avatar'
import {
  goReload,
  goHome,
  goNewStreet,
  goExampleStreet,
  goSignIn
} from './routing'
import { goReloadClearSignIn } from '../users/authentication'
import { ERRORS } from './errors'
import PropTypes from 'prop-types'

class BlockingError extends React.Component {
  static propTypes = {
    errorType: PropTypes.number,
    street: PropTypes.object
  }

  render () {
    let title = ''
    let description = ''

    const homeButton = <button id="error-home" onClick={goHome}>Go to the homepage</button>
    const linkToUser = (street) => {
      return street && street.creatorId ? <a href={'/' + street.creatorId}><Avatar userId={street.creatorId} />{street.creatorId}</a> : null
    }
    const signInButton = <button id="error-sign-in" onClick={goSignIn}>Sign in again</button>
    const reloadButton = <button id="error-reload" onClick={goReload}>Reload the page</button>
    const tryAgainButton = <button id="error-new" onClick={goNewStreet}>Try again</button>
    const generalHelpButtons = <React.Fragment>
      <a target="_blank" href="mailto:hello@streetmix.net">email</a> or <a target="_blank" href="https://twitter.com/intent/tweet?text=@streetmix">Twitter</a>. <br />
      <button id="error-home" onClick={goHome}>Go to the homepage</button>
    </React.Fragment>

    switch (this.props.errorType) {
      case ERRORS.NOT_FOUND:
        title = 'Page not found.'
        description = <React.Fragment>Oh, boy. There is no page with this address!<br />{homeButton}</React.Fragment>
        break
      case ERRORS.STREET_404:
        title = 'Street not found.'
        description = <React.Fragment>Oh, boy. There is no street with this link!<br />{homeButton}</React.Fragment>
        break
      case ERRORS.STREET_404_BUT_LINK_TO_USER:
        title = 'Street not found.'
        description = <React.Fragment>There is no street with this link! But you can look at other streets
          by {linkToUser(this.props.street)} <br />{homeButton}</React.Fragment>
        break
      case ERRORS.STREET_410_BUT_LINK_TO_USER:
        title = 'This street has been deleted.'
        description = <React.Fragment>There is no longer a street with this link, but you can look at other streets
          by {linkToUser(this.props.street)} <br />{homeButton}</React.Fragment>
        break
      case ERRORS.SIGN_OUT:
        title = 'You are now signed out.'
        description = <React.Fragment>{signInButton} {homeButton}</React.Fragment>
        break
      case ERRORS.NO_STREET:
        title = 'No street selected.'
        break
      case ERRORS.STREET_FETCH_FAILURE:
        title = 'Having trouble…'
        description = <React.Fragment>We’re having trouble loading street.</React.Fragment>
        break
      case ERRORS.FORCE_RELOAD_SIGN_OUT:
        title = 'You signed out in another window.'
        description = <React.Fragment>Please reload this page before continuing.<br />{reloadButton}</React.Fragment>
        break
      case ERRORS.FORCE_RELOAD_SIGN_OUT_401:
        title = 'You signed out in another window.'
        description = <React.Fragment>Please reload this page before continuing.<br />(Error RM2.)<br />
          <button id="error-clear-sign-in-reload" onClick={goReloadClearSignIn}>Reload the page</button>
        </React.Fragment>
        break
      case ERRORS.FORCE_RELOAD_SIGN_IN:
        title = 'You signed in in another window.'
        description = <React.Fragment>Please reload this page before continuing.<br />{reloadButton}</React.Fragment>
        break
      case ERRORS.STREET_DELETED_ELSEWHERE:
        title = 'This street has been deleted elsewhere.'
        description = <React.Fragment>This street has been deleted in another browser.<br />{homeButton}</React.Fragment>
        break
      case ERRORS.NEW_STREET_SERVER_FAILURE:
        title = 'Having trouble…'
        description = <React.Fragment>We’re having trouble loading Streetmix.<br />{tryAgainButton}</React.Fragment>
        break
      case ERRORS.SIGN_IN_SERVER_FAILURE:
        title = 'Having trouble…'
        description =
          <React.Fragment>We’re having trouble loading Streetmix.<br />(Error 15A.)<br />{tryAgainButton}</React.Fragment>
        break
      case ERRORS.SIGN_IN_401:
        title = 'Having trouble…'
        description =
          <React.Fragment>We’re having trouble loading Streetmix.<br />(Error RM1.)<br />{tryAgainButton}</React.Fragment>
        break
      case ERRORS.STREET_DATA_FAILURE:
        title = 'Having trouble…'
        description =
          <React.Fragment>We’re having trouble loading Streetmix.<br />(Error 9B.)<br />{tryAgainButton}</React.Fragment>
        break
      case ERRORS.TWITTER_ACCESS_DENIED:
        title = 'You are not signed in.'
        description = <React.Fragment>You cancelled the Twitter sign in process.<br />{homeButton}</React.Fragment>
        break
      case ERRORS.AUTH_PROBLEM_NO_TWITTER_REQUEST_TOKEN:
      case ERRORS.AUTH_PROBLEM_NO_TWITTER_ACCESS_TOKEN:
      case ERRORS.AUTH_PROBLEM_API_PROBLEM:
        title = 'There was a problem with signing you in.'
        description =
          <React.Fragment>There was a problem with Twitter authentication. Please try again later or let us know
            via {generalHelpButtons}</React.Fragment>
        break
      case ERRORS.UNSUPPORTED_BROWSER:
        title = 'Streetmix doesn’t work on your browser.'
        description = <React.Fragment>
        Sorry about that. You might want to try <a target="_blank" href="http://www.google.com/chrome">Chrome</a>,&nbsp;
          <a target="_blank" href="http://www.mozilla.org/firefox">Firefox</a>,&nbsp;
          <a target="_blank" href="https://www.microsoft.com/en-us/windows/microsoft-edge">Microsoft Edge</a>, or Safari.
          <br /><br />Are you on Internet Explorer?&nbsp;
          <a target="_blank" href="https://streetmix.readme.io/docs/frequently-asked-questions/#internet-explorer">Find
            out more.</a><br /><br />
          If you think your browser should be supported, please contact us via&nbsp;
          <a target="_blank" href="mailto:hello@streetmix.net">email</a>.
        </React.Fragment>
        break
      case ERRORS.CANNOT_CREATE_NEW_STREET_ON_PHONE:
        title = 'Streetmix works on tablets and desktops only.'
        description =
          <React.Fragment>
            If you follow another link to a specific street, you can view it on your phone – but you
            cannot yet create new streets.
            <br />
            <button id="error-example" onClick={goExampleStreet}>View an example street</button>
          </React.Fragment>
        break
      default: // also ERRORS.GENERIC_ERROR
        title = 'Something went wrong.'
        description = <React.Fragment>We’re sorry – something went wrong. Please try again later or let us know
          via {generalHelpButtons}</React.Fragment>
        break
    }

    return this.props.errorType ? (
      <div id="error">
        <div className="clouds-background">
          <div className="rear-clouds" />
          <div className="front-clouds" />
        </div>
        <div className="error-content">
          <h1>{title}</h1>
          <div>{description}</div>
        </div>
      </div>
    ) : null
  }
}

function mapStateToProps (state) {
  return {
    errorType: state.errors.errorType,
    street: state.street
  }
}

export default connect(mapStateToProps)(BlockingError)
