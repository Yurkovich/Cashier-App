
from pydantic import BaseModel


class WarehouseModel(BaseModel):
    barcode: int
    name: str
    category: str
    subcategory: str
    retail_price: float
    purchasing_price: float
    quantity: int
    display: int


class WarehouseUpdateModel(BaseModel):
    id: int
    barcode: int
    name: str
    category: str
    subcategory: str
    retail_price: float
    purchasing_price: float
    quantity: int
    display: int
