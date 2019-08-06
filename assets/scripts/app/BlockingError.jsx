/**
 * BlockingError.jsx
 *
 * Displays a blocking error message on top of the application.
 *
 * @module BlockingError
 */
import React from 'react'
import { connect } from 'react-redux'
import { FormattedMessage, FormattedHTMLMessage } from 'react-intl'
import Avatar from '../users/Avatar'
import {
  goReload,
  goHome,
  goNewStreet,
  goExampleStreet
} from './routing'
import { goReloadClearSignIn } from '../users/authentication'
import { ERRORS } from './errors'
import PropTypes from 'prop-types'

export class BlockingError extends React.Component {
  static propTypes = {
    errorType: PropTypes.number,
    street: PropTypes.object
  }

  render () {
    let title = ''
    let description = ''

    const homeButton =
      <button onClick={goHome}>
        <FormattedMessage id="error.button.home" defaultMessage="Go to the homepage" />
      </button>
    const linkToUser = (street) => {
      return street && street.creatorId ? <a href={'/' + street.creatorId}><Avatar userId={street.creatorId} />{street.creatorId}</a> : null
    }
    const reloadButton =
      <button onClick={goReload}>
        <FormattedMessage id="error.button.reload" defaultMessage="Reload the page" />
      </button>
    const tryAgainButton =
      <button onClick={goNewStreet}>
        <FormattedMessage id="error.button.try-again" defaultMessage="Try again" />
      </button>
    const pleaseLetUsKnow = <FormattedHTMLMessage
      id="error.please-try-again"
      defaultMessage="Please try again later or let us know via <a target='_blank' rel='noopener noreferrer' href='{email}'>email</a> or <a target='_blank' rel='noopener noreferrer' href='{tweet}'>Twitter</a>."
      values={{
        email: 'mailto:hello@streetmix.net',
        tweet: 'https://twitter.com/intent/tweet?text=@streetmix'
      }}
    />

    switch (this.props.errorType) {
      case ERRORS.NOT_FOUND:
        title = <FormattedMessage id="error.page-not-found-title" defaultMessage="Page not found." />
        description =
          <React.Fragment>
            <FormattedMessage id="error.page-not-found-description" defaultMessage="Oh, boy. There is no page with this address!" />
            <br />
            {homeButton}
          </React.Fragment>
        break
      case ERRORS.STREET_404:
        title = <FormattedMessage id="error.street-not-found-title" defaultMessage="Street not found." />
        description =
          <React.Fragment>
            <FormattedMessage id="error.street-not-found-description" defaultMessage="Oh, boy. There is no street with this link!" />
            <br />
            {homeButton}
          </React.Fragment>
        break
      case ERRORS.STREET_404_BUT_LINK_TO_USER:
        title = <FormattedMessage id="error.street-not-found-title" defaultMessage="Street not found." />
        description =
          <React.Fragment>
            <FormattedMessage
              id="error.street-not-found-but-user-description"
              defaultMessage="There is no street with this link! But you can look at other streets by {user}"
              values={{
                user: linkToUser(this.props.street)
              }}
            />
            <br />
            {homeButton}
          </React.Fragment>
        break
      case ERRORS.STREET_410_BUT_LINK_TO_USER:
        title = <FormattedMessage id="error.street-deleted-title" defaultMessage="This street has been deleted." />
        description =
          <React.Fragment>
            <FormattedMessage
              id="error.street-deleted-description"
              defaultMessage="There is no longer a street with this link, but you can look at other streets by {user}"
              values={{
                user: linkToUser(this.props.street)
              }}
            />
            <br />
            {homeButton}
          </React.Fragment>
        break
      case ERRORS.SIGN_OUT:
        title = <FormattedMessage id="error.sign-out-title" defaultMessage="You are now signed out." />
        description = homeButton
        break
      case ERRORS.NO_STREET:
        title = <FormattedMessage id="msg.no-street" defaultMessage="No street selected." />
        break
      case ERRORS.GALLERY_STREET_FAILURE:
        title = <FormattedMessage id="msg.having-trouble" defaultMessage="Having trouble…" />
        description = <FormattedMessage id="error.gallery-street-failure-description" defaultMessage="We’re having trouble loading this street." />
        break
      case ERRORS.FORCE_RELOAD_SIGN_OUT:
        title = <FormattedMessage id="error.reload-sign-out-title" defaultMessage="You signed out in another window." />
        description =
          <React.Fragment>
            <FormattedMessage id="error.please-reload" defaultMessage="Please reload this page before continuing." />
            <br />
            {reloadButton}
          </React.Fragment>
        break
      case ERRORS.FORCE_RELOAD_SIGN_OUT_401:
        title = <FormattedMessage id="error.reload-sign-out-title" defaultMessage="You signed out in another window." />
        description =
          <React.Fragment>
            <FormattedMessage id="error.please-reload" defaultMessage="Please reload this page before continuing." />
            <br />
            <FormattedMessage id="error.error-code" defaultMessage="(Error {code}.)" values={{ code: 'RM2' }} />
            <br />
            <button onClick={goReloadClearSignIn}>
              <FormattedMessage id="error.button.reload" defaultMessage="Reload the page" />
            </button>
          </React.Fragment>
        break
      case ERRORS.FORCE_RELOAD_SIGN_IN:
        title = <FormattedMessage id="error.reload-sign-in-title" defaultMessage="You signed in in another window." />
        description =
          <React.Fragment>
            <FormattedMessage id="error.please-reload" defaultMessage="Please reload this page before continuing." />
            <br />
            {reloadButton}
          </React.Fragment>
        break
      case ERRORS.STREET_DELETED_ELSEWHERE:
        title = <FormattedMessage id="error.street-deleted-elsewhere-title" defaultMessage="This street has been deleted elsewhere." />
        description =
          <React.Fragment>
            <FormattedMessage id="error.street-deleted-elsewhere-description" defaultMessage="This street has been deleted in another browser." />
            <br />
            {homeButton}
          </React.Fragment>
        break
      case ERRORS.NEW_STREET_SERVER_FAILURE:
        title = <FormattedMessage id="msg.having-trouble" defaultMessage="Having trouble…" />
        description =
          <React.Fragment>
            <FormattedMessage id="msg.trouble-loading" defaultMessage="We’re having trouble loading Streetmix." />
            <br />
            {tryAgainButton}
          </React.Fragment>
        break
      case ERRORS.SIGN_IN_SERVER_FAILURE:
        title = <FormattedMessage id="msg.having-trouble" defaultMessage="Having trouble…" />
        description =
          <React.Fragment>
            <FormattedMessage id="msg.trouble-loading" defaultMessage="We’re having trouble loading Streetmix." />
            <br />
            <FormattedMessage id="error.error-code" defaultMessage="(Error {code}.)" values={{ code: '15A' }} />
            <br />
            {tryAgainButton}
          </React.Fragment>
        break
      case ERRORS.SIGN_IN_401:
        title = <FormattedMessage id="msg.having-trouble" defaultMessage="Having trouble…" />
        description =
          <React.Fragment>
            <FormattedMessage id="msg.trouble-loading" defaultMessage="We’re having trouble loading Streetmix." />
            <br />
            <FormattedMessage id="error.error-code" defaultMessage="(Error {code}.)" values={{ code: 'RM1' }} />
            <br />
            {tryAgainButton}
          </React.Fragment>
        break
      case ERRORS.STREET_DATA_FAILURE:
        title = <FormattedMessage id="msg.having-trouble" defaultMessage="Having trouble…" />
        description =
          <React.Fragment>
            <FormattedMessage id="msg.trouble-loading" defaultMessage="We’re having trouble loading Streetmix." />
            <br />
            <FormattedMessage id="error.error-code" defaultMessage="(Error {code}.)" values={{ code: '9B' }} />
            <br />
            {tryAgainButton}
          </React.Fragment>
        break
      case ERRORS.ACCESS_DENIED:
        title = <FormattedMessage id="error.access-denied-title" defaultMessage="You are not signed in." />
        description =
          <React.Fragment>
            <FormattedMessage id="error.access-denied-description" defaultMessage="You cancelled the sign in process." />
            <br />
            {homeButton}
          </React.Fragment>
        break
      case ERRORS.AUTH_PROBLEM_NO_TWITTER_REQUEST_TOKEN:
      case ERRORS.AUTH_PROBLEM_NO_TWITTER_ACCESS_TOKEN:
      case ERRORS.AUTH_PROBLEM_NO_ACCESS_TOKEN:
      case ERRORS.AUTH_PROBLEM_API_PROBLEM:
        title = <FormattedMessage id="error.auth-api-problem-title" defaultMessage="There was a problem with signing you in." />
        description =
          <React.Fragment>
            <FormattedMessage id="error.auth-api-problem-description" defaultMessage="There was a problem with authentication." />
            &nbsp;{pleaseLetUsKnow}
            <br />
            {homeButton}
          </React.Fragment>
        break
      case ERRORS.UNSUPPORTED_BROWSER:
        title = <FormattedMessage id="error.unsupported-browser-title" defaultMessage="Streetmix doesn’t work on your browser." />
        description =
          <React.Fragment>
            <p>
              <FormattedHTMLMessage
                id="error.unsupported-browser-description"
                defaultMessage="Sorry about that. You might want to try <a target='_blank' rel='noopener noreferrer' href='{chromeUrl}'>Chrome</a>, <a target='_blank' rel='noopener noreferrer' href='{firefoxUrl}'>Firefox</a>, <a target='_blank' rel='noopener noreferrer' href='{edgeUrl}'>Microsoft Edge</a>, or Safari."
                values={{
                  chromeUrl: 'https://www.google.com/chrome',
                  firefoxUrl: 'https://www.mozilla.org/firefox',
                  edgeUrl: 'https://www.microsoft.com/en-us/windows/microsoft-edge'
                }}
              />
            </p>
            <p>
              <FormattedHTMLMessage
                id="error.unsupported-browser-internet-explorer"
                defaultMessage="Are you on Internet Explorer? <a target='_blank' rel='noopener noreferrer' href='{readmeIEUrl}'>Find out more.</a>"
                values={{
                  readmeIEUrl: 'https://streetmix.readthedocs.io/en/latest/support/faq/#does-streetmix-support-internet-explorer'
                }}
              />
            </p>
            <p>
              <FormattedHTMLMessage
                id="error.unsupported-browser-contact-us"
                defaultMessage="If you think your browser should be supported, please contact us via <a target='_blank' rel='noopener noreferrer' href='{email}'>email</a>."
                values={{
                  email: 'mailto:hello@streetmix.net'
                }}
              />
            </p>
          </React.Fragment>
        break
      case ERRORS.CANNOT_CREATE_NEW_STREET_ON_PHONE:
        title = <FormattedMessage id="error.cannot-create-new-street-on-phone-title" defaultMessage="Streetmix works on tablets and desktops only." />
        description =
          <React.Fragment>
            <FormattedMessage id="error.cannot-create-new-street-on-phone-description" defaultMessage="If you follow another link to a specific street, you can view it on your phone – but you cannot yet create new streets." />
            <br />
            <button onClick={goExampleStreet}>
              <FormattedMessage id="error.button.view-example" defaultMessage="View an example street" />
            </button>
          </React.Fragment>
        break
      default: // also ERRORS.GENERIC_ERROR
        title = <FormattedMessage id="error.generic-error-title" defaultMessage="Something went wrong." />
        description =
          <React.Fragment>
            <FormattedMessage id="error.generic-error-description" defaultMessage="We’re sorry – something went wrong." />
            &nbsp;{pleaseLetUsKnow}
            <br />
            {homeButton}
          </React.Fragment>
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
