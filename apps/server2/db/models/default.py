import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, DateTime, func
from sqlalchemy.dialects.postgresql import UUID

local_datetime = datetime.now().astimezone(timezone.utc)
class Default:
    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    created_at = Column(
        DateTime(), nullable=False, default=local_datetime
    )
    updated_at = Column(
        DateTime(),
        nullable=True,
        default=None,
        onupdate=local_datetime,
    )