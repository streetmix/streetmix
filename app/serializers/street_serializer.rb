class StreetSerializer < ApplicationSerializer
  attributes :id,
             :creator,
             :name,
             :data,
             :creator_ip,
             :namespaced_id,
             :original_street_id,
             :status,
             :created_at,
             :updated_at

  def creator
    if object.creator
      {
        userId: object.creator.id,
        twitterId: object.creator.twitter_id
      }
    else
      nil
    end
  end
end
