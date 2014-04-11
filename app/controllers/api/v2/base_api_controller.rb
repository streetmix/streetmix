class Api::V2::BaseApiController < ApplicationController
  protect_from_forgery with: :null_session

  before_filter :set_default_response_format

  rescue_from Exception do |exception|
    Rails.logger.warn("[Unhandled API Exception] [#{exception.class.name}] #{exception.message}")
    Rails.logger.warn(exception.backtrace.join("\n"))
    render_error 500, "[#{exception.class.name}] #{exception.message}"
  end

  rescue_from 'ActiveRecord::RecordNotFound' do |exception|
    render_error 404, exception.message
  end

  rescue_from 'ActionController::RoutingError' do |exception|
    render_error 404, exception.message
  end

  rescue_from 'ActiveRecord::RecordInvalid' do |exception|
    render_error 400, exception.message
  end

  rescue_from 'ActionController::ParameterMissing' do |exception|
    render_error 400, exception.message
  end

  private
  
    def set_default_response_format
      request.format = :json
    end

    def render_error(code, message = nil)
      @error = message
      render json: {
        status: code,
        error: message,
        result: nil
      }, status: code
    end
end
