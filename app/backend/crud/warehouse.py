
from sqlalchemy.orm import Session
from sqlalchemy import select
from typing import List, Optional, Dict, Any
from app.backend.model import sqlalchemy_models as models
from app.backend.schemas import WarehouseCreate, WarehouseUpdate

class WarehouseCRUD:
    @staticmethod
    async def create(db: Session, warehouse: WarehouseCreate) -> models.Warehouse:
        db_warehouse = models.Warehouse(
            barcode=warehouse.barcode,
            name=warehouse.name,
            category_id=warehouse.category_id,
            retail_price=warehouse.retail_price,
            purchasing_price=warehouse.purchasing_price,
            quantity=warehouse.quantity
        )
        db.add(db_warehouse)
        db.commit()
        db.refresh(db_warehouse)
        return db_warehouse

    @staticmethod
    async def get_all(db: Session) -> List[Dict[str, Any]]:
        result = db.execute(select(models.Warehouse))
        warehouse_items = result.scalars().all()
        return [
            {
                "id": item.id,
                "barcode": item.barcode,
                "name": item.name,
                "category_id": item.category_id,
                "retail_price": float(item.retail_price),
                "purchasing_price": float(item.purchasing_price),
                "quantity": item.quantity
            }
            for item in warehouse_items
        ]

    @staticmethod
    async def get_by_id(db: Session, warehouse_id: int) -> Optional[Dict[str, Any]]:
        result = db.execute(
            select(models.Warehouse).filter(models.Warehouse.id == warehouse_id)
        )
        item = result.scalar_one_or_none()
        if item:
            return {
                "id": item.id,
                "barcode": item.barcode,
                "name": item.name,
                "category_id": item.category_id,
                "retail_price": float(item.retail_price),
                "purchasing_price": float(item.purchasing_price),
                "quantity": item.quantity
            }
        return None

    @staticmethod
    async def get_by_barcode(db: Session, barcode: int) -> Optional[Dict[str, Any]]:
        result = db.execute(
            select(models.Warehouse).filter(models.Warehouse.barcode == barcode)
        )
        item = result.scalar_one_or_none()
        if item:
            return {
                "id": item.id,
                "barcode": item.barcode,
                "name": item.name,
                "category_id": item.category_id,
                "retail_price": float(item.retail_price),
                "purchasing_price": float(item.purchasing_price),
                "quantity": item.quantity
            }
        return None

    @staticmethod
    async def get_by_category(db: Session, category_id: int) -> List[Dict[str, Any]]:
        result = db.execute(
            select(models.Warehouse).filter(models.Warehouse.category_id == category_id)
        )
        items = result.scalars().all()
        return [
            {
                "id": item.id,
                "barcode": item.barcode,
                "name": item.name,
                "category_id": item.category_id,
                "retail_price": float(item.retail_price),
                "purchasing_price": float(item.purchasing_price),
                "quantity": item.quantity
            }
            for item in items
        ]

    @staticmethod
    async def update(db: Session, warehouse_id: int, warehouse: WarehouseUpdate) -> Optional[models.Warehouse]:
        result = db.execute(
            select(models.Warehouse).filter(models.Warehouse.id == warehouse_id)
        )
        db_warehouse = result.scalar_one_or_none()
        if db_warehouse:
            for key, value in warehouse.dict(exclude_unset=True).items():
                setattr(db_warehouse, key, value)
            db.commit()
            db.refresh(db_warehouse)
        return db_warehouse

    @staticmethod
    async def delete(db: Session, warehouse_id: int) -> bool:
        result = db.execute(
            select(models.Warehouse).filter(models.Warehouse.id == warehouse_id)
        )
        db_warehouse = result.scalar_one_or_none()
        if db_warehouse:
            db.delete(db_warehouse)
            db.commit()
            return True
        return False 
    