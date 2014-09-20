class Api::V2::StreetsController < Api::V2::BaseApiController
  before_action :set_street, only: [:show, :update, :destroy]
  # after_action :verify_authorized, except: :index
  # after_action :verify_policy_scoped, only: [:index]

  def index
    if params[:namespacedId] #&& params[:creatorId]
      find_by_params = {
        namespaced_id: params[:namespacedId]
      }
      if params[:creatorId]
        find_by_params[:creator_id] = case params[:creatorId]
        when User::Regex::TWITTER_HANDLE
          User.find_by!(twitter_id: params[:creatorId]).id
        when User::Regex::UUID
          params[:creatorId]
        end
      end
      @street = Street.find_by!(find_by_params)
      redirect_to api_v2_street_url(@street) if @street
    else
      start = (params[:start] || 0).to_i
      count = (params[:count] || 20).to_i
      @streets = Street.offset(start).limit(count)

      links = {
        self: api_v2_streets_url(start: start, count: count)
      }
      if start - count >= 0 && Street.offset(start - count).limit(count).count > 0
        links[:prev] = api_v2_streets_url( start: start - count, count: count)
      end
      if Street.offset(start + count).limit(count).count > 0
        links[:next] = api_v2_streets_url( start: start + count, count: count)
      end

      render json: {
        meta: {
          links: links 
        },
        streets: @streets
      }
    end
  end

  def show
    render json: @street
  end

  def create
    @street = Street.new(street_params)
    @street.creator ||= @current_user
    # authorize @street

    if @street.save!
      render json: @street #, status: :created
    else
      render_error :unprocessable_entity, @street.errors
    end
  end

  def update
    if @street.update(street_params)
      render json: @street, status: :ok
    else
      render_error :unprocessable_entity, @street.errors
    end
  end

  def destroy
    if @street.destroy
      render json: @street, status: :ok
    else
      render_error :internal_server_error
    end
  end

  private

    def set_street
      @street = Street.find(params[:id])
      # authorize @street
    end

    def street_params
      params.keys.each { |k| params[k.underscore] = params.delete(k) }
      params.require(:street).permit! # TODO: limit this
    end
end
