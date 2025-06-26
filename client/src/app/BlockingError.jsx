/**
 * BlockingError.jsx
 *
 * Displays a blocking error message on top of the application.
 *
 * @module BlockingError
 */
import React from 'react'
import { useSelector } from 'react-redux'
import { FormattedMessage } from 'react-intl'
import ExternalLink from '../ui/ExternalLink'
import Avatar from '../users/Avatar'
import { goReload, goHome, goNewStreet, goExampleStreet } from './routing'
import { goReloadClearSignIn, doSignIn } from '../users/authentication'
import { ERRORS } from './errors'

function BlockingError (props) {
  const errorType = useSelector((state) => state.errors.errorType)
  const street = useSelector((state) => state.street)

  let title, description

  switch (errorType) {
    case ERRORS.NOT_FOUND:
      title = <FormattedMessage id="error.not-found.title" defaultMessage="Not found" />
      description = <FormattedMessage id="error.not-found.description" defaultMessage="The requested resource could not be found." />
      break
    case ERRORS.SIGN_OUT:
      title = <FormattedMessage id="error.sign-out.title" defaultMessage="Signed out" />
      description = <FormattedMessage id="error.sign-out.description" defaultMessage="You have been signed out." />
      break
    case ERRORS.NO_STREET:
      title = <FormattedMessage id="error.no-street.title" defaultMessage="No street" />
      description = <FormattedMessage id="error.no-street.description" defaultMessage="The street you were looking at no longer exists." />
      break
    case ERRORS.FORCE_RELOAD_SIGN_IN:
      title = <FormattedMessage id="error.force-reload-sign-in.title" defaultMessage="Sign in required" />
      description = <FormattedMessage id="error.force-reload-sign-in.description" defaultMessage="You need to sign in again." />
      break
    case ERRORS.FORCE_RELOAD_SIGN_OUT:
      title = <FormattedMessage id="error.force-reload-sign-out.title" defaultMessage="Sign out required" />
      description = <FormattedMessage id="error.force-reload-sign-out.description" defaultMessage="You need to sign out and sign in again." />
      break
    case ERRORS.STREET_DELETED_ELSEWHERE:
      title = <FormattedMessage id="error.street-deleted-elsewhere.title" defaultMessage="Street deleted" />
      description = <FormattedMessage id="error.street-deleted-elsewhere.description" defaultMessage="The street you were looking at has been deleted elsewhere." />
      break
    case ERRORS.NEW_STREET_SERVER_FAILURE:
      title = <FormattedMessage id="error.new-street-server-failure.title" defaultMessage="Server failure" />
      description = <FormattedMessage id="error.new-street-server-failure.description" defaultMessage="There was a problem creating a new street." />
      break
    case ERRORS.ACCESS_DENIED:
      title = <FormattedMessage id="error.access-denied.title" defaultMessage="Access denied" />
      description = <FormattedMessage id="error.access-denied.description" defaultMessage="You do not have permission to access this resource." />
      break
    case ERRORS.AUTH_PROBLEM_NO_TWITTER_REQUEST_TOKEN:
      title = <FormattedMessage id="error.auth-problem-no-twitter-request-token.title" defaultMessage="Authentication problem" />
      description = <FormattedMessage id="error.auth-problem-no-twitter-request-token.description" defaultMessage="There was a problem with the authentication request token." />
      break
    case ERRORS.AUTH_PROBLEM_NO_TWITTER_ACCESS_TOKEN:
      title = <FormattedMessage id="error.auth-problem-no-twitter-access-token.title" defaultMessage="Authentication problem" />
      description = <FormattedMessage id="error.auth-problem-no-twitter-access-token.description" defaultMessage="There was a problem with the authentication access token." />
      break
    case ERRORS.AUTH_PROBLEM_API_PROBLEM:
      title = <FormattedMessage id="error.auth-problem-api-problem.title" defaultMessage="Authentication API problem" />
      description = <FormattedMessage id="error.auth-problem-api-problem.description" defaultMessage="There was a problem with the authentication API." />
      break
    case ERRORS.GENERIC_ERROR:
      title = <FormattedMessage id="error.generic-error.title" defaultMessage="Error" />
      description = <FormattedMessage id="error.generic-error.description" defaultMessage="An error occurred." />
      break
    case ERRORS.UNSUPPORTED_BROWSER:
      title = <FormattedMessage id="error.unsupported-browser.title" defaultMessage="Unsupported browser" />
      description = <FormattedMessage id="error.unsupported-browser.description" defaultMessage="Your browser is not supported." />
      break
    case ERRORS.STREET_404:
      title = <FormattedMessage id="error.street-404.title" defaultMessage="Street not found" />
      description = <FormattedMessage id="error.street-404.description" defaultMessage="The street you were looking for could not be found." />
      break
    case ERRORS.STREET_404_BUT_LINK_TO_USER:
      title = <FormattedMessage id="error.street-404-but-link-to-user.title" defaultMessage="Street not found" />
      description = <FormattedMessage id="error.street-404-but-link-to-user.description" defaultMessage="The street you were looking for could not be found. You can view other streets by this user." />
      break
    case ERRORS.STREET_410_BUT_LINK_TO_USER:
      title = <FormattedMessage id="error.street-410-but-link-to-user.title" defaultMessage="Street deleted" />
      description = <FormattedMessage id="error.street-410-but-link-to-user.description" defaultMessage="The street you were looking for has been deleted. You can view other streets by this user." />
      break
    case ERRORS.CANNOT_CREATE_NEW_STREET_ON_PHONE:
      title = <FormattedMessage id="error.cannot-create-new-street-on-phone.title" defaultMessage="Cannot create new street" />
      description = <FormattedMessage id="error.cannot-create-new-street-on-phone.description" defaultMessage="You cannot create a new street on a phone." />
      break
    case ERRORS.SIGN_IN_SERVER_FAILURE:
      title = <FormattedMessage id="error.sign-in-server-failure.title" defaultMessage="Sign in failure" />
      description = <FormattedMessage id="error.sign-in-server-failure.description" defaultMessage="There was a problem signing in." />
      break
    case ERRORS.SIGN_IN_401:
      title = <FormattedMessage id="error.sign-in-401.title" defaultMessage="Sign in failure" />
      description = <FormattedMessage id="error.sign-in-401.description" defaultMessage="You are not authorized to sign in." />
      break
    case ERRORS.STREET_DATA_FAILURE:
      title = <FormattedMessage id="error.street-data-failure.title" defaultMessage="Street data failure" />
      description = <FormattedMessage id="error.street-data-failure.description" defaultMessage="There was a problem loading the street data." />
      break
    case ERRORS.GALLERY_STREET_FAILURE:
      title = <FormattedMessage id="error.gallery-street-failure.title" defaultMessage="Gallery street failure" />
      description = <FormattedMessage id="error.gallery-street-failure.description" defaultMessage="There was a problem loading the gallery street." />
      break
    case ERRORS.AUTH_PROBLEM_NO_ACCESS_TOKEN:
      title = <FormattedMessage id="error.auth-problem-no-access-token.title" defaultMessage="Authentication problem" />
      description = <FormattedMessage id="error.auth-problem-no-access-token.description" defaultMessage="There was a problem with the authentication access token." />
      break
    case ERRORS.AUTH_EXPIRED:
      title = <FormattedMessage id="error.auth-expired.title" defaultMessage="Authentication expired" />
      description = <FormattedMessage id="error.auth-expired.description" defaultMessage="Your authentication has expired. Please sign in again." />
      break
    default:
      title = <FormattedMessage id="error.unknown.title" defaultMessage="Unknown error" />
      description = <FormattedMessage id="error.unknown.description" defaultMessage="An unknown error occurred." />
      break
  }

  return errorType
    ? (
      <div id="error">
        <div className="clouds-background">
          <div className="rear-clouds" />
          <div className="front-clouds" />
        </div>
        <div className="error-content">
          <h1>{title}</h1>
          {description}
        </div>
      </div>
      )
    : null
}

export default BlockingError
