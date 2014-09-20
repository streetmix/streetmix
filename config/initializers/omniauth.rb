OmniAuth.config.logger = Rails.logger

Rails.application.config.middleware.use OmniAuth::Builder do
  provider :developer unless Rails.env.production?
  provider :twitter, Figaro.env.twitter_oauth_consumer_key, Figaro.env.twitter_oauth_consumer_secret
end
