
from pydantic import BaseModel


class Category(BaseModel):
    name: str


class CategoryCreate(BaseModel):
    name: str


class CategoryChange(BaseModel):
    id: int
    name: str
