
from typing import Dict, List
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session

from app.backend.database.database import get_db
from app.backend.crud import CategoryCRUD
from app.backend.schemas import CategoryCreate, CategoryUpdate, CategoryInDB, NestedCategory

category_router = APIRouter(tags=['Category'])


@category_router.get("/api/categories", response_model=List[CategoryInDB])
async def get_categories(db: Session = Depends(get_db)):
    categories, error = await CategoryCRUD.get_all(db)
    if error:
        raise HTTPException(status_code=500, detail=error)
    return categories


@category_router.get("/api/categories/nested", response_model=List[NestedCategory])
async def get_nested_categories(db: Session = Depends(get_db)):
    categories, error = await CategoryCRUD.all_nested(db)
    if error:
        raise HTTPException(status_code=500, detail=error)
    return categories


@category_router.get("/api/categories/{category_id}", response_model=CategoryInDB)
async def get_category(category_id: int, db: Session = Depends(get_db)):
    category, error = await CategoryCRUD.get_by_id(db, category_id)
    if error:
        if error == "Category not found":
            raise HTTPException(status_code=404, detail=error)
        raise HTTPException(status_code=500, detail=error)
    return category


@category_router.get("/api/categories/parent/{parent_id}", response_model=List[CategoryInDB])
async def get_subcategories(parent_id: int, db: Session = Depends(get_db)):
    subcategories, error = await CategoryCRUD.get_by_parent_id(db, parent_id)
    if error:
        raise HTTPException(status_code=500, detail=error)
    return subcategories


@category_router.post("/api/categories", response_model=CategoryInDB)
async def create_category(category: CategoryCreate, db: Session = Depends(get_db)):
    new_category, error = await CategoryCRUD.create(db, category)
    if error:
        raise HTTPException(status_code=500, detail=error)
    return new_category


@category_router.put("/api/categories/{category_id}", response_model=CategoryInDB)
async def update_category(category_id: int, category: CategoryUpdate, db: Session = Depends(get_db)):
    updated_category, error = await CategoryCRUD.update(db, category_id, category)
    if error:
        if error == "Category not found":
            raise HTTPException(status_code=404, detail=error)
        raise HTTPException(status_code=500, detail=error)
    return updated_category


@category_router.delete("/api/categories/{category_id}")
async def delete_category(category_id: int, db: Session = Depends(get_db)):
    success, error = await CategoryCRUD.delete(db, category_id)
    if error:
        if error == "Category not found":
            raise HTTPException(status_code=404, detail=error)
        raise HTTPException(status_code=500, detail=error)
    return {"message": "Category deleted successfully"}

