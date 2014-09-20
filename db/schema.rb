# encoding: UTF-8
# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 20140410194143) do

  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"
  enable_extension "uuid-ossp"

  create_table "streets", id: :uuid, default: "uuid_generate_v4()", force: true do |t|
    t.uuid     "creator_id"
    t.uuid     "original_street_id"
    t.string   "name"
    t.json     "data"
    t.string   "creator_ip"
    t.integer  "namespaced_id"
    t.string   "status"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "users", id: :uuid, default: "uuid_generate_v4()", force: true do |t|
    t.string   "name"
    t.string   "twitter_id"
    t.json     "twitter_credentials"
    t.string   "twitter_profile_image_url"
    t.json     "data"
    t.string   "provider"
    t.uuid     "last_street_id"
    t.string   "api_auth_token"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

end
