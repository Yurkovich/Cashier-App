
from typing import List
from fastapi import APIRouter, HTTPException

from model.warehouse_model import WarehouseCreate
from database.warehouse_manager import WarehouseManager


warehouse_router = APIRouter(tags=['Warehouse'])


@warehouse_router.post("/api/warehouse/")
async def add_item(warehouse_data: WarehouseCreate) -> dict:
    warehouse_manager = WarehouseManager(
        category=warehouse_data.category,
        name=warehouse_data.name,
        cost=warehouse_data.cost,
        quantity=warehouse_data.quantity,
        amount=warehouse_data.amount
    )
    await warehouse_manager.add_item()
    return {"message": "Товар добавлен"}


@warehouse_router.get("/api/warehouse/{item_id}")
async def get_item(item_id: int) -> dict:
    warehouse_manager = WarehouseManager(id=item_id)
    item = await warehouse_manager.get_item_by_id()
    if item is None:
        raise HTTPException(status_code=404, detail="Товар не найден")
    return item


@warehouse_router.get("/api/warehouse/", response_model=List[dict])
async def get_all_items() -> List[dict]:
    warehouse_manager = WarehouseManager()
    items = await warehouse_manager.get_all_items()
    return items


@warehouse_router.delete("/api/warehouse/{item_id}")
async def delete_item(item_id: int) -> dict:
    warehouse_manager = WarehouseManager(id=item_id)
    result = await warehouse_manager.delete_item()
    if not result:
        raise HTTPException(status_code=404, detail="Товар не найден")
    return {"message": "Товар успешно удалён"}