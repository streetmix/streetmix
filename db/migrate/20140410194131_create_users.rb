class CreateUsers < ActiveRecord::Migration
  def change
    create_table :users, id: :uuid do |t|
      t.string :name
      t.string :twitter_id, index: true, uniqueness: true
      t.json :twitter_credentials
      t.string :twitter_profile_image_url
      t.json :data
      t.string :provider
      t.uuid :last_street_id
      t.string :api_auth_token
      t.timestamps
    end
  end
end
