Streetmix::Application.configure do

  if Rails.env.test?
    # Tell Action Mailer not to deliver emails to the real world.
    # The :test delivery method accumulates sent emails in the
    # ActionMailer::Base.deliveries array.
    config.action_mailer.delivery_method = :test

  elsif Rails.env.development?
    # mailcatcher gem: https://github.com/sj26/mailcatcher
    config.action_mailer.delivery_method = :smtp
    config.action_mailer.smtp_settings = { 
      address: "localhost", 
      port: 1025
    }

  else
    config.action_mailer.delivery_method = :smtp
    config.action_mailer.smtp_settings = {
      user_name: Figaro.env.sendgrid_username,
      password: Figaro.env.sendgrid_password,
      domain: 'codeforamerica.com',
      address: 'smtp.sendgrid.net',
      port: 587,
      authentication: :plain,
      enable_starttls_auto: true
    }
  end
  
end
