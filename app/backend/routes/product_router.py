from fastapi import APIRouter, HTTPException
from model.product_model import Product, ProductChange, ProductCreate
from database.product_manager import ProductManager


product_router = APIRouter(tags=['Product'])


@product_router.get("/api/all_products", summary="Получить все товары", response_model=list[dict])
async def get_all_products() -> list[dict]:
    manager = ProductManager()
    products = await manager.get_all_products()
    return products


@product_router.get("/api/products/{product_id}", summary="Получить товар по ID")
async def read_product(product_id: int) -> dict:
    manager = ProductManager(id=product_id)
    product = await manager.get_product_by_id()
    if product:
        return product
    else:
        raise HTTPException(status_code=404, detail="Товар не найден")


@product_router.get("/api/products", summary="Получить товары по категории")
async def read_products_by_category(category_id: int) -> dict:
    manager = ProductManager(category_id=category_id)
    products = await manager.get_products_by_category()
    if products:
        return {"products": products}
    else:
        raise HTTPException(status_code=404, detail="Нет товаров в этой категории")
    

@product_router.post("/api/products", summary="Добавить товар", response_model=ProductCreate)
async def create_product(product: ProductCreate) -> ProductCreate:
    manager = ProductManager(name=product.name, category_id=product.category_id, cost=product.cost)
    try:
        await manager.add_product()
        return product
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    

@product_router.put('/api/products', summary="Изменить товар по ID", response_model=Product)
async def change_product(product: ProductChange) -> Product:
    manager = ProductManager(
        id=product.id,
        name=product.name,
        category_id=product.category_id,
        cost=product.cost
    )
    try:
        await manager.change_product()

        return product
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@product_router.delete("/api/products/{product_id}", summary="Удалить товар по ID", status_code=204)
async def delete_product(product_id: int) -> None:
    manager = ProductManager(id=product_id)
    try:
        success = await manager.delete_product()
        if not success:
            raise HTTPException(status_code=404, detail="Товар не найден")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))