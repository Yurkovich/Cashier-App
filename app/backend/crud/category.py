
from sqlalchemy.orm import Session
from sqlalchemy import select
from typing import List, Optional, Dict, Any, Tuple
from app.backend.model import sqlalchemy_models as models
from app.backend.schemas import CategoryCreate, CategoryUpdate
from sqlalchemy.exc import SQLAlchemyError, IntegrityError

class CategoryCRUD:
    @staticmethod
    async def create(db: Session, category: CategoryCreate) -> Tuple[Optional[models.Category], Optional[str]]:
        try:
            db_category = models.Category(
                name=category.name,
                parent_id=category.parent_id
            )
            db.add(db_category)
            db.commit()
            db.refresh(db_category)
            return db_category, None
        except IntegrityError as e:
            db.rollback()
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
            result = db.execute(select(models.Category))
            categories = result.scalars().all()
            return [{
                "id": category.id,
                "name": category.name,
                "parent_id": category.parent_id
            } for category in categories], None
        except SQLAlchemyError as e:
            return [], f"Database error: {str(e)}"
        except Exception as e:
            return [], f"Unknown error: {str(e)}"

    @staticmethod
    async def get_by_id(db: Session, category_id: int) -> Tuple[Optional[Dict[str, Any]], Optional[str]]:
        try:
            result = db.execute(
                select(models.Category).filter(models.Category.id == category_id)
            )
            category = result.scalar_one_or_none()
            if category:
                return {
                    "id": category.id,
                    "name": category.name,
                    "parent_id": category.parent_id
                }, None
            return None, "Category not found"
        except SQLAlchemyError as e:
            return None, f"Database error: {str(e)}"
        except Exception as e:
            return None, f"Unknown error: {str(e)}"

    @staticmethod
    async def get_by_parent_id(db: Session, parent_id: int) -> Tuple[List[Dict[str, Any]], Optional[str]]:
        try:
            result = db.execute(
                select(models.Category).filter(models.Category.parent_id == parent_id)
            )
            categories = result.scalars().all()
            return [
                {
                    "id": category.id,
                    "name": category.name,
                    "parent_id": category.parent_id
                }
                for category in categories
            ], None
        except SQLAlchemyError as e:
            return [], f"Database error: {str(e)}"
        except Exception as e:
            return [], f"Unknown error: {str(e)}"

    @staticmethod
    async def update(db: Session, category_id: int, category: CategoryUpdate) -> Tuple[Optional[models.Category], Optional[str]]:
        try:
            result = db.execute(
                select(models.Category).filter(models.Category.id == category_id)
            )
            db_category = result.scalar_one_or_none()
            if not db_category:
                return None, "Category not found"
            
            for key, value in category.dict(exclude_unset=True).items():
                setattr(db_category, key, value)
            
            db.commit()
            db.refresh(db_category)
            return db_category, None
        except IntegrityError as e:
            db.rollback()
            return None, "Data integrity error"
        except SQLAlchemyError as e:
            db.rollback()
            return None, f"Database error: {str(e)}"
        except Exception as e:
            db.rollback()
            return None, f"Unknown error: {str(e)}"

    @staticmethod
    async def delete(db: Session, category_id: int) -> Tuple[bool, Optional[str]]:
        try:
            result = db.execute(
                select(models.Category).filter(models.Category.id == category_id)
            )
            db_category = result.scalar_one_or_none()
            if not db_category:
                return False, "Category not found"
            
            db.delete(db_category)
            db.commit()
            return True, None
        except SQLAlchemyError as e:
            db.rollback()
            return False, f"Database error: {str(e)}"
        except Exception as e:
            db.rollback()
            return False, f"Unknown error: {str(e)}"

    @staticmethod
    async def all_nested(db: Session) -> Tuple[List[Dict[str, Any]], Optional[str]]:
        try:
            result = db.execute(select(models.Category))
            categories = result.scalars().all()
            
            category_dict = {
                category.id: {"id": category.id, "name": category.name, "subcategories": []}
                for category in categories
            }
            
            root_categories = [category_dict[category.id] for category in categories if category.parent_id is None]
            
            def add_subcategories(category_id):
                for category in categories:
                    if category.parent_id == category_id:
                        subcategory = category_dict[category.id]
                        category_dict[category_id]["subcategories"].append(subcategory)
                        add_subcategories(category.id)
            
            for root_category in root_categories:
                add_subcategories(root_category["id"])
                
            return root_categories, None
        except SQLAlchemyError as e:
            return [], f"Database error: {str(e)}"
        except Exception as e:
            return [], f"Unknown error: {str(e)}" 
        