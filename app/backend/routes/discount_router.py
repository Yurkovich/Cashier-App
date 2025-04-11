
from typing import Dict, List
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session

from app.backend.database.database import get_db
from app.backend.crud import DiscountCodeCRUD, DiscountSpecialCRUD
from app.backend.schemas import (
    DiscountCodeCreate, DiscountCodeUpdate, DiscountCodeInDB,
    DiscountSpecialCreate, DiscountSpecialUpdate, DiscountSpecialInDB
)

discount_router = APIRouter(tags=['Discount'])

@discount_router.get("/api/discount-codes", response_model=List[DiscountCodeInDB])
async def get_discount_codes(db: Session = Depends(get_db)):
    codes = await DiscountCodeCRUD.get_all(db)
    return codes

@discount_router.get("/api/discount-codes/{discount_id}", response_model=DiscountCodeInDB)
async def get_discount_code(discount_id: int, db: Session = Depends(get_db)):
    code = await DiscountCodeCRUD.get_by_id(db, discount_id)
    if code is None:
        raise HTTPException(status_code=404, detail="Discount code not found")
    return code

@discount_router.get("/api/discount-codes/code/{code}", response_model=DiscountCodeInDB)
async def get_discount_code_by_code(code: str, db: Session = Depends(get_db)):
    discount_code = await DiscountCodeCRUD.get_by_code(db, code)
    if discount_code is None:
        raise HTTPException(status_code=404, detail="Discount code not found")
    return discount_code

@discount_router.post("/api/discount-codes", response_model=DiscountCodeInDB)
async def create_discount_code(discount: DiscountCodeCreate, db: Session = Depends(get_db)):
    new_code = await DiscountCodeCRUD.create(db, discount)
    return new_code

@discount_router.put("/api/discount-codes/{discount_id}", response_model=DiscountCodeInDB)
async def update_discount_code(discount_id: int, discount: DiscountCodeUpdate, db: Session = Depends(get_db)):
    updated_code = await DiscountCodeCRUD.update(db, discount_id, discount)
    if updated_code is None:
        raise HTTPException(status_code=404, detail="Discount code not found")
    return updated_code

@discount_router.delete("/api/discount-codes/{discount_id}")
async def delete_discount_code(discount_id: int, db: Session = Depends(get_db)):
    success = await DiscountCodeCRUD.delete(db, discount_id)
    if not success:
        raise HTTPException(status_code=404, detail="Discount code not found")
    return {"message": "Discount code deleted successfully"}

@discount_router.get("/api/discount-specials", response_model=List[DiscountSpecialInDB])
async def get_discount_specials(db: Session = Depends(get_db)):
    specials = await DiscountSpecialCRUD.get_all(db)
    return specials

@discount_router.get("/api/discount-specials/{discount_id}", response_model=DiscountSpecialInDB)
async def get_discount_special(discount_id: int, db: Session = Depends(get_db)):
    special = await DiscountSpecialCRUD.get_by_id(db, discount_id)
    if special is None:
        raise HTTPException(status_code=404, detail="Discount special not found")
    return special

@discount_router.post("/api/discount-specials", response_model=DiscountSpecialInDB)
async def create_discount_special(discount: DiscountSpecialCreate, db: Session = Depends(get_db)):
    new_special = await DiscountSpecialCRUD.create(db, discount)
    return new_special

@discount_router.put("/api/discount-specials/{discount_id}", response_model=DiscountSpecialInDB)
async def update_discount_special(discount_id: int, discount: DiscountSpecialUpdate, db: Session = Depends(get_db)):
    updated_special = await DiscountSpecialCRUD.update(db, discount_id, discount)
    if updated_special is None:
        raise HTTPException(status_code=404, detail="Discount special not found")
    return updated_special

@discount_router.delete("/api/discount-specials/{discount_id}")
async def delete_discount_special(discount_id: int, db: Session = Depends(get_db)):
    success = await DiscountSpecialCRUD.delete(db, discount_id)
    if not success:
        raise HTTPException(status_code=404, detail="Discount special not found")
    return {"message": "Discount special deleted successfully"}
