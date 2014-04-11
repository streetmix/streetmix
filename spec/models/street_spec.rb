# == Schema Information
#
# Table name: streets
#
#  id         :integer          not null, primary key
#  user_id    :integer
#  name       :string(255)
#  data       :hstore
#  created_at :datetime
#  updated_at :datetime
#
# Indexes
#
#  index_streets_on_user_id  (user_id)
#

require 'spec_helper'

describe Street do
  pending "add some examples to (or delete) #{__FILE__}"
end
