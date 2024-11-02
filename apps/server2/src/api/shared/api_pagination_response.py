from typing import Generic, List, Optional, TypeVar

from pydantic import BaseModel

T = TypeVar("T")


class APIPaginationResponse(BaseModel, Generic[T]):
    page: int
    limit: int
    totalPages: int
    totalRecords: int
    records: List[T]
    previous: Optional[str] = None
    next: Optional[str] = None


# from typing import List, Optional, TypeVar, Generic, Type

# T = TypeVar('T')

# class Data(Generic[T]):

#     _data: List[Optional[T]]
#     _data_type: Type[T]

#     def __init__(self, length: int, data_type: Type[T]):
#         self._data = [None] * length
#         self._data_type = data_type

#     def set_field(self, index: int, value: T):
#         if isinstance(value, self._data_type):
#             self._data[index] = value
#         raise TypeError()
