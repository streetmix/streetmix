import React from 'react'
import { FormattedMessage } from 'react-intl'
import Dialog from './Dialog'
import ExternalLink from '../ui/ExternalLink'
import './SentimentSurveyDialog.scss'

function SentimentSurveyDialog (props) {
  return (
    <Dialog>
      {(closeDialog) => (
        <div className="sentiment-survey-about-dialog">
          <div className="dialog-content">
            <h3>
              <FormattedMessage
                id="sentiment.about-header"
                defaultMessage="We want to understand how people feel about streets"
              />
            </h3>
            <p>
              <FormattedMessage
                id="sentiment.about-article.paragraph-1"
                defaultMessage="Many streets are designed by civil engineers, but we believe that design should include everyone’s point of view. In partnership with the <a>New Urban Mobility Alliance</a> (NUMO), we’re conducting this one-question survey to do just that."
                values={{
                  a: (chunks) => (
                    <ExternalLink href="https://www.numo.global/">
                      {chunks}
                    </ExternalLink>
                  )
                }}
              />
            </p>
            <p>
              <FormattedMessage
                id="sentiment.about-article.paragraph-2"
                defaultMessage="We will analyze your responses so that we can infer which street characteristics will induce which feelings. In the future, we plan to incorporate these insights back into design recommendations for Streetmix users."
              />
            </p>
            <p>
              <FormattedMessage
                id="sentiment.about-article.paragraph-3"
                defaultMessage="You can only vote once per street, but you can encourage others to cast their own vote by sharing your streets or a random street with the link <a>https://streetmix.net/survey/</a>."
                values={{
                  a: (chunks) => (
                    <a
                      href="https://streetmix.net/survey/"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {chunks}
                    </a>
                  )
                }}
              />
            </p>
          </div>
          <button className="dialog-primary-action" onClick={closeDialog}>
            <FormattedMessage id="btn.okay" defaultMessage="Okay!" />
          </button>
        </div>
      )}
    </Dialog>
  )
}

export default SentimentSurveyDialog
