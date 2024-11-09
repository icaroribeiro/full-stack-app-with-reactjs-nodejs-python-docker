from datetime import datetime, timezone

from factory import BUILD_STRATEGY, Factory, LazyAttribute
from faker import Faker
from src.api.components.user.user_models import User

fake = Faker()

local_datetime = datetime.now().astimezone(timezone.utc)


class UserFactory(Factory):
    class Meta:
        strategy = BUILD_STRATEGY
        model = User

    id = LazyAttribute(lambda _: fake.uuid4())
    name = LazyAttribute(lambda _: fake.user_name())
    email = LazyAttribute(lambda _: fake.email())
    created_at = LazyAttribute(lambda _: local_datetime)
    updated_at = LazyAttribute(lambda _: None)
