if Rails.env.test?
  Streetmix::Application.configure do
    # Tell Action Mailer not to deliver emails to the real world.
    # The :test delivery method accumulates sent emails in the
    # ActionMailer::Base.deliveries array.
    config.action_mailer.delivery_method = :test
  end
else
  ActionMailer::Base.smtp_settings = {
    user_name: Figaro.env.sendgrid_username,
    password: Figaro.env.sendgrid_password,
    domain: 'codeforamerica.com',
    address: 'smtp.sendgrid.net',
    port: 587,
    authentication: :plain,
    enable_starttls_auto: true
  }
end
