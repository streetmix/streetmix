def prepare_auth_for_api_request(user)
  api_auth_token = user.set_api_auth_token
  request.env['HTTP_AUTHORIZATION'] = ActionController::HttpAuthentication::Token.encode_credentials(api_auth_token)
  api_auth_token
end
