
from fastapi import APIRouter, HTTPException

from model.category_model import Category, CategoryChange, CategoryCreate
from database.category_manager import CategoryManager


category_router = APIRouter(tags=['Category'])


@category_router.get("/api/categories/{category_id}", summary="Получить категорию по ID")
async def read_category(category_id: int) -> dict:
    manager = CategoryManager(id=category_id)
    category = await manager.get_category_by_id()
    if category:
        return category
    else:
        raise HTTPException(status_code=404, detail="Категория не найдена")
    

@category_router.get("/api/categories", summary="Получить все категории")
async def categories() -> dict:
    manager = CategoryManager()
    categories = await manager.get_all_categories()
    return {"categories": categories}


@category_router.post("/api/categories", summary="Добавить категорию", response_model=CategoryCreate)
async def create_category(category: CategoryCreate) -> CategoryCreate:
    manager = CategoryManager(name=category.name)
    try:
        await manager.add_category()
        return category
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    

@category_router.put('/api/categories', summary="Изменить категорию по ID", response_model=CategoryChange)
async def change_category(category: CategoryChange) -> CategoryChange:
    manager = CategoryManager(id=category.id, name=category.name)
    try:
        await manager.change_category()
        return category
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    
@category_router.delete("/api/categories/{category_id}", summary="Удалить категорию по ID", status_code=204)
async def delete_category(category_id: int) -> None:
    manager = CategoryManager(id=category_id)
    try:
        success = await manager.delete_category()
        if not success:
            raise HTTPException(status_code=404, detail="Категория не найдена")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
