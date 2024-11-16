import types

import pytest
from src.api.components.user.user_mapper import UserMapper
from src.api.shared.api_pagination_response import APIPaginationResponse
from src.services.api_pagination_service import APIPaginationData, APIPaginationService
from tests.factories.user_factory import UserFactory


class TestAPIPaginationService:
    @pytest.fixture
    def base_url(self) -> str:
        return "http://localhost:5002/users"

    @pytest.fixture
    def api_pagination_service(self) -> APIPaginationService:
        return APIPaginationService()


class TestCreateAPIPaginationResponse(TestAPIPaginationService):
    def test_should_define_a_method(
        self,
        api_pagination_service: APIPaginationService,
    ) -> None:
        assert (
            isinstance(
                api_pagination_service.create_api_pagination_response, types.MethodType
            )
            is True
        )

    def test_should_succeed_and_return_a_response_with_neither_previous_nor_next_fields_when_there_is_no_records(
        base_url: str,
        api_pagination_service: APIPaginationService,
    ) -> None:
        page = 1
        limit = 1
        total_pages = 0
        total_records = 0
        count = 0
        records = [
            UserMapper.to_response(mocked_user)
            for mocked_user in UserFactory.build_batch(count)
        ]
        api_pagination_data = APIPaginationData(
            page=page, limit=limit, total_records=total_records, records=records
        )
        expected_result = APIPaginationResponse(
            page=api_pagination_data.page,
            limit=api_pagination_data.limit,
            total_pages=total_pages,
            total_records=total_records,
            records=records,
            previous=None,
            next=None,
        )

        result = api_pagination_service.create_api_pagination_response(
            base_url, api_pagination_data
        )

        assert result == expected_result
