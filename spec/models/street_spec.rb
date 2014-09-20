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
  pending "add some examples to (or delete) #{__FILE__}"
end
