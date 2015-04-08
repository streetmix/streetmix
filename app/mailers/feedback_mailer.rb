class FeedbackMailer < ActionMailer::Base
  def provide_feedback(message, additionalInformation, referer, from)
    @message = message
    @additionalInformation = additionalInformation
    @referer = referer
    from = 'noreply@codeforamerica.org' if from.blank?
    to = Figaro.env.email_feedback_receipient || 'streetmix@codeforamerica.org'
    mail(
      to: to,
      from: from,
      subject: "Streetmix feedback from #{from}"
    )
  end
end
