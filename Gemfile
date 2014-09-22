source 'https://rubygems.org'

ruby '2.1.2'

gem 'rails', '4.1.6'

# configuration
gem 'figaro'
gem 'highline'

# data stores
gem 'pg'
gem 'mongo', require: false # used for import task
gem 'bson_ext', require: false # also used for import task

# authentication and authorization
gem 'omniauth'
gem 'omniauth-twitter'

# CSS
gem 'less-rails'

# JavaScript
gem 'uglifier'
gem 'therubyracer', platforms: :ruby
gem 'therubyrhino', platforms: :jruby

# API
gem 'active_model_serializers'

# production (Heroku)
gem 'rails_12factor', group: :production
gem 'unicorn', group: :production

# development tools
gem 'foreman', group: :development
gem 'better_errors', group: :development
gem 'binding_of_caller', group: :development
gem 'byebug', group: :development

# code coverage and documentation
gem 'rails-erd', group: :development
gem 'annotate', group: :development
gem 'simplecov', :require => false, group: [:development, :test]

# testing
gem 'database_cleaner', group: :test
gem 'factory_girl_rails', group: [:development, :test]
gem 'ffaker', group: [:development, :test]
gem 'rspec-rails', group: [:development, :test]
gem 'capybara', group: :test
gem 'selenium-webdriver', group: :test

# misc.
gem 'progress_bar'