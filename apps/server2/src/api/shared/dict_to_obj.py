from uuid import UUID


class DictToObj:
    def __init__(self, input_dict: dict):
        for key, value in input_dict.items():
            if isinstance(value, UUID):
                # If the value is UUID, return the value of UUID
                value = value.hex
            setattr(self, key, value)