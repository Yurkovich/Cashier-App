
from sqlalchemy.orm import Session
from sqlalchemy import select
from typing import List, Optional, Dict, Any
from app.backend.model import sqlalchemy_models as models
from app.backend.schemas import DiscountSpecialCreate, DiscountSpecialUpdate

class DiscountSpecialCRUD:
    @staticmethod
    async def create(db: Session, discount: DiscountSpecialCreate) -> models.DiscountSpecial:
        db_discount = models.DiscountSpecial(
            name=discount.name,
            percent=discount.percent
        )
        db.add(db_discount)
        db.commit()
        db.refresh(db_discount)
        return db_discount

    @staticmethod
    async def get_all(db: Session) -> List[Dict[str, Any]]:
        result = db.execute(select(models.DiscountSpecial))
        discounts = result.scalars().all()
        return [
            {
                "id": discount.id,
                "name": discount.name,
                "percent": discount.percent
            }
            for discount in discounts
        ]

    @staticmethod
    async def get_by_id(db: Session, discount_id: int) -> Optional[Dict[str, Any]]:
        result = db.execute(
            select(models.DiscountSpecial).filter(models.DiscountSpecial.id == discount_id)
        )
        discount = result.scalar_one_or_none()
        if discount:
            return {
                "id": discount.id,
                "name": discount.name,
                "percent": discount.percent
            }
        return None

    @staticmethod
    async def update(db: Session, discount_id: int, discount: DiscountSpecialUpdate) -> Optional[models.DiscountSpecial]:
        result = db.execute(
            select(models.DiscountSpecial).filter(models.DiscountSpecial.id == discount_id)
        )
        db_discount = result.scalar_one_or_none()
        if db_discount:
            for key, value in discount.dict(exclude_unset=True).items():
                setattr(db_discount, key, value)
            db.commit()
            db.refresh(db_discount)
        return db_discount

    @staticmethod
    async def delete(db: Session, discount_id: int) -> bool:
        result = db.execute(
            select(models.DiscountSpecial).filter(models.DiscountSpecial.id == discount_id)
        )
        db_discount = result.scalar_one_or_none()
        if db_discount:
            db.delete(db_discount)
            db.commit()
            return True
        return False 
    