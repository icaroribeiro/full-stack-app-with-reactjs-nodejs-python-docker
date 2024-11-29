import types

import pytest
from db.models.user import UserModel
from faker import Faker
from fastapi import status
from pytest_mock import MockerFixture
from tests.factories.user_factory import UserFactory

from api.components.user.user_repository import UserRepository
from api.components.user.user_service import UserService
from server_error import Detail, ServerError
from services.db_service import DBService


class TestUserService:
    @pytest.fixture
    def user_repository(
        self,
        db_service: DBService,
    ) -> UserRepository:
        return UserRepository(db_service)

    @pytest.fixture
    def user_service(
        self,
        user_repository: UserRepository,
    ) -> UserService:
        return UserService(user_repository)


class TestRegisterUser(TestUserService):
    def test_should_define_a_method(
        self,
        user_service: UserService,
    ) -> None:
        assert isinstance(user_service.register_user, types.MethodType) is True

    @pytest.mark.asyncio(loop_scope="session")
    async def test_should_succeed_and_return_user_when_user_is_registered(
        self,
        user_repository: UserRepository,
        user_service: UserService,
        mocker: MockerFixture,
    ) -> None:
        mocked_user: UserModel = UserFactory.build()
        mocked_create_user = mocker.AsyncMock(return_value=mocked_user)
        user_repository.create_user = mocked_create_user
        expected_result = mocked_user

        result = await user_service.register_user(mocked_user)

        assert result == expected_result
        user_repository.create_user.assert_called_once_with(mocked_user)

    @pytest.mark.asyncio(loop_scope="session")
    async def test_should_fail_and_raise_exception_when_user_cannot_be_registered(
        self,
        user_repository: UserRepository,
        user_service: UserService,
        mocker: MockerFixture,
    ) -> None:
        mocked_user: UserModel = UserFactory.build()
        error = Exception("Failed")
        message = "An error occurred when creating a new user into database"
        server_error = ServerError(
            message,
            status.HTTP_500_INTERNAL_SERVER_ERROR,
            Detail(context=mocked_user, cause=str(error)),
        )
        mocked_create_user = mocker.Mock(side_effect=error)
        user_repository.create_user = mocked_create_user

        with pytest.raises(ServerError) as exc_info:
            await user_service.register_user(mocked_user)

        assert exc_info.value.message == server_error.message
        assert exc_info.value.detail == server_error.detail
        assert exc_info.value.status_code == server_error.status_code
        assert exc_info.value.is_operational == server_error.is_operational
        user_repository.create_user.assert_called_once_with(mocked_user)


class TestRetrieveAndCountUsers(TestUserService):
    def test_should_define_a_method(
        self,
        user_service: UserService,
    ) -> None:
        assert (
            isinstance(user_service.retrieve_and_count_users, types.MethodType) is True
        )

    @pytest.mark.asyncio(loop_scope="session")
    async def test_should_succeed_and_return_list_of_users_with_non_zero_total_when_users_exist(
        self,
        user_repository: UserRepository,
        user_service: UserService,
        mocker: MockerFixture,
        fake: Faker,
    ) -> None:
        page = fake.pyint()
        limit = fake.pyint()
        count = fake.pyint()
        mocked_users = UserFactory.build_batch(count)
        mocked_read_and_count_users = mocker.AsyncMock(
            return_value=[mocked_users, count]
        )
        user_repository.read_and_count_users = mocked_read_and_count_users
        expected_result = [mocked_users, count]

        result = await user_service.retrieve_and_count_users(page, limit)

        assert result == expected_result
        user_repository.read_and_count_users.assert_called_once_with(page, limit)

    @pytest.mark.asyncio(loop_scope="session")
    async def test_should_fail_and_raise_exception_when_list_of_users_and_total_cannot_be_retrieved(
        self,
        user_repository: UserRepository,
        user_service: UserService,
        mocker: MockerFixture,
        fake: Faker,
    ) -> None:
        page = fake.pyint()
        limit = fake.pyint()
        error = Exception("Failed")
        message = "An error occurred when reading and counting users from database"
        server_error = ServerError(
            message,
            status.HTTP_500_INTERNAL_SERVER_ERROR,
            Detail(context={"page": page, "limit": limit}, cause=str(error)),
        )
        mocked_read_and_count_users = mocker.Mock(side_effect=error)
        user_repository.read_and_count_users = mocked_read_and_count_users

        with pytest.raises(ServerError) as exc_info:
            await user_service.retrieve_and_count_users(page, limit)

        assert exc_info.value.message == server_error.message
        assert exc_info.value.detail == server_error.detail
        assert exc_info.value.status_code == server_error.status_code
        assert exc_info.value.is_operational == server_error.is_operational
        user_repository.read_and_count_users.assert_called_once_with(page, limit)


