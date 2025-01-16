
from pydantic import BaseModel


class WarehouseModel(BaseModel):
    barcode: int
    name: str
    category_id: int
    retail_price: float
    purchasing_price: float
    quantity: int


class WarehouseCreateModel(BaseModel):
    barcode: int
    name: str
    category_id: int
    retail_price: float
    purchasing_price: float
    quantity: int


class WarehouseUpdateModel(BaseModel):
    id: int
    barcode: int
    name: str
    category_id: int
    retail_price: float
    purchasing_price: float
    quantity: int
