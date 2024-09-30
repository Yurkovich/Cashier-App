
from pydantic import BaseModel


class Product(BaseModel):
    name: str
    category_id: int
    cost: int


class ProductWithCategory(BaseModel):
    name: str
    category: str
    cost: int


class ProductCreate(BaseModel):
    name: str
    category_id: int
    cost: int


class ProductChange(BaseModel):
    id: int
    name: str
    category_id: int
    cost: int
    