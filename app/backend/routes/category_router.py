
from fastapi import APIRouter, HTTPException

from model.category_model import CategoryCreate
from database.category_manager import CategoryManager


category_router = APIRouter(tags=['Category'])


@category_router.get("/api/categories/{category_id}")
async def read_category(category_id: int):
    manager = CategoryManager(id=category_id)
    category = await manager.get_category_by_id()
    if category:
        return category
    else:
        raise HTTPException(status_code=404, detail="Несуществующая категория")
    

@category_router.get("/api/categories/")
async def categories():
    manager = CategoryManager()
    categories = await manager.get_all_categories()
    return {"categories": categories}
    

@category_router.delete("/api/categories/{category_id}", status_code=204)
async def delete_category(category_id: int):
    manager = CategoryManager(id=category_id)
    try:
        success = await manager.delete_category()
        if not success:
            raise HTTPException(status_code=404, detail="Category not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@category_router.post("/api/categories/", response_model=CategoryCreate)
async def create_category(category: CategoryCreate):
    manager = CategoryManager(name=category.name)
    try:
        await manager.add_category()
        return category
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))