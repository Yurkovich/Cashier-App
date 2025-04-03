
from pydantic import BaseModel


class DiscountCodeModel(BaseModel):
    id: int
    code: str
    percent: int
    quantity: int


class DiscountCodeCreate(BaseModel):
    code: str
    percent: int
    quantity: int

# =====================================

class DiscountSpecialModel(BaseModel):
    id: int
    name: str
    percent: int


class DiscountSpecialCreate(BaseModel):
    name: str
    percent: int
