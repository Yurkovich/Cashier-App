
from typing import Dict, List
from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.orm import Session

from app.backend.database.database import get_db
from app.backend.crud import ProductCRUD
from app.backend.schemas import ProductCreate, ProductUpdate, ProductInDB

product_router = APIRouter(tags=['Product'])


@product_router.get("/api/products", summary="Получить все продукты", response_model=List[Dict])
async def get_all_products(db: Session = Depends(get_db)) -> List[Dict]:
    products, error = await ProductCRUD.get_all(db)
    if error:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=error)
    return products


@product_router.get("/api/products/{product_id}", summary="Получить продукт по ID", response_model=ProductInDB)
async def read_product(product_id: int, db: Session = Depends(get_db)) -> ProductInDB:
    product, error = await ProductCRUD.get_by_id(db, product_id)
    if error:
        if error == "Product not found":
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=error)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=error)
    return product


@product_router.get("/api/products/category/{category_id}", summary="Получить продукты по ID категории", response_model=List[Dict])
async def get_products_by_category(category_id: int, db: Session = Depends(get_db)) -> List[Dict]:
    products, error = await ProductCRUD.get_by_category(db, category_id)
    if error:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=error)
    if not products:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No products found for this category")
    return products


@product_router.post("/api/products", summary="Добавить продукт", response_model=ProductInDB, status_code=status.HTTP_201_CREATED)
async def create_product(product: ProductCreate, db: Session = Depends(get_db)) -> ProductInDB:
    new_product, error = await ProductCRUD.create(db, product)
    if error:
        if "Category does not exist" in error:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=error)
        if "Data integrity error" in error:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=error)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=error)
    return new_product


@product_router.put("/api/products/{product_id}", summary="Изменить продукт по ID", response_model=ProductInDB)
async def update_product(product_id: int, product: ProductUpdate, db: Session = Depends(get_db)) -> ProductInDB:
    updated_product, error = await ProductCRUD.update(db, product_id, product)
    if error:
        if error == "Product not found":
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=error)
        if "Category does not exist" in error:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=error)
        if "Data integrity error" in error:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=error)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=error)
    return updated_product


@product_router.delete("/api/products/{product_id}", summary="Удалить продукт по ID", status_code=status.HTTP_204_NO_CONTENT)
async def delete_product(product_id: int, db: Session = Depends(get_db)) -> None:
    success, error = await ProductCRUD.delete(db, product_id)
    if error:
        if error == "Product not found":
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=error)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=error)
