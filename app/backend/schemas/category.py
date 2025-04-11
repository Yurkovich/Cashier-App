
from pydantic import BaseModel
from typing import Optional, List

class CategoryBase(BaseModel):
    name: str
    parent_id: Optional[int] = None

class CategoryCreate(CategoryBase):
    pass

class CategoryUpdate(CategoryBase):
    name: Optional[str] = None

class CategoryInDB(CategoryBase):
    id: int

    class Config:
        from_attributes = True

class NestedCategory(BaseModel):
    id: int
    name: str
    subcategories: List['NestedCategory'] = []

    class Config:
        from_attributes = True

# This is needed for recursive schema
NestedCategory.model_rebuild() 
