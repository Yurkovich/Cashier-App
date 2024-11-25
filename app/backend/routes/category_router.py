
from typing import Dict, List
from fastapi import APIRouter, HTTPException

from model.category_model import CategoryChange, CategoryCreate
from model.models import Category


category_router = APIRouter(tags=['Category'])


@category_router.get("/api/categories", summary="Получить все категории в иерархическом формате", response_model=List[Dict])
async def get_all_categories_nested() -> List[Dict]:
    try:
        categories = await Category.all_nested()
        return categories
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@category_router.get("/api/categories/{category_id}", summary="Получить категорию по ID")
async def read_category(category_id: int) -> dict:
    category = await Category.get_by_id(category_id)
    if category:
        return category
    else:
        raise HTTPException(status_code=404, detail="Категория не найдена")


@category_router.get("/api/categories/parent/{parent_id}", summary="Получить категории по ID родительской категории")
async def get_subcategories_by_parent(parent_id: int) -> List[dict]:
    subcategories = await Category.get_by_parent_id(parent_id)
    if subcategories:
        return subcategories
    else:
        raise HTTPException(status_code=404, detail="Подкатегории не найдены для данной родительской категории")


@category_router.post("/api/categories", summary="Добавить категорию", response_model=CategoryCreate)
async def create_category(category: CategoryCreate) -> CategoryCreate:
    try:
        await Category.add(category)
        return category
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@category_router.put("/api/categories", summary="Изменить категорию по ID", response_model=CategoryChange)
async def update_category(category: CategoryChange) -> CategoryChange:
    try:
        await Category.update(category)
        return category
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@category_router.delete("/api/categories/{category_id}", summary="Удалить категорию по ID", status_code=204)
async def delete_category(category_id: int) -> None:
    try:
        success = await Category.delete(category_id)
        if not success:
            raise HTTPException(status_code=404, detail="Категория не найдена")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
