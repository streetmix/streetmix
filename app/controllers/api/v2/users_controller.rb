class Api::V2::UsersController < Api::V2::BaseApiController
  before_action :set_user, only: [:show, :update, :destroy]
  # after_action :verify_authorized, except: :index
  # after_action :verify_policy_scoped, only: [:index]

  def index
    @users = user.where('') # policy_scope(user)
    render json: @users
  end

  def show
    render json: @user
  end

  def create
    @user = user.new(user_params)
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

  private

    def set_user
      @user = user.find(params[:id])
      # authorize @user
    end

    def user_params
      params.require(:user).permit([
        :name,
        :email
      ])
    end
end