class TestRetrieveUser(TestUserService):
    def test_should_define_a_method(
        self,
        user_service: UserService,
    ) -> None:
        assert isinstance(user_service.retrieve_user, types.MethodType) is True

    @pytest.mark.asyncio(loop_scope="session")
    async def test_should_succeed_and_return_user_when_user_is_retrieved(
        self,
        user_repository: UserRepository,
        user_service: UserService,
        mocker: MockerFixture,
    ) -> None:
        mocked_user: UserModel = UserFactory.build()
        mocked_read_user = mocker.AsyncMock(return_value=mocked_user)
        user_repository.read_user = mocked_read_user
        expected_result = mocked_user

        result = await user_service.retrieve_user(mocked_user.id)

        assert result == expected_result
        user_repository.read_user.assert_called_once_with(mocked_user.id)

    @pytest.mark.asyncio(loop_scope="session")
    async def test_should_fail_and_raise_exception_when_user_is_not_retrieved(
        self,
        user_repository: UserRepository,
        user_service: UserService,
        mocker: MockerFixture,
    ) -> None:
        mocked_user: UserModel = UserFactory.build()
        error = Exception("Failed")
        message = "An error occurred when reading a user from database"
        server_error = ServerError(
            message,
            status.HTTP_500_INTERNAL_SERVER_ERROR,
            Detail(context=mocked_user.id, cause=str(error)),
        )
        mocked_read_user = mocker.Mock(side_effect=error)
        user_repository.read_user = mocked_read_user

        with pytest.raises(ServerError) as exc_info:
            await user_service.retrieve_user(mocked_user.id)

        assert exc_info.value.message == server_error.message
        assert exc_info.value.detail == server_error.detail
        assert exc_info.value.status_code == server_error.status_code
        assert exc_info.value.is_operational == server_error.is_operational
        user_repository.read_user.assert_called_once_with(mocked_user.id)

    @pytest.mark.asyncio(loop_scope="session")
    async def test_should_fail_and_raise_exception_when_user_is_not_found(
        self,
        user_repository: UserRepository,
        user_service: UserService,
        mocker: MockerFixture,
    ) -> None:
        mocked_user: UserModel = UserFactory.build()
        message = "User not found"
        server_error = ServerError(
            message,
            status.HTTP_404_NOT_FOUND,
            Detail(context=mocked_user.id, cause=None),
        )
        mocked_read_user = mocker.AsyncMock(return_value=None)
        user_repository.read_user = mocked_read_user

        with pytest.raises(ServerError) as exc_info:
            await user_service.retrieve_user(mocked_user.id)

        assert exc_info.value.message == server_error.message
        assert exc_info.value.detail == server_error.detail
        assert exc_info.value.status_code == server_error.status_code
        assert exc_info.value.is_operational == server_error.is_operational
        user_repository.read_user.assert_called_once_with(mocked_user.id)


