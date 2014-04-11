class CreateStreets < ActiveRecord::Migration
  def change
    create_table :streets do |t|
      t.references :user, index: true
      t.string :name
      t.hstore :data
      t.timestamps
    end
  end
end
