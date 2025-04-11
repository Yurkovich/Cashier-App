
from pydantic import BaseModel
from typing import Optional

class DiscountSpecialBase(BaseModel):
    name: str
    percent: int

class DiscountSpecialCreate(DiscountSpecialBase):
    pass

class DiscountSpecialUpdate(BaseModel):
    name: Optional[str] = None
    percent: Optional[int] = None

class DiscountSpecialInDB(DiscountSpecialBase):
    id: int

    class Config:
        from_attributes = True 
        