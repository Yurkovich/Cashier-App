
from pydantic import BaseModel


class Warehouse(BaseModel):
    category: str
    name: str
    cost: int
    quantity: int
    amount: int


class WarehouseCreate(BaseModel):
    category: str
    name: str
    cost: int
    quantity: int
    amount: int
    