from typing import Optional

from pydantic import BaseModel
from src.api.shared import unknown_type


class APIErrorResponse(BaseModel):
    message: str
    details: Optional[unknown_type.UnknownType] = None
    isOperational: bool
