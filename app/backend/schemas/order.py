
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from decimal import Decimal

class OrderItemBase(BaseModel):
    product_id: int
    quantity: int
    price: Decimal

class OrderItemCreate(OrderItemBase):
    pass

class OrderItemInDB(OrderItemBase):
    id: int
    order_id: int

    class Config:
        from_attributes = True

class OrderBase(BaseModel):
    total_cost: Decimal
    discount: int = 0

class OrderCreate(OrderBase):
    items: List[OrderItemCreate]

class OrderUpdate(BaseModel):
    total_cost: Optional[Decimal] = None
    discount: Optional[int] = None
    items: Optional[List[OrderItemCreate]] = None

class OrderInDB(OrderBase):
    id: int
    order_date: datetime
    items: List[OrderItemInDB]

    class Config:
        from_attributes = True 
        