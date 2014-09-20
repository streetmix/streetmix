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

class Street < ActiveRecord::Base
  belongs_to :creator, class_name: 'User'
  belongs_to :original_street, class_name: 'Street'

  before_save :set_namespaced_id
  before_save :set_creator_id

  private

    def set_namespaced_id
      if namespaced_id.nil?
        if creator
          last = creator.streets.maximum(:namespaced_id) || 0
        else
          last = Street.where(creator_id: nil).maximum(:namespaced_id) || 0
        end
        self.namespaced_id ||= last + 1
      end
    end

    def set_creator_id
      if creator_id && creator_id.match(User::Regex::UUID)
        return
      elsif creator_id && creator_id.match(User::Regex::TWITTER_HANDLE)
        self.creator_id = User.find_by!(twitter_id: creator_id).id
      end
    end
end
