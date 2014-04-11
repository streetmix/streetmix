class UserSerializer < ActiveModel::Serializer
  attributes :id, 
             :name,
             :email,
             :created_at,
             :updated_at

  embed :ids
  has_many :streets
end
