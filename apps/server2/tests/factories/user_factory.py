from db.models.user import UserModel
from factory import BUILD_STRATEGY, Factory, LazyAttribute
from faker import Faker

fake = Faker()


class UserFactory(Factory):
    class Meta:
        strategy = BUILD_STRATEGY
        model = UserModel

    id = LazyAttribute(lambda _: fake.uuid4())
    name = LazyAttribute(lambda _: fake.user_name())
    email = LazyAttribute(lambda _: fake.email())
    created_at = LazyAttribute(lambda _: fake.date_time())
    updated_at = LazyAttribute(lambda _: None)
