class Api::V2::BaseApiController < ApplicationController
  protect_from_forgery with: :null_session

  before_filter :set_default_response_format

  before_filter :authenticate

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

  def current_user
    @current_user
  end

  def convert_params_from_camel_case_to_underscored(params)
    camel_case_params = params.clone
    underscored_params = ActiveSupport::HashWithIndifferentAccess.new
    camel_case_params.keys.each do |k|
      underscored_params[k.underscore] = camel_case_params.delete(k)
    end
    underscored_params
  end

  private
  
    def set_default_response_format
      request.format = :json
    end

    def authenticate
      authenticate_with_http_token do |token, options|
        @current_user = User.find_by(api_auth_token: token)
      end
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
