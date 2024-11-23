import pytest
from db.models.user import UserModel
from faker import Faker
from fastapi import status
from fastapi.encoders import jsonable_encoder
from httpx import AsyncClient
from sqlalchemy import insert
from tests.factories.user_factory import UserFactory

from api.components.user.user_mapper import UserMapper
from api.components.user.user_models import User
from api.utils.dict_to_obj import DictToObj
from config.config import Config
from services.db_service import DBService


class TestUserHttp:
    @pytest.fixture
    def url(self, config: Config) -> str:
        endpoint = "/users"
        return f"http://localhost:{config.get_port()}{endpoint}"


class TestAddUser(TestUserHttp):
    @pytest.mark.asyncio(loop_scope="session")
    async def test_should_succeed_and_return_201_status_code_when_a_user_is_added(
        self,
        db_service: DBService,
        initialize_database: None,
        clear_database_tables: None,
        async_client: AsyncClient,
        url: str,
    ) -> None:
        mocked_user: UserModel = UserFactory.build()
        user_request = {"name": mocked_user.name, "email": mocked_user.email}
        expected_response_body = DictToObj(user_request)

        response = await async_client.post(url, json=user_request)

        row_count = 1
        assert await db_service.get_database_table_row_count("users") == row_count
        assert response.status_code == status.HTTP_201_CREATED
        response_body = DictToObj(response.json())
        assert response_body.name == expected_response_body.name
        assert response_body.email == expected_response_body.email

    @pytest.mark.asyncio(loop_scope="session")
    async def test_should_fail_and_return_422_status_code_when_user_request_email_is_invalid(
        self,
        db_service: DBService,
        initialize_database: None,
        clear_database_tables: None,
        async_client: AsyncClient,
        url: str,
        fake: Faker,
    ) -> None:
        row_count = 0
        assert await db_service.get_database_table_row_count("users") == row_count
        mocked_user: UserModel = UserFactory.build(email=fake.word())
        user_request = {"name": mocked_user.name, "email": mocked_user.email}

        response = await async_client.post(url, json=user_request)

        row_count = 0
        assert await db_service.get_database_table_row_count("users") == row_count
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
        response_body = DictToObj(response.json())
        assert response_body.is_operational is True


class TestFetchUser(TestUserHttp):
    @pytest.mark.asyncio(loop_scope="session")
    async def test_should_succeed_and_return_200_status_code_when_a_user_is_fetched(
        self,
        db_service: DBService,
        initialize_database: None,
        clear_database_tables: None,
        async_client: AsyncClient,
        url: str,
    ) -> None:
        mocked_user: UserModel = UserFactory.build()
        raw_user_data = UserMapper.to_persistence(UserMapper.to_domain(mocked_user))
        domain_user: User
        async with db_service.async_engine.connect() as conn:
            query = insert(UserModel).values(raw_user_data).returning(UserModel)
            engine_result = await conn.execute(query)
            obj = DictToObj(engine_result.first()._asdict())
            await conn.commit()
            domain_user = UserMapper.to_domain(obj)
        expected_response_body = UserMapper.to_response(domain_user)

        response = await async_client.get(f"{url}/{domain_user.id}")

        row_count = 1
        assert await db_service.get_database_table_row_count("users") == row_count
        assert response.status_code == status.HTTP_200_OK
        assert response.json() == jsonable_encoder(expected_response_body)

    @pytest.mark.asyncio(loop_scope="session")
    async def test_should_fail_and_return_404_status_code_when_user_is_not_found(
        self,
        db_service: DBService,
        initialize_database: None,
        clear_database_tables: None,
        async_client: AsyncClient,
        url: str,
        fake: Faker,
    ) -> None:
        mocked_user: UserModel = UserFactory.build()

        response = await async_client.get(f"{url}/{mocked_user.id}")

        row_count = 0
        assert await db_service.get_database_table_row_count("users") == row_count
        assert response.status_code == status.HTTP_404_NOT_FOUND
        response_body = DictToObj(response.json())
        assert response_body.is_operational is True
