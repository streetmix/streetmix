class FeedbackMailer < ActionMailer::Base
  def provide_feedback(message, additionalInformation, referer, from)
    @message = message
    @additionalInformation = additionalInformation
    @referer = referer
    from = 'noreply@codeforamerica.org' if from.blank?
    mail(
      to: Figaro.env.email_feedback_receipient,
      from: from,
      subject: "Streetmix feedback from #{from}"
    )
  end
end
