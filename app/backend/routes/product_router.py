from fastapi import APIRouter, HTTPException
from model.product_model import ProductCreate, ProductChange
from model.models import Product

product_router = APIRouter(tags=['Product'])


@product_router.get("/api/all_products", summary="Получить все товары", response_model=list[dict])
async def get_all_products() -> list[dict]:
    products = await Product.all()
    if not isinstance(products, list):
        raise HTTPException(status_code=500, detail="Ошибка получения товаров: некорректный формат данных")
    return products


@product_router.get("/api/products/{product_id}", summary="Получить товар по ID")
async def read_product(product_id: int) -> dict:
    product = await Product.get_by_id(product_id)
    if product:
        return product
    else:
        raise HTTPException(status_code=404, detail="Товар не найден")


@product_router.get("/api/products/name/{product_name}", summary="Получить товар по названию")
async def read_product_by_name(product_name: str) -> dict:
    product = await Product.get_by_name(product_name)
    if product:
        return product
    else:
        raise HTTPException(status_code=404, detail="Товар не найден")


@product_router.get("/api/products", summary="Получить товары по категории")
async def read_products_by_category(category_id: int) -> dict:
    products = await Product.get_by_category(category_id)
    if products:
        return {"products": products}
    else:
        raise HTTPException(status_code=404, detail="Нет товаров в этой категории")


@product_router.post("/api/products", summary="Добавить товар", response_model=ProductCreate)
async def create_product(product: ProductCreate) -> ProductCreate:
    try:
        await Product.add(product)
        return product
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@product_router.put("/api/products", summary="Изменить товар по ID", response_model=ProductChange)
async def update_product(product: ProductChange) -> ProductChange:
    try:
        await Product.update(product)
        return product
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@product_router.delete("/api/products/{product_id}", summary="Удалить товар по ID", status_code=204)
async def delete_product(product_id: int) -> None:
    try:
        success = await Product.delete(product_id)
        if not success:
            raise HTTPException(status_code=404, detail="Товар не найден")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
