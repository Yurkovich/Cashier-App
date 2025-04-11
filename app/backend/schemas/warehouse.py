
from pydantic import BaseModel
from typing import Optional
from decimal import Decimal

class WarehouseBase(BaseModel):
    barcode: int
    name: str
    category_id: int
    retail_price: Decimal
    purchasing_price: Decimal
    quantity: int

class WarehouseCreate(WarehouseBase):
    pass

class WarehouseUpdate(BaseModel):
    barcode: Optional[int] = None
    name: Optional[str] = None
    category_id: Optional[int] = None
    retail_price: Optional[Decimal] = None
    purchasing_price: Optional[Decimal] = None
    quantity: Optional[int] = None

class WarehouseInDB(WarehouseBase):
    id: int

    class Config:
        from_attributes = True 
