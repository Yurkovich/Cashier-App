
from typing import Dict, List
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session

from app.backend.database.database import get_db
from app.backend.crud import WarehouseCRUD
from app.backend.schemas import WarehouseCreate, WarehouseUpdate, WarehouseInDB

warehouse_router = APIRouter(tags=['Warehouse'])


@warehouse_router.get("/api/warehouse", response_model=List[WarehouseInDB])
async def get_warehouse_items(db: Session = Depends(get_db)):
    items = await WarehouseCRUD.get_all(db)
    return items


@warehouse_router.get("/api/warehouse/{warehouse_id}", response_model=WarehouseInDB)
async def get_warehouse_item(warehouse_id: int, db: Session = Depends(get_db)):
    item = await WarehouseCRUD.get_by_id(db, warehouse_id)
    if item is None:
        raise HTTPException(status_code=404, detail="Warehouse item not found")
    return item


@warehouse_router.get("/api/warehouse/barcode/{barcode}", response_model=WarehouseInDB)
async def get_warehouse_item_by_barcode(barcode: int, db: Session = Depends(get_db)):
    item = await WarehouseCRUD.get_by_barcode(db, barcode)
    if item is None:
        raise HTTPException(status_code=404, detail="Warehouse item not found")
    return item


@warehouse_router.get("/api/warehouse/category/{category_id}", response_model=List[WarehouseInDB])
async def get_warehouse_items_by_category(category_id: int, db: Session = Depends(get_db)):
    items = await WarehouseCRUD.get_by_category(db, category_id)
    return items


@warehouse_router.post("/api/warehouse", response_model=WarehouseInDB)
async def create_warehouse_item(item: WarehouseCreate, db: Session = Depends(get_db)):
    new_item = await WarehouseCRUD.create(db, item)
    return new_item


@warehouse_router.put("/api/warehouse/{warehouse_id}", response_model=WarehouseInDB)
async def update_warehouse_item(warehouse_id: int, item: WarehouseUpdate, db: Session = Depends(get_db)):
    updated_item = await WarehouseCRUD.update(db, warehouse_id, item)
    if updated_item is None:
        raise HTTPException(status_code=404, detail="Warehouse item not found")
    return updated_item


@warehouse_router.delete("/api/warehouse/{warehouse_id}")
async def delete_warehouse_item(warehouse_id: int, db: Session = Depends(get_db)):
    success = await WarehouseCRUD.delete(db, warehouse_id)
    if not success:
        raise HTTPException(status_code=404, detail="Warehouse item not found")
    return {"message": "Warehouse item deleted successfully"}
