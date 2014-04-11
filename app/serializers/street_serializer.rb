class StreetSerializer < ActiveModel::Serializer
  attributes :id,
             :user_id,
             :name,
             :data_as_json,
             :created_at,
             :updated_at
  
  def data_as_json
    object.data.to_json
  end
end
