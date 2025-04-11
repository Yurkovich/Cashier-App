
from pydantic import BaseModel
from typing import Optional

class DiscountCodeBase(BaseModel):
    code: str
    percent: int
    quantity: int

class DiscountCodeCreate(DiscountCodeBase):
    pass

class DiscountCodeUpdate(BaseModel):
    code: Optional[str] = None
    percent: Optional[int] = None
    quantity: Optional[int] = None

class DiscountCodeInDB(DiscountCodeBase):
    id: int

    class Config:
        from_attributes = True 
        