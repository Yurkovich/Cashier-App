
from fastapi import APIRouter, HTTPException

from model.product_model import ProductCreate
from database.product_manager import ProductManager


product_router = APIRouter(tags=['Product'])


@product_router.get("/api/products/{product_id}")
async def read_product(product_id: int) -> dict:
    manager = ProductManager(id=product_id)
    product = await manager.get_product_by_id()
    if product:
        return product
    else:
        raise HTTPException(status_code=404, detail="Продукт не найден")


@product_router.get("/api/products/")
async def read_products(category_id: int) -> dict:
    manager = ProductManager(category_id=category_id)
    products = await manager.get_products_by_category()
    if products:
        return {"products": products}
    else:
        raise HTTPException(status_code=404, detail="Нет продуктов в этой категории")


@product_router.delete("/api/products/{product_id}", status_code=204)
async def delete_product(product_id: int) -> None:
    manager = ProductManager(id=product_id)
    try:
        success = await manager.delete_product()
        if not success:
            raise HTTPException(status_code=404, detail="Продукт не найден")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@product_router.post("/api/products/", response_model=ProductCreate)
async def create_product(product: ProductCreate) -> ProductCreate:
    manager = ProductManager(name=product.name, category_id=product.category_id, cost=product.cost)
    try:
        await manager.add_product()
        return product
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
