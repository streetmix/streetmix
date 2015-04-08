require 'json'
require 'mongo'
include Mongo

task :import_from_mongodb, [:mongo_uri, :mongo_db_name] => :environment do |t, args|
  mongo_uri     = args[:mongo_url] || 'mongodb://localhost/streetmix'
  mongo_client  = MongoClient.from_uri(mongo_uri)
  mongo_db_name = args[:mongo_db_name] || 'streetmix'
  mongo_db      = mongo_client[mongo_db_name]

  users_collection = mongo_db['users']
  users_progress_bar = ProgressBar.new(users_collection.count)
  users_collection.find.each do |mongo_user|
    pg_user = User.find_or_initialize_by(twitter_id: mongo_user['id'])

    pg_user.created_at = mongo_user['created_at']
    pg_user.provider = 'twitter'
    pg_user.data = mongo_user['data']
    
    pg_user.twitter_credentials = JSON.generate({
      token:  mongo_user['twitter_credentials']['access_token_key'],
      secret: mongo_user['twitter_credentials']['access_token_secret']
    })

    pg_user.last_street_id = mongo_user['data']['lastStreetId']

    pg_user.save
    users_progress_bar.increment!
  end
  puts "#{users_collection.count} users have been copied from Mongo to Postgres"

  streets_collection = mongo_db['streets']
  streets_progress_bar = ProgressBar.new(streets_collection.count)
  streets_collection.find.each do |mongo_street|
    pg_street = Street.find_or_initialize_by(id: mongo_street['id'])

    pg_street.name = mongo_street['name']
    pg_street.creator_ip = mongo_street['creator_ip']
    pg_street.data = mongo_street['data']
    pg_street.namespaced_id = mongo_street['namespaced_id']
    pg_street.status = mongo_street['status']
    pg_street.created_at = mongo_street['created_at']

    if mongo_street['creator_id'].present?
      mongo_creator = users_collection.find_one(mongo_street['creator_id'])
      pg_creator = User.find_by(twitter_id: mongo_creator['id'])
      pg_street.creator = pg_creator
    end

    if mongo_street['original_street_id'].present?
      original_street = streets_collection.find_one(mongo_street['original_street_id'])
      pg_street.original_street_id = original_street['id']
    end

    pg_street.save
    streets_progress_bar.increment!
  end
  puts "#{streets_collection.count} streets have been copied from Mongo to Postgres"

end
