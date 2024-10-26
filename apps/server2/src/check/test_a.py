from src.check.a import mysum


class TestSum:
    def test_1(self):
        result = mysum(1, 3)
        assert result == 2
