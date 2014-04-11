class Api::V2::StreetsController < Api::V2::BaseApiController
  before_action :set_street, only: [:show, :update, :destroy]
  # after_action :verify_authorized, except: :index
  # after_action :verify_policy_scoped, only: [:index]

  def index
    # TODO: add query params
    @streets = Street.where('') # policy_scope(street)
    render json: @streets
  end

  def show
    render json: @street
  end

  def create
    @street = Street.new(street_params)
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
      params.require(:street).permit!
    end
end
