
from pydantic import BaseModel


class WarehouseModel(BaseModel):
    id: int
    barcode: int
    name: str
    category: int
    retail_price: float
    purchasing_price: float
    quantity: int
    display: int


class WarehouseUpdateModel(BaseModel):
    id: int
    barcode: int
    name: str
    category: int
    retail_price: float
    purchasing_price: float
    quantity: int
    display: int
