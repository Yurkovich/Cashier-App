
from pydantic import BaseModel


class Category(BaseModel):
    name: str


class CategoryCreate(BaseModel):
    name: str



