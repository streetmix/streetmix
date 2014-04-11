Streetmix::Application.routes.draw do
  # JSON API
  namespace :api do
    namespace :v2 do
      resources :user do
        get 'streets', on: :member
      end
      resources :streets
      post 'feedback', to: 'feedback#provide'
    end
  end

  # OAuth authentication
  get '/auth/:provider/callback', to: 'sessions#create'

  # single-page JavaScript application
  root to: 'site#land'
end
