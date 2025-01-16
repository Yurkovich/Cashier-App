
from typing import List
from fastapi import APIRouter, HTTPException

from model.warehouse_model import WarehouseCreateModel, WarehouseUpdateModel
from model.models import Warehouse

warehouse_router = APIRouter(tags=['Warehouse'])


@warehouse_router.post("/api/warehouse", summary="Добавить товар на склад")
async def add_item(item: WarehouseCreateModel) -> WarehouseCreateModel:
    try:
        await Warehouse.add(item)
        return item
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@warehouse_router.get("/api/all_warehouse", summary="Получить все товары", response_model=list[dict])
async def get_all_warehouse() -> list[dict]:
    items = await Warehouse.all()
    if not isinstance(items, list):
        raise HTTPException(status_code=500, detail="Ошибка получения товаров: некорректный формат данных")
    return items
    

@warehouse_router.get("/api/warehouse/barcode/{barcode}", summary="Получить товар по баркоду")
async def get_item_by_barcode(barcode: int) -> dict:
    item = await Warehouse.get_by_barcode(barcode)
    if item:
        return item
    raise HTTPException(status_code=404, detail="Item not found")


@warehouse_router.get("/api/warehouse/item_id/{item_id}", summary="Получить товар по ID")
async def get_item_by_id(item_id: int) -> dict:
    item = await Warehouse.get_by_id(item_id)
    if item:
        return item
    raise HTTPException(status_code=404, detail="Item not found")


@warehouse_router.get("/api/warehouse/{item_name}", summary="Получить товар по имени")
async def get_item_by_name(item_name: str) -> dict:
    item = await Warehouse.get_by_name(item_name)
    if item:
        return item
    raise HTTPException(status_code=404, detail="Item not found")


@warehouse_router.put("/api/warehouse", summary="Обновить товар на складе")
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
