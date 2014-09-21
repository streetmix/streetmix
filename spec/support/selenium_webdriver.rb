require 'selenium/webdriver'

my_driver = (ENV['browser'] && ENV['browser'].to_sym) || :selenium
puts "my_driver:  #{my_driver}"

Capybara.default_driver = my_driver
Capybara.javascript_driver = my_driver

Capybara.register_driver :selenium do |app|
  Capybara::Selenium::Driver.new(app, browser: :chrome)
end

SAUCE_USERNAME    = Figaro.env.sauce_username
SAUCE_ACCESS_KEY  = Figaro.env.sauce_access_key
SAUCE_PORT        = '4445'
SAUCE_CONNECT_URL = "http://localhost:#{SAUCE_PORT}/wd/hub"

def sauce_build
  `git describe --always --dirty`.strip
end

def sauce_name
  "Streetmix (#{`whoami`.strip})"
end

base_opts = {
  username: SAUCE_USERNAME,
  access_key: SAUCE_ACCESS_KEY,
  build: sauce_build,
  name: sauce_name,
  'max-duration' => '3600'
}

Capybara.register_driver :sauce_ie_10_vista do |app|
  caps = base_opts.merge({platform: 'vista', version: '10'})
  Capybara::Selenium::Driver.new(
    app,
    browser: :remote,
    url: SAUCE_CONNECT_URL,
    desired_capabilities: Selenium::WebDriver::Remote::Capabilities.internet_explorer(caps)
  )
end

Capybara.register_driver :sauce_chrome_vista do |app|
  caps = base_opts.merge({platform: 'vista'})
  Capybara::Selenium::Driver.new(
    app,
    browser: :remote,
    url: SAUCE_CONNECT_URL,
    desired_capabilities: Selenium::WebDriver::Remote::Capabilities.chrome(caps)
  )
end

Capybara.register_driver :firefox do |app|
  Capybara::Selenium::Driver.new(
    app,
    browser: :remote,
    url: SAUCE_CONNECT_URL,
    desired_capabilities: Selenium::WebDriver::Remote::Capabilities.firefox
  )
end
