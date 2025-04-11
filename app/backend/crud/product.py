
from sqlalchemy.orm import Session
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from typing import List, Optional, Dict, Any, Tuple
from app.backend.model import sqlalchemy_models as models
from app.backend.schemas import ProductCreate, ProductUpdate

class ProductCRUD:
    @staticmethod
    async def create(db: Session, product: ProductCreate) -> Tuple[Optional[models.Product], Optional[str]]:
        try:
            result = db.execute(
                select(models.Category).filter(models.Category.id == product.category_id)
            )
            category = result.scalar_one_or_none()
            if not category:
                return None, f"Category does not exist (ID: {product.category_id})"
            
            db_product = models.Product(
                name=product.name,
                category_id=product.category_id,
                cost=product.cost
            )
            db.add(db_product)
            db.commit()
            db.refresh(db_product)
            return db_product, None
        except IntegrityError as e:
            db.rollback()
            if "category_id" in str(e):
                return None, "Category does not exist"
            return None, "Data integrity error"
        except SQLAlchemyError as e:
            db.rollback()
            return None, f"Database error: {str(e)}"
        except Exception as e:
            db.rollback()
            return None, f"Unknown error: {str(e)}"

    @staticmethod
    async def get_all(db: Session) -> Tuple[List[Dict[str, Any]], Optional[str]]:
        try:
            result = db.execute(select(models.Product))
            products = result.scalars().all()
            return [{
                "id": product.id,
                "name": product.name,
                "category_id": product.category_id,
                "cost": product.cost
            } for product in products], None
        except SQLAlchemyError as e:
            return [], f"Database error: {str(e)}"
        except Exception as e:
            return [], f"Unknown error: {str(e)}"

    @staticmethod
    async def get_by_id(db: Session, product_id: int) -> Tuple[Optional[Dict[str, Any]], Optional[str]]:
        try:
            result = db.execute(
                select(models.Product).filter(models.Product.id == product_id)
            )
            product = result.scalar_one_or_none()
            if product:
                return {
                    "id": product.id,
                    "name": product.name,
                    "category_id": product.category_id,
                    "cost": product.cost
                }, None
            return None, "Product not found"
        except SQLAlchemyError as e:
            return None, f"Database error: {str(e)}"
        except Exception as e:
            return None, f"Unknown error: {str(e)}"

    @staticmethod
    async def get_by_category(db: Session, category_id: int) -> Tuple[List[Dict[str, Any]], Optional[str]]:
        try:
            result = db.execute(
                select(models.Product).filter(models.Product.category_id == category_id)
            )
            products = result.scalars().all()
            return [{
                "id": product.id,
                "name": product.name,
                "category_id": product.category_id,
                "cost": product.cost
            } for product in products], None
        except SQLAlchemyError as e:
            return [], f"Database error: {str(e)}"
        except Exception as e:
            return [], f"Unknown error: {str(e)}"

    @staticmethod
    async def update(db: Session, product_id: int, product: ProductUpdate) -> Tuple[Optional[models.Product], Optional[str]]:
        try:
            result = db.execute(
                select(models.Product).filter(models.Product.id == product_id)
            )
            db_product = result.scalar_one_or_none()
            if not db_product:
                return None, "Product not found"
            
            for key, value in product.dict(exclude_unset=True).items():
                setattr(db_product, key, value)
            
            db.commit()
            db.refresh(db_product)
            return db_product, None
        except IntegrityError as e:
            db.rollback()
            if "category_id" in str(e):
                return None, "Category does not exist"
            return None, "Data integrity error"
        except SQLAlchemyError as e:
            db.rollback()
            return None, f"Database error: {str(e)}"
        except Exception as e:
            db.rollback()
            return None, f"Unknown error: {str(e)}"

    @staticmethod
    async def delete(db: Session, product_id: int) -> Tuple[bool, Optional[str]]:
        try:
            result = db.execute(
                select(models.Product).filter(models.Product.id == product_id)
            )
            db_product = result.scalar_one_or_none()
            if not db_product:
                return False, "Product not found"
            
            db.delete(db_product)
            db.commit()
            return True, None
        except SQLAlchemyError as e:
            db.rollback()
            return False, f"Database error: {str(e)}"
        except Exception as e:
            db.rollback()
            return False, f"Unknown error: {str(e)}" 
        