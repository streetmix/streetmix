class SessionsController < ApplicationController
  def create
    @current_user = User.find_or_create_from_auth_hash(auth_hash)
    api_auth_token = @current_user.set_api_auth_token
    cookies[:login_token] = api_auth_token
    cookies[:twitter_id] = @current_user.twitter_id
    cookies[:user_id] = @current_user.id
    redirect_to '/'
  end

  protected

    def auth_hash
      request.env['omniauth.auth']
    end
end
