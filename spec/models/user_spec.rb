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

describe User do
  it 'can be created' do
    user = create(:user)
    expect(User.exists? user).to be true
  end

  context 'Twitter sign in' do
    it 'will find existing user from auth hash' do
      other_user = create(:user)
      auth_hash = {
        info: {
          nickname: 'drewdaraabrams',
          name: 'Drew Dara-Abrams',
          image: ''
        },
        credentials: {}
      } # TODO: add VCR and Webmock
      user = create(:user, twitter_id: 'drewdaraabrams')
      found_user = User.find_or_create_from_auth_hash(auth_hash)
      expect(found_user).to eq user
      expect(found_user.name).to eq 'Drew Dara-Abrams'
    end

    it 'will create a new user from auth hash' do
      other_user = create(:user)
      auth_hash = {
        info: {
          nickname: 'saikofish',
          name: 'Lou Huang',
          image: ''
        },
        credentials: {}
      } # TODO: add VCR and Webmock
      found_user = User.find_or_create_from_auth_hash(auth_hash)
      expect(found_user.twitter_id).to eq 'saikofish'
      expect(found_user.name).to eq 'Lou Huang'
    end
  end

  context 'API auth token' do
    it 'will be returned if already it already exists' do
      preset_api_auth_token = SecureRandom.hex
      expect(preset_api_auth_token.length).to be > 0
      user = create(:user, api_auth_token: preset_api_auth_token)
      expect(user.set_api_auth_token).to eq preset_api_auth_token
    end

    it 'will be created if does not yet exist' do
      other_user = create(:user)
      user = create(:user)
      generated_api_auth_token = user.set_api_auth_token
      expect(generated_api_auth_token.length).to be > 0
      expect(generated_api_auth_token).to_not eq other_user.set_api_auth_token
    end
  end
end
