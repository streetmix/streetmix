class RouteConstraint
  def matches?(request)
    !request.env['REQUEST_PATH'].start_with? '/images'
  end
end

Streetmix::Application.routes.draw do
  # JSON API
  namespace :api do
    namespace :v2 do
      resources :users do
        get 'streets', on: :member
        delete 'destroy-api-auth-token', on: :member
      end
      resources :streets
      post 'feedback', to: 'feedback#provide'
    end
  end

  # OAuth authentication
  get '/twitter-sign-in', to: redirect('/auth/twitter')
  get '/auth/:provider/callback', to: 'sessions#create'

  # heartbeat for CfA Engine Light
  # https://github.com/codeforamerica/engine-light
  get '/.well-known/status' => 'status#check'

  # single-page JavaScript application
  root to: 'site#land'
  match '*path', to: 'site#land', via: :all, constraints: RouteConstraint.new
end
