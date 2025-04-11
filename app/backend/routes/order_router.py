
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any

from app.backend.database.database import get_db
from app.backend.crud import OrderCRUD
from app.backend.schemas.order import OrderCreate, OrderInDB, OrderUpdate

order_router = APIRouter(tags=['Order'])

@order_router.post("/api/orders", response_model=Dict[str, Any])
async def create_order(order: OrderCreate, db: Session = Depends(get_db)):
    order_dict, error = await OrderCRUD.create(db, order)
    
    if error:
        raise HTTPException(status_code=400, detail=error)
    
    return order_dict

@order_router.put("/api/orders/{order_id}", response_model=Dict[str, Any])
async def update_order(order_id: int, order: OrderUpdate, db: Session = Depends(get_db)):
    order_dict, error = await OrderCRUD.update(db, order_id, order)
    
    if error:
        raise HTTPException(status_code=400, detail=error)
    
    return order_dict

@order_router.get("/api/orders", response_model=List[Dict[str, Any]])
async def get_orders(db: Session = Depends(get_db)):
    orders, error = await OrderCRUD.get_all(db)
    
    if error:
        raise HTTPException(status_code=400, detail=error)
    
    return orders

@order_router.get("/api/orders/{order_id}", response_model=Dict[str, Any])
async def get_order(order_id: int, db: Session = Depends(get_db)):
    order, error = await OrderCRUD.get_by_id(db, order_id)
    
    if error:
        raise HTTPException(status_code=404, detail=error)
    
    return order

@order_router.delete("/api/orders/{order_id}")
async def delete_order(order_id: int, db: Session = Depends(get_db)):
    success, error = await OrderCRUD.delete(db, order_id)
    
    if error:
        raise HTTPException(status_code=404, detail=error)
    
    return {"message": f"Order with ID {order_id} deleted successfully"} 
