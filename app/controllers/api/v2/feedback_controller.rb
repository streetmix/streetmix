class Api::V2::FeedbackController < Api::V2::BaseApiController
  def provide
    begin
      FeedbackMailer.provide_feedback(
        params[:message],
        params[:additionalInformation],
        request.referer,
        params[:from]
      ).deliver
      render json: { msg: 'Feedback accepted.'}, status: :ok
    rescue
      render json: { msg: 'Could not send feedback.'}, status: :internal_server_error
    end
  end
end
