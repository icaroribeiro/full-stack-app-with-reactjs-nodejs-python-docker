import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, DateTime, func
from sqlalchemy.dialects.postgresql import UUID

class Default:
    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    created_at = Column(
        DateTime(), nullable=False, default=func.now()
    )
    updated_at = Column(
        DateTime(),
        nullable=True,
        default=None,
        onupdate=func.now(),
    )