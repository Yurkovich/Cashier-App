
from pydantic import BaseModel


class Sale(BaseModel):
    basket: str
    quantity: int
    price: int
    date: str




