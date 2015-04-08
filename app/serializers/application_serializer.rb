class ApplicationSerializer < ActiveModel::Serializer
  self.root = false

  delegate :current_user, to: :scope
  
  private

    def attributes
      super.map { |k, v| [ k.to_s.camelize(:lower).to_sym, v ] }.to_h
    end
end
