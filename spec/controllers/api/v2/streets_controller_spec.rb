describe Api::V2::StreetsController do
  describe 'GET index' do
    it 'returns empty list when no streets' do
      get :index
      expect_json_types({ streets: :array })
      expect_json({ streets: -> (streets) {
        expect(streets.length).to eq 0
      }})
    end

    it 'returns list of streets' do
      create_list(:street, 2)
      get :index
      expect_json_types({ streets: :array_of_objects })
      expect_json_types('streets.*', {
        id: :string,
        name: :string
      })
      expect_json({ streets: -> (streets) {
        expect(streets.length).to eq 2
      }})
    end

    context 'redirects to individual street' do
      before(:each) do
        @user = create(:user)
        @street = create(:street, creator: @user)
        other_street = create(:street)
      end

      it 'with namespaced street ID provided and signed in' do
        prepare_auth_for_api_request(@user)
        get :index, namespacedId: @street.namespaced_id
        expect(response).to redirect_to api_v2_street_url(@street)
      end

      it 'with namespaced street ID and user ID provided' do
        get :index, namespacedId: @street.namespaced_id, creatorId: @user.id
        expect(response).to redirect_to api_v2_street_url(@street)
      end

      it 'with namespaced street ID and user Twitter ID provided' do
        get :index, namespacedId: @street.namespaced_id, creatorId: @user.twitter_id
        expect(response).to redirect_to api_v2_street_url(@street)
      end
    end

    context 'pagination' do
      pending 'write some tests'
    end
  end
end
