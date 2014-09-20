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

require 'spec_helper'

describe User do
  pending "add some examples to (or delete) #{__FILE__}"
end
