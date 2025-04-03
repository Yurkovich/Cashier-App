
from typing import Dict, List
from fastapi import APIRouter, HTTPException

from model.discount_model import DiscountCodeModel, DiscountCodeCreate, DiscountSpecialModel, DiscountSpecialCreate
from model.models import DiscountCode, DiscountSpecial


discount_code_router = APIRouter(tags=['Discount Code'])
discount_special_router = APIRouter(tags=['Discount Special'])


@discount_code_router.get("/api/discount_code", summary="Получить все скидки", response_model=List[Dict])
async def get_code_list() -> List[Dict]:
    try:
        codes = await DiscountCode.all()
        return codes
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
    
@discount_code_router.post("/api/discount_code", summary="Добавить скидочный код", response_model=DiscountCodeCreate)
async def create_code(code: DiscountCodeCreate) -> DiscountCodeCreate:
    try:
        await DiscountCode.add(code)
        return code
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    

@discount_code_router.put("/api/discount_code", summary="Изменить скидочный код по ID", response_model=DiscountCodeModel)
async def update_product(code: DiscountCodeModel) -> DiscountCodeModel:
    try:
        await DiscountCode.update(code)
        return code
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@discount_code_router.delete("/api/discount_code/{code_id}", summary="Удалить скидочный код по ID", status_code=204)
async def delete_code(code_id: int) -> None:
    try:
        success = await DiscountCode.delete(code_id)
        if not success:
            raise HTTPException(status_code=404, detail="Скидочный код не найден")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
    
# ==============================


@discount_special_router.get("/api/discount_special", summary="Получить все специальные скидки", response_model=List[Dict])
async def get_special_list() -> List[Dict]:
    try:
        specials = await DiscountSpecial.all()
        return specials
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@discount_special_router.post("/api/discount_special", summary="Добавить специальную скидку", response_model=DiscountSpecialCreate)
async def create_special(special: DiscountSpecialCreate) -> DiscountSpecialCreate:
    try:
        await DiscountSpecial.add(special)
        return special
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@discount_special_router.put("/api/discount_special", summary="Изменить специальную скидку по ID", response_model=DiscountSpecialModel)
async def update_special(special: DiscountSpecialModel) -> DiscountSpecialModel:
    try:
        await DiscountSpecial.update(special)
        return special
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@discount_special_router.delete("/api/discount_special/{special_id}", summary="Удалить специальную скидку по ID", status_code=204)
async def delete_special(special_id: int) -> None:
    try:
        success = await DiscountSpecial.delete(special_id)
        if not success:
            raise HTTPException(status_code=404, detail="Специальная скидка не найдена")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
