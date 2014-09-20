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

# Read about factories at https://github.com/thoughtbot/factory_girl

FactoryGirl.define do
  factory :street do
  end
end
