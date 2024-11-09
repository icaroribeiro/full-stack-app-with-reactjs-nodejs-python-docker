from src.api.components.health_check.health_check_models import HealthCheckResponse


class HealthCheckMapper:
    @staticmethod
    def to_response(is_healthy: bool) -> HealthCheckResponse:
        return HealthCheckResponse(healthy=is_healthy)
