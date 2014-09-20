class Api::V2::UsersController < Api::V2::BaseApiController
  before_action :set_user, only: [:show, :update, :destroy, :streets, :destroy_api_auth_token]
  # after_action :verify_authorized, except: :index
  # after_action :verify_policy_scoped, only: [:index]

  def index
    @users = User.where('') # policy_scope(user)
    render json: @users
  end

  def show
    render json: @user
  end

  def create
    @user = User.new(user_params)
    # authorize @user

    if @user.save
      render json: @user, status: :created
    else
      render_error :unprocessable_entity, @user.errors
    end
  end

  def update
    if @user.update(user_params)
      render json: @user, status: :ok
    else
      render_error :unprocessable_entity, @user.errors
    end
  end

  def destroy
    if @user.destroy
      render json: @user, status: :ok
    else
      render_error :internal_server_error
    end
  end

  def streets
    @streets = @user.streets
    render json: ActiveModel::ArraySerializer.new(@streets, each_serializer: StreetSerializer, root: 'streets')
  end

  def destroy_api_auth_token
    if @current_user == @user
      if @user.update(api_auth_token: nil)
        render json: @user, status: :ok
      else
        render_error :internal_server_error
      end
    else
      render_error :unauthorized
    end
  end

  private

    def set_user
      @user = User.find_by!(twitter_id: params[:id])
      # authorize @user
    end

    def user_params
      params.require(:user).permit!
    end
end
