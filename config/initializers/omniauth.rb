OmniAuth.config.logger = Rails.logger

Rails.application.config.middleware.use OmniAuth::Builder do
  provider :developer unless Rails.env.production?
  provider :twitter, ENV['TWITTER_OAUTH_CONSUMER_KEY'], ENV['TWITTER_OAUTH_CONSUMER_SECRET']
end
