
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from typing import List, Dict, Any, Tuple, Optional
from datetime import datetime

from app.backend.model import sqlalchemy_models as models
from app.backend.schemas.order import OrderCreate, OrderInDB, OrderUpdate

class OrderCRUD:
    @staticmethod
    async def create(db: Session, order: OrderCreate) -> Tuple[Dict[str, Any], Optional[str]]:
        try:
            db_order = models.Order(
                total_cost=order.total_cost,
                discount=order.discount,
                order_date=datetime.now()
            )
            db.add(db_order)
            db.flush()
            
            for item in order.items:
                db_item = models.OrderItem(
                    order_id=db_order.id,
                    product_id=item.product_id,
                    quantity=item.quantity,
                    price=item.price
                )
                db.add(db_item)
            
            db.commit()
            db.refresh(db_order)
            
            order_dict = {
                "id": db_order.id,
                "total_cost": db_order.total_cost,
                "discount": db_order.discount,
                "order_date": db_order.order_date,
                "items": [
                    {
                        "id": item.id,
                        "order_id": item.order_id,
                        "product_id": item.product_id,
                        "quantity": item.quantity,
                        "price": item.price
                    }
                    for item in db_order.items
                ]
            }
            
            return order_dict, None
        except SQLAlchemyError as e:
            db.rollback()
            return {}, f"Database error: {str(e)}"
        except Exception as e:
            db.rollback()
            return {}, f"Error creating order: {str(e)}"
    
    @staticmethod
    async def get_all(db: Session) -> Tuple[List[Dict[str, Any]], Optional[str]]:
        try:
            orders = db.query(models.Order).all()
            
            result = []
            for order in orders:
                order_dict = {
                    "id": order.id,
                    "total_cost": order.total_cost,
                    "discount": order.discount,
                    "order_date": order.order_date,
                    "items": [
                        {
                            "id": item.id,
                            "order_id": item.order_id,
                            "product_id": item.product_id,
                            "product_name": item.product.name if item.product else "Неизвестный товар",
                            "quantity": item.quantity,
                            "price": item.price
                        }
                        for item in order.items
                    ]
                }
                result.append(order_dict)
            
            return result, None
        except SQLAlchemyError as e:
            return [], f"Database error: {str(e)}"
        except Exception as e:
            return [], f"Error getting orders: {str(e)}"
    
    @staticmethod
    async def get_by_id(db: Session, order_id: int) -> Tuple[Dict[str, Any], Optional[str]]:
        try:
            order = db.query(models.Order).filter(models.Order.id == order_id).first()
            
            if not order:
                return {}, f"Order with ID {order_id} not found"
            
            order_dict = {
                "id": order.id,
                "total_cost": order.total_cost,
                "discount": order.discount,
                "order_date": order.order_date,
                "items": [
                    {
                        "id": item.id,
                        "order_id": item.order_id,
                        "product_id": item.product_id,
                        "quantity": item.quantity,
                        "price": item.price
                    }
                    for item in order.items
                ]
            }
            
            return order_dict, None
        except SQLAlchemyError as e:
            return {}, f"Database error: {str(e)}"
        except Exception as e:
            return {}, f"Error getting order: {str(e)}"
    
    @staticmethod
    async def delete(db: Session, order_id: int) -> Tuple[bool, Optional[str]]:
        try:
            order = db.query(models.Order).filter(models.Order.id == order_id).first()
            
            if not order:
                return False, f"Order with ID {order_id} not found"
            
            db.delete(order)
            db.commit()
            
            return True, None
        except SQLAlchemyError as e:
            db.rollback()
            return False, f"Database error: {str(e)}"
        except Exception as e:
            db.rollback()
            return False, f"Error deleting order: {str(e)}"

    @staticmethod
    async def update(db: Session, order_id: int, order: OrderUpdate) -> Tuple[Dict[str, Any], Optional[str]]:
        try:
            db_order = db.query(models.Order).filter(models.Order.id == order_id).first()
            
            if not db_order:
                return {}, f"Order with ID {order_id} not found"
            
            if order.total_cost is not None:
                db_order.total_cost = order.total_cost
            if order.discount is not None:
                db_order.discount = order.discount
            
            if order.items is not None:
                db.query(models.OrderItem).filter(models.OrderItem.order_id == order_id).delete()
                
                for item in order.items:
                    db_item = models.OrderItem(
                        order_id=order_id,
                        product_id=item.product_id,
                        quantity=item.quantity,
                        price=item.price
                    )
                    db.add(db_item)
            
            db.commit()
            db.refresh(db_order)
            
            order_dict = {
                "id": db_order.id,
                "total_cost": db_order.total_cost,
                "discount": db_order.discount,
                "order_date": db_order.order_date,
                "items": [
                    {
                        "id": item.id,
                        "order_id": item.order_id,
                        "product_id": item.product_id,
                        "quantity": item.quantity,
                        "price": item.price
                    }
                    for item in db_order.items
                ]
            }
            
            return order_dict, None
        except SQLAlchemyError as e:
            db.rollback()
            return {}, f"Database error: {str(e)}"
        except Exception as e:
            db.rollback()
            return {}, f"Error updating order: {str(e)}" 
        