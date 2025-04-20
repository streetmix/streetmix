/**
 * BlockingError.jsx
 *
 * Displays a blocking error message on top of the application.
 *
 * @module BlockingError
 */
import React from 'react'
import { FormattedMessage } from 'react-intl'

import { useSelector } from '../store/hooks'
import { useGetUserQuery } from '../store/services/api'
import Button from '../ui/Button'
import ExternalLink from '../ui/ExternalLink'
import Avatar from '../users/Avatar'
import { doSignIn } from '../users/authentication'
import { goReload, goHome, goNewStreet, goExampleStreet } from './routing'
import { ERRORS } from './errors'

import type { StreetState } from '@streetmix/types'

function BlockingError (): React.ReactElement | null {
  const errorType = useSelector((state) => state.errors.errorType)
  const street = useSelector((state) => state.street)
  const { data: creatorProfile } = useGetUserQuery(street.creatorId)

  let title: React.ReactElement | string = ''
  let description: React.ReactElement | string = ''
  let cta: React.ReactElement | string = ''

  const homeButton = (
    <Button primary={true} onClick={goHome}>
      <FormattedMessage
        id="error.button.return"
        defaultMessage="Return to Streetmix"
      />
    </Button>
  )
  const linkToUser = (street: StreetState): React.ReactElement | null => {
    return street?.creatorId !== null
      ? (
        <a href={'/' + street.creatorId}>
          <Avatar userId={street.creatorId} />
          {creatorProfile?.displayName ?? street.creatorId}
        </a>
        )
      : null
  }
  const reloadButton = (
    <Button primary={true} onClick={goReload}>
      <FormattedMessage
        id="error.button.reload"
        defaultMessage="Reload the page"
      />
    </Button>
  )
  const tryAgainButton = (
    <Button primary={true} onClick={goNewStreet}>
      <FormattedMessage
        id="error.button.try-again"
        defaultMessage="Try again"
      />
    </Button>
  )
  const signInButton = (
    <Button primary={true} onClick={doSignIn}>
      <FormattedMessage id="menu.item.sign-in" defaultMessage="Sign in" />
    </Button>
  )
  const pleaseLetUsKnow = (
    <FormattedMessage
      id="error.please-try-again-contact-us"
      defaultMessage="Please try again later. If you still need help, please <a>contact us</a>."
      values={{
        a: (chunks) => (
          <ExternalLink href="https://docs.streetmix.net/community">
            {chunks}
          </ExternalLink>
        )
      }}
    />
  )
  const needHelpLink = (
    <p className="error-help-link">
      <ExternalLink href="https://docs.streetmix.net/user-guide/support/troubleshooting">
        <FormattedMessage
          id="error.need-help-link"
          defaultMessage="Need help?"
        />
      </ExternalLink>
    </p>
  )

  switch (errorType) {
    case ERRORS.NOT_FOUND:
      title = (
        <FormattedMessage
          id="error.page-not-found-title"
          defaultMessage="Page not found."
        />
      )
      description = (
        <p>
          <FormattedMessage
            id="error.page-not-found-description"
            defaultMessage="Oh, boy. There is no page with this address!"
          />
        </p>
      )
      cta = homeButton
      break
    case ERRORS.STREET_404:
      title = (
        <FormattedMessage
          id="error.street-not-found-title"
          defaultMessage="Street not found."
        />
      )
      description = (
        <p>
          <FormattedMessage
            id="error.street-not-found-description"
            defaultMessage="Oh, boy. There is no street with this link!"
          />
        </p>
      )
      cta = homeButton
      break
    case ERRORS.STREET_404_BUT_LINK_TO_USER:
      title = (
        <FormattedMessage
          id="error.street-not-found-title"
          defaultMessage="Street not found."
        />
      )
      description = (
        <p>
          <FormattedMessage
            id="error.street-not-found-but-user-description"
            defaultMessage="There is no street with this link! But you can look at other streets by {user}"
            values={{
              user: linkToUser(street)
            }}
          />
        </p>
      )
      cta = homeButton
      break
    case ERRORS.STREET_410_BUT_LINK_TO_USER:
      title = (
        <FormattedMessage
          id="error.street-deleted-title"
          defaultMessage="This street has been deleted."
        />
      )
      description = (
        <p>
          <FormattedMessage
            id="error.street-deleted-description"
            defaultMessage="There is no longer a street with this link, but you can look at other streets by {user}"
            values={{
              user: linkToUser(street)
            }}
          />
        </p>
      )
      cta = homeButton
      break
    case ERRORS.SIGN_OUT:
      title = (
        <FormattedMessage
          id="error.sign-out-title"
          defaultMessage="You are now signed out."
        />
      )
      cta = homeButton
      break
    case ERRORS.NO_STREET:
      title = (
        <FormattedMessage
          id="msg.no-street"
          defaultMessage="No street selected."
        />
      )
      break
    case ERRORS.GALLERY_STREET_FAILURE:
      title = (
        <FormattedMessage
          id="msg.having-trouble"
          defaultMessage="Having trouble…"
        />
      )
      description = (
        <p>
          <FormattedMessage
            id="error.gallery-street-failure-description"
            defaultMessage="We’re having trouble loading this street."
          />
        </p>
      )
      break
    case ERRORS.FORCE_RELOAD_SIGN_OUT:
      title = (
        <FormattedMessage
          id="error.reload-sign-out-title"
          defaultMessage="You signed out in another window."
        />
      )
      description = (
        <p>
          <FormattedMessage
            id="error.please-reload"
            defaultMessage="Please reload this page to return to Streetmix."
          />
        </p>
      )
      cta = reloadButton
      break
    case ERRORS.FORCE_RELOAD_SIGN_IN:
      title = (
        <FormattedMessage
          id="error.reload-sign-in-title"
          defaultMessage="You signed in in another window."
        />
      )
      description = (
        <p>
          <FormattedMessage
            id="error.please-reload"
            defaultMessage="Please reload this page to return to Streetmix."
          />
        </p>
      )
      cta = reloadButton
      break
    case ERRORS.AUTH_EXPIRED:
      title = (
        <FormattedMessage
          id="error.auth-expired"
          defaultMessage="We automatically signed you out due to inactivity."
        />
      )
      description = (
        <p>
          <FormattedMessage
            id="error.sign-in-again"
            defaultMessage="Please sign in again."
          />
        </p>
      )
      cta = (
        <>
          {signInButton}
          &nbsp;
          {homeButton}
        </>
      )
      break
    case ERRORS.STREET_DELETED_ELSEWHERE:
      title = (
        <FormattedMessage
          id="error.street-deleted-elsewhere-title"
          defaultMessage="This street has been deleted elsewhere."
        />
      )
      description = (
        <p>
          <FormattedMessage
            id="error.street-deleted-elsewhere-description"
            defaultMessage="This street has been deleted in another browser."
          />
        </p>
      )
      cta = homeButton
      break
    case ERRORS.NEW_STREET_SERVER_FAILURE:
      title = (
        <FormattedMessage
          id="msg.having-trouble"
          defaultMessage="Having trouble…"
        />
      )
      description = (
        <p>
          <FormattedMessage
            id="msg.trouble-loading"
            defaultMessage="We’re having trouble loading Streetmix."
          />
        </p>
      )
      cta = (
        <>
          {tryAgainButton}
          {needHelpLink}
        </>
      )
      break
    case ERRORS.SIGN_IN_SERVER_FAILURE:
      title = (
        <FormattedMessage
          id="msg.having-trouble"
          defaultMessage="Having trouble…"
        />
      )
      description = (
        <p>
          <FormattedMessage
            id="msg.trouble-loading"
            defaultMessage="We’re having trouble loading Streetmix."
          />
          <br />
          <FormattedMessage
            id="error.error-code"
            defaultMessage="(Error {code}.)"
            values={{ code: '15A' }}
          />
        </p>
      )
      cta = (
        <>
          {tryAgainButton}
          {needHelpLink}
        </>
      )
      break
    case ERRORS.SIGN_IN_401:
      title = (
        <FormattedMessage
          id="msg.having-trouble"
          defaultMessage="Having trouble…"
        />
      )
      description = (
        <p>
          <FormattedMessage
            id="msg.trouble-loading"
            defaultMessage="We’re having trouble loading Streetmix."
          />
          <br />
          <FormattedMessage
            id="error.error-code"
            defaultMessage="(Error {code}.)"
            values={{ code: 'RM1' }}
          />
        </p>
      )
      cta = (
        <>
          {tryAgainButton}
          {needHelpLink}
        </>
      )
      break
    case ERRORS.STREET_DATA_FAILURE:
      title = (
        <FormattedMessage
          id="msg.having-trouble"
          defaultMessage="Having trouble…"
        />
      )
      description = (
        <p>
          <FormattedMessage
            id="msg.trouble-loading"
            defaultMessage="We’re having trouble loading Streetmix."
          />
          <br />
          <FormattedMessage
            id="error.error-code"
            defaultMessage="(Error {code}.)"
            values={{ code: '9B' }}
          />
        </p>
      )
      cta = (
        <>
          {tryAgainButton}
          {needHelpLink}
        </>
      )
      break
    case ERRORS.ACCESS_DENIED:
      title = (
        <FormattedMessage
          id="error.access-denied-title"
          defaultMessage="You are not signed in."
        />
      )
      description = (
        <p>
          <FormattedMessage
            id="error.access-denied-description"
            defaultMessage="You cancelled the sign in process."
          />
        </p>
      )
      cta = (
        <>
          {homeButton}
          {needHelpLink}
        </>
      )
      break
    case ERRORS.AUTH_PROBLEM_NO_TWITTER_REQUEST_TOKEN:
    case ERRORS.AUTH_PROBLEM_NO_TWITTER_ACCESS_TOKEN:
    case ERRORS.AUTH_PROBLEM_NO_ACCESS_TOKEN:
    case ERRORS.AUTH_PROBLEM_API_PROBLEM:
      title = (
        <FormattedMessage
          id="error.auth-api-problem-title"
          defaultMessage="There was a problem with signing you in."
        />
      )
      description = (
        <p>
          <FormattedMessage
            id="error.auth-api-problem-description"
            defaultMessage="There was a problem with authentication."
          />
          &nbsp;{pleaseLetUsKnow}
        </p>
      )
      cta = (
        <>
          {homeButton}
          {needHelpLink}
        </>
      )
      break
    // Deprecated.
    case ERRORS.UNSUPPORTED_BROWSER:
      title = (
        <FormattedMessage
          id="error.unsupported-browser-title"
          defaultMessage="Streetmix doesn’t work on your browser."
        />
      )
      description = (
        <>
          <p>
            <FormattedMessage
              id="error.unsupported-browser-description"
              defaultMessage="Sorry about that. You might want to try <chrome_link>Chrome</chrome_link>, <firefox_link>Firefox</firefox_link>, <edge_link>Microsoft Edge</edge_link>, or Safari."
              values={{
                chrome_link: (chunks) => (
                  <ExternalLink href="https://www.google.com/chrome">
                    {chunks}
                  </ExternalLink>
                ),
                firefox_link: (chunks) => (
                  <ExternalLink href="https://www.mozilla.org/firefox">
                    {chunks}
                  </ExternalLink>
                ),
                edge_link: (chunks) => (
                  <ExternalLink href="https://www.microsoft.com/en-us/windows/microsoft-edge">
                    {chunks}
                  </ExternalLink>
                )
              }}
            />
          </p>
          <p>
            <FormattedMessage
              id="error.unsupported-browser-internet-explorer"
              defaultMessage="Are you on Internet Explorer? <a>Find out more.</a>"
              values={{
                a: (chunks) => (
                  <ExternalLink href="https://docs.streetmix.net/user-guide/support/faq#internet-explorer">
                    {chunks}
                  </ExternalLink>
                )
              }}
            />
          </p>
          <p>
            <FormattedMessage
              id="error.unsupported-browser-contact-us"
              defaultMessage="If you think your browser should be supported, please <a>contact us</a>."
              values={{
                a: (chunks) => (
                  <ExternalLink href="https://docs.streetmix.net/community">
                    {chunks}
                  </ExternalLink>
                )
              }}
            />
          </p>
        </>
      )
      break
    case ERRORS.CANNOT_CREATE_NEW_STREET_ON_PHONE:
      title = (
        <FormattedMessage
          id="error.cannot-create-new-street-on-phone-title"
          defaultMessage="Streetmix works on tablets and desktops only."
        />
      )
      description = (
        <p>
          <FormattedMessage
            id="error.cannot-create-new-street-on-phone-description"
            defaultMessage="If you follow another link to a specific street, you can view it on your phone – but you cannot yet create new streets."
          />
        </p>
      )
      cta = (
        <Button primary={true} onClick={goExampleStreet}>
          <FormattedMessage
            id="error.button.view-example"
            defaultMessage="View an example street"
          />
        </Button>
      )
      break
    default:
      // also ERRORS.GENERIC_ERROR
      title = (
        <FormattedMessage
          id="error.generic-error-title"
          defaultMessage="Something went wrong."
        />
      )
      description = (
        <p>
          <FormattedMessage
            id="error.generic-error-description"
            defaultMessage="We’re sorry – something went wrong."
          />
          &nbsp;{pleaseLetUsKnow}
        </p>
      )
      cta = homeButton
      break
  }

  if (errorType !== null) {
    return (
      <div id="error">
        <div className="error-content">
          {errorType !== ERRORS.NO_STREET && <div className="streetmix-logo" />}
          <div className="error-text">
            <h1>{title}</h1>
            {description}
          </div>
          {cta}
        </div>
      </div>
    )
  }

  return null
}

export default BlockingError
