
from pydantic import BaseModel
from typing import Optional

class ProductBase(BaseModel):
    name: str
    category_id: int
    cost: int

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    category_id: Optional[int] = None
    cost: Optional[int] = None

class ProductInDB(ProductBase):
    id: int

    class Config:
        from_attributes = True

class Product(ProductBase):
    id: int
    
    class Config:
        from_attributes = True 
        