from pydantic import BaseModel
from src.api.shared import unknown_type


class APIErrorResponse(BaseModel):
    message: str
    details: unknown_type.UnknownType | None = None
    is_operational: bool
