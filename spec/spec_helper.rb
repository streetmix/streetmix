ENV["RAILS_ENV"] ||= 'test'
require File.expand_path("../../config/environment", __FILE__)
require 'rspec/rails'
require 'capybara/rails'
require 'capybara/rspec'
require 'database_cleaner'
require 'ffaker'
require 'simplecov'
SimpleCov.start 'rails'

ActiveRecord::Migration.maintain_test_schema!

Capybara.server_port = 3030
# Note that this port is on the Sauce Connect list of ports to proxy by default
# https://docs.saucelabs.com/reference/sauce-connect/#can-i-access-applications-on-localhost-

Dir[Rails.root.join("spec/support/**/*.rb")].each {|f| require f}

RSpec.configure do |config|
  config.mock_with :rspec

  config.infer_spec_type_from_file_location!

  config.include FactoryGirl::Syntax::Methods

  config.before(:suite) do
    DatabaseCleaner.strategy = :truncation
    begin
      DatabaseCleaner.start
      FactoryGirl.lint
    ensure
      DatabaseCleaner.clean
    end
  end

  config.before(:each) do
    DatabaseCleaner.clean
  end
end
