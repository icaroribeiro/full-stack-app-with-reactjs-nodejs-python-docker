from src.factories.abs_test_factory import AbsTestFactory


class RepositoryTestFactory(AbsTestFactory):
    async def prepare_all(self) -> None:
        await self.setup_database_container()
        await self.initialize_database()

    async def close_each(self) -> None:
        await self.clear_database_tables()

    async def close_all(self) -> None:
        await self.deactivate_database()
