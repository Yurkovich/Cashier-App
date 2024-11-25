
from typing import Optional
from pydantic import BaseModel


class CategoryModel(BaseModel):
    id: Optional[int]
    name: str
    parent_id: Optional[int]


class CategoryCreate(BaseModel):
    name: str
    parent_id: Optional[int] = None


class CategoryChange(BaseModel):
    id: int
    name: str
    parent_id: Optional[int] = None
    