ActionMailer::Base.smtp_settings = {
  user_name: Figaro.env.sendgrid_username,
  password: Figaro.env.sendgrid_password,
  domain: 'codeforamerica.com',
  address: 'smtp.sendgrid.net',
  port: 587,
  authentication: :plain,
  enable_starttls_auto: true
}
