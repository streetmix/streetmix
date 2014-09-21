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

class User < ActiveRecord::Base
  module Regex
    UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    TWITTER_HANDLE = /^[A-Za-z0-9_]{1,15}$/
  end

  has_many :streets, foreign_key: :creator_id, dependent: :destroy
  belongs_to :last_street, class_name: 'Street'

  validates :twitter_id, presence: true, uniqueness: true

  def self.find_or_create_from_auth_hash(auth_hash)
    user = User.find_or_initialize_by(twitter_id: auth_hash[:info][:nickname])
    user.provider = 'twitter'
    user.name = auth_hash[:info][:name]
    user.twitter_credentials = auth_hash[:credentials]
    user.twitter_profile_image_url = auth_hash[:info][:image]
    user.save!
    user
  end

  def set_api_auth_token
    if api_auth_token.present?
      api_auth_token
    else 
      begin
        new_api_auth_token = SecureRandom.hex
      end while self.class.exists?(api_auth_token: new_api_auth_token)
      update(api_auth_token: new_api_auth_token)
      new_api_auth_token
    end
  end
end
