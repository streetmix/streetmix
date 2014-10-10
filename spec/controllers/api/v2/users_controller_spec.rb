describe Api::V2::UsersController do
  describe 'GET index' do
    it 'returns empty list when no users' do
      get :index
      expect_json_types({ users: :array })
      expect_json({ users: -> (users) {
        expect(users.length).to eq 0
      }})
    end

    it 'returns list of users' do
      create_list(:user, 2)
      get :index
      expect_json_types({ users: :array_of_objects })
      expect_json_types('users.*', {
        id: :string,
        twitterId: :string
      })
      expect_json({ users: -> (users) {
        expect(users.length).to eq 2
      }})
    end
  end

  describe 'GET show' do
    it 'returns user when it exists' do
      user = create(:user)
      get :show, id: user.twitter_id
      expect_json({
        id: user.id,
        twitterId: user.twitter_id
      })
    end

    it "returns 404 when user doesn't exist" do
      other_user = create(:user)
      get :show, id: 'doesntexst'
      expect(response.status).to eq 404
    end

    it 'returns more attributes for signed-in user' do
      user = create(:user)
      prepare_auth_for_api_request(user)
      get :show, id: user.twitter_id
      expect_json({
        id: user.id,
        twitterId: user.twitter_id,
        name: user.name,
        data: user.data,
        createdAt: -> (created_at) { DateTime.parse(created_at) - user.created_at.to_datetime < 1000 * 60 },
        updatedAt: -> (updated_at) { DateTime.parse(updated_at) - user.updated_at.to_datetime < 1000 * 60 }
      })
      # TODO: improve that date comparison hack: https://github.com/brooklynDev/airborne/issues/14
    end
  end

  describe 'POST update' do
    before(:each) do
      @user = create(:user)
      prepare_auth_for_api_request(@user)
    end

    it 'should work with valid input when signed in' do
      expect(User.first.data).to be_nil
      post :update, {
        id: @user.twitter_id,
        user: { 
          data: { 
            something: 'value'
          }
        }
      }
      expect(User.first.data).to eq({ 'something' => 'value' })
    end

    it "shouldn't work when signed in as a different user" do
      other_user = create(:user)
      prepare_auth_for_api_request(@user)
      expect(User.first.data).to be_nil
      post :update, {
        id: other_user.twitter_id,
        user: { 
          data: { 
            something: 'value'
          }
        }
      }
      expect(@user.data).to be_blank
      expect(response.response_code).to eq 401
    end
  end
end
