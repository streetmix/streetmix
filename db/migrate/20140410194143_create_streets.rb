class CreateStreets < ActiveRecord::Migration
  def change
    create_table :streets, id: :uuid do |t|
      t.uuid :creator_id, index: true
      t.uuid :original_street_id, index: true
      t.string :name
      t.json :data
      t.string :creator_ip
      t.integer :namespaced_id
      t.string :status
      t.timestamps
    end
  end
end
