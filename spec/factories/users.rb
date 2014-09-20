# == Schema Information
#
# Table name: users
#
#  id                        :uuid             not null, primary key
#  name                      :string(255)
#  twitter_id                :string(255)
#  twitter_credentials       :json
#  twitter_profile_image_url :string(255)
#  data                      :json
#  provider                  :string(255)
#  last_street_id            :uuid
#  api_auth_token            :string(255)
#  created_at                :datetime
#  updated_at                :datetime
#

# Read about factories at https://github.com/thoughtbot/factory_girl

FactoryGirl.define do
  factory :user do
  end
end
