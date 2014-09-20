class UserSerializer < ActiveModel::Serializer
  self.root = false
  
  attributes :id,
             :twitter_id,
             :twitter_profile_image_url

  private

    def attributes
      data = super.map { |k, v| [ k.to_s.camelize(:lower).to_sym, v ] }.to_h
      if scope == object
        data.merge!({
          name: object.name,
          data: object.data,
          createdAt: object.created_at,
          updatedAt: object.updated_at
        })
      end
      data
    end
end