class TestReplaceUser(TestUserService):
    def test_should_define_a_method(
        self,
        user_service: UserService,
    ) -> None:
        assert isinstance(user_service.replace_user, types.MethodType) is True

    @pytest.mark.asyncio(loop_scope="session")
    async def test_should_succeed_and_return_user_when_user_is_replaced(
        self,
        user_repository: UserRepository,
        user_service: UserService,
        mocker: MockerFixture,
    ) -> None:
        mocked_user: UserModel = UserFactory.build()
        mocked_update_user = mocker.AsyncMock(return_value=mocked_user)
        user_repository.update_user = mocked_update_user
        expected_result = mocked_user

        result = await user_service.replace_user(mocked_user.id, mocked_user)

        assert result == expected_result
        user_repository.update_user.assert_called_once_with(mocked_user.id, mocked_user)

    @pytest.mark.asyncio(loop_scope="session")
    async def test_should_fail_and_raise_exception_when_user_is_not_replaced(
        self,
        user_repository: UserRepository,
        user_service: UserService,
        mocker: MockerFixture,
    ) -> None:
        mocked_user: UserModel = UserFactory.build()
        error = Exception("Failed")
        message = "An error occurred when updating a user in database"
        server_error = ServerError(
            message,
            status.HTTP_500_INTERNAL_SERVER_ERROR,
            Detail(
                context={"userId": mocked_user.id, "user": mocked_user},
                cause=str(error),
            ),
        )
        mocked_update_user = mocker.Mock(side_effect=error)
        user_repository.update_user = mocked_update_user

        with pytest.raises(ServerError) as exc_info:
            await user_service.replace_user(mocked_user.id, mocked_user)

        assert exc_info.value.message == server_error.message
        assert exc_info.value.detail == server_error.detail
        assert exc_info.value.status_code == server_error.status_code
        assert exc_info.value.is_operational == server_error.is_operational
        user_repository.update_user.assert_called_once_with(mocked_user.id, mocked_user)

    @pytest.mark.asyncio(loop_scope="session")
    async def test_should_fail_and_raise_exception_when_user_is_not_found(
        self,
        user_repository: UserRepository,
        user_service: UserService,
        mocker: MockerFixture,
    ) -> None:
        mocked_user: UserModel = UserFactory.build()
        message = "User not found"
        server_error = ServerError(
            message,
            status.HTTP_404_NOT_FOUND,
            Detail(context={"userId": mocked_user.id, "user": mocked_user}, cause=None),
        )
        mocked_update_user = mocker.AsyncMock(return_value=None)
        user_repository.update_user = mocked_update_user

        with pytest.raises(ServerError) as exc_info:
            await user_service.replace_user(mocked_user.id, mocked_user)

        assert exc_info.value.message == server_error.message
        assert exc_info.value.detail == server_error.detail
        assert exc_info.value.status_code == server_error.status_code
        assert exc_info.value.is_operational == server_error.is_operational
        user_repository.update_user.assert_called_once_with(mocked_user.id, mocked_user)


class TestRemoveUser(TestUserService):
    def test_should_define_a_method(
        self,
        user_service: UserService,
    ) -> None:
        assert isinstance(user_service.remove_user, types.MethodType) is True

    @pytest.mark.asyncio(loop_scope="session")
    async def test_should_succeed_and_return_user_when_user_is_removed(
        self,
        user_repository: UserRepository,
        user_service: UserService,
        mocker: MockerFixture,
    ) -> None:
        mocked_user: UserModel = UserFactory.build()
        mocked_delete_user = mocker.AsyncMock(return_value=mocked_user)
        user_repository.delete_user = mocked_delete_user
        expected_result = mocked_user

        result = await user_service.remove_user(mocked_user.id)

        assert result == expected_result
        user_repository.delete_user.assert_called_once_with(mocked_user.id)

    @pytest.mark.asyncio(loop_scope="session")
    async def test_should_fail_and_raise_exception_when_user_cannot_be_removed(
        self,
        user_repository: UserRepository,
        user_service: UserService,
        mocker: MockerFixture,
    ) -> None:
        mocked_user: UserModel = UserFactory.build()
        error = Exception("Failed")
        message = "An error occurred when deleting a user from database"
        server_error = ServerError(
            message,
            status.HTTP_500_INTERNAL_SERVER_ERROR,
            Detail(context=mocked_user.id, cause=str(error)),
        )
        mocked_delete_user = mocker.Mock(side_effect=error)
        user_repository.delete_user = mocked_delete_user

        with pytest.raises(ServerError) as exc_info:
            await user_service.remove_user(mocked_user.id)

        assert exc_info.value.message == server_error.message
        assert exc_info.value.detail == server_error.detail
        assert exc_info.value.status_code == server_error.status_code
        assert exc_info.value.is_operational == server_error.is_operational
        user_repository.delete_user.assert_called_once_with(mocked_user.id)

    @pytest.mark.asyncio(loop_scope="session")
    async def test_should_fail_and_raise_exception_when_user_is_not_found(
        self,
        user_repository: UserRepository,
        user_service: UserService,
        mocker: MockerFixture,
    ) -> None:
        mocked_user: UserModel = UserFactory.build()
        message = "User not found"
        server_error = ServerError(
            message,
            status.HTTP_404_NOT_FOUND,
            Detail(context=mocked_user.id, cause=None),
        )
        mocked_delete_user = mocker.AsyncMock(return_value=None)
        user_repository.delete_user = mocked_delete_user

        with pytest.raises(ServerError) as exc_info:
            await user_service.remove_user(mocked_user.id)

        assert exc_info.value.message == server_error.message
        assert exc_info.value.detail == server_error.detail
        assert exc_info.value.status_code == server_error.status_code
        assert exc_info.value.is_operational == server_error.is_operational
        user_repository.delete_user.assert_called_once_with(mocked_user.id)
