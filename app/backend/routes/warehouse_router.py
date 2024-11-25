
from typing import List
from fastapi import APIRouter, HTTPException

from model.warehouse_model import WarehouseModel, WarehouseUpdateModel
from model.models import Warehouse

warehouse_router = APIRouter(tags=['Warehouse'])


@warehouse_router.post("/api/warehouse", summary="Добавить товар на склад", response_model=WarehouseModel)
async def add_item(item: WarehouseModel) -> WarehouseModel:
    try:
        await Warehouse.add(item)
        return item
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@warehouse_router.get("/api/warehouse", summary="Получить все товары со склада", response_model=List[WarehouseModel])
async def get_all_items() -> List[WarehouseModel]:
    try:
        items = await Warehouse.all()
        return items
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@warehouse_router.get("/api/warehouse/{item_id}", summary="Получить товар по ID", response_model=WarehouseModel)
async def get_item_by_id(item_id: int) -> WarehouseModel:
    item = await Warehouse.get_by_id(item_id)
    if item:
        return item
    raise HTTPException(status_code=404, detail="Item not found")


@warehouse_router.get("/api/warehouse/name/{item_name}", summary="Получить товар по имени", response_model=WarehouseModel)
async def get_item_by_name(item_name: str) -> WarehouseModel:
    item = await Warehouse.get_by_name(item_name)
    if item:
        return item
    raise HTTPException(status_code=404, detail="Item not found")


@warehouse_router.put("/api/warehouse", summary="Обновить товар на складе", response_model=WarehouseModel)
async def update_item(item: WarehouseUpdateModel) -> WarehouseUpdateModel:
    try:
        await Warehouse.update(item)
        return item
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@warehouse_router.delete("/api/warehouse/{item_id}", summary="Удалить товар со склада")
async def delete_item(item_id: int):
    success = await Warehouse.delete(item_id)
    if success:
        return {"status": "deleted"}
    raise HTTPException(status_code=404, detail="Item not found")
