# == Schema Information
#
# Table name: streets
#
#  id                 :uuid             not null, primary key
#  creator_id         :uuid
#  original_street_id :uuid
#  name               :string(255)
#  data               :json
#  creator_ip         :string(255)
#  namespaced_id      :integer
#  status             :string(255)
#  created_at         :datetime
#  updated_at         :datetime
#

describe Street do
  it 'can be created' do
    street = create(:street)
    expect(Street.exists? street).to be true
  end

  it 'has namespaced IDs in sequence, scoped by creator' do
    street1_user1 = create(:street)
    expect(street1_user1.namespaced_id).to eq 1
    street1_user2 = create(:street)
    expect(street1_user2.namespaced_id).to eq 1
    street2_user1 = create(:street, creator: street1_user1.creator)
    expect(street2_user1.namespaced_id).to eq 2
  end

  context 'creator' do
    it 'can be set by UUID' do
      user = create(:user)
      street = create(:street, creator_id: user.id)
      expect(Street.exists? street).to be true
      expect(user.streets).to eq [street]
    end

    it 'can be set by Twitter ID' do
      user = create(:user)
      other_user = create(:user)
      expect(user.twitter_id.present?).to be true
      street = build(:street, creator_id: user.twitter_id)
      street.save!
      expect(street.creator).to eq user
    end
  end
end
