class Api::V2::UsersController < Api::V2::BaseApiController
  before_action :set_user, only: [:show, :update, :destroy, :streets, :destroy_api_auth_token]

  def index
    @users = User.where('')
    render json: @users
  end

  def show
    render json: @user
  end

  def create
    @user = User.new(user_params)

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
    end

    def user_params
      params.require(:user).permit([
        :last_street_id,
        data: params[:user][:data].try(:keys)
      ])
    end
end
