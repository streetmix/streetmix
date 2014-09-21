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

require 'spec_helper'

describe Street do
  it 'can be created' do
    street = FactoryGirl.create(:street)
    expect(Street.exists? street).to be true
  end
end
