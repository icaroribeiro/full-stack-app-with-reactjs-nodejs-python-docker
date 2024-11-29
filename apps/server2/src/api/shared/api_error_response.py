from pydantic import BaseModel

from api.shared import unknown_type


class APIErrorResponse(BaseModel):
    message: str
    detail: unknown_type.UnknownType | None = None
    is_operational: bool
