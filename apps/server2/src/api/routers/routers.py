from src.api.components.health.health_check_controller import HealthCheckController
from src.api.components.user.user_controller import UserController

health_check_router = HealthCheckController()
user_router = UserController()
