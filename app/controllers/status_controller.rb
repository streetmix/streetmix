class StatusController < ApplicationController

  def check
    response_hash = Hash.new
    #{ :status => "ok", :updated => "", :dependencies => "", :resources => "" }
    response_hash[:dependencies] = ['twitter', 'sendgrid', 'postgres', 'papertrail']
    response_hash[:status] = everything_ok? ? "ok" : "NOT OK"
    response_hash[:updated] = Time.now.to_i
    response_hash[:resources] = {}
    render :inline => response_hash.to_json
  end

  private
  
    def everything_ok?
      database_okay?
    end

    def database_okay?
      User.first.present?
    end

end
