from abc import ABC, abstractmethod
import os
from typing import Any, Dict, List, Optional
import aiosqlite
from dotenv import load_dotenv

from model.warehouse_model import WarehouseModel, WarehouseUpdateModel
from model.category_model import CategoryChange, CategoryCreate
from model.product_model import ProductChange, ProductCreate

load_dotenv(dotenv_path='app/backend/config.env')
db_path = os.getenv('DB_PATH')


class DatabaseConnection:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._connection = None
        return cls._instance

    async def connect(self):
        if self._connection is None:
            self._connection = await aiosqlite.connect(db_path)
        return self._connection

    async def close(self):
        if self._connection is not None:
            await self._connection.close()
            self._connection = None


class Model(ABC):
    @staticmethod
    @abstractmethod
    async def all() -> List[Any]:
        raise NotImplementedError

    @staticmethod
    @abstractmethod
    async def add(data: Any) -> None:
        raise NotImplementedError

    @staticmethod
    @abstractmethod
    async def update(data: Any) -> None:
        raise NotImplementedError

    @staticmethod
    @abstractmethod
    async def delete(entity_id: int) -> bool:
        raise NotImplementedError

    @staticmethod
    @abstractmethod
    async def get_by_id(entity_id: int) -> Optional[Any]:
        raise NotImplementedError

    @staticmethod
    @abstractmethod
    async def get_by_name(name: str) -> Optional[Any]:
        raise NotImplementedError

    @staticmethod
    @abstractmethod
    async def get_by_category(category_id: int) -> List[Any]:
        raise NotImplementedError

    @staticmethod
    @abstractmethod
    async def get_by_barcode(barcode: int) -> List[Any]:
        raise NotImplementedError


class Product(Model, ABC):
    def __init__(self, name: str, category_id: int, cost: int) -> None:
        self.name = name
        self.category_id = category_id
        self.cost = cost
        self.id = id

    @staticmethod
    async def add(product_data: ProductCreate) -> None:
        connection = await DatabaseConnection().connect()
        async with connection.cursor() as cursor:
            await cursor.execute(
                "INSERT INTO product (name, category_id, cost) VALUES (?, ?, ?)",
                (product_data.name, product_data.category_id, product_data.cost)
            )
            await connection.commit()

    @staticmethod
    async def all() -> List[dict]:
        connection = await DatabaseConnection().connect()
        async with connection.cursor() as cursor:
            await cursor.execute(
                "SELECT id, name, category_id, cost FROM product"
            )
            results = await cursor.fetchall()
            return [
                {
                "id": row[0], 
                "name": row[1], 
                "category_id": row[2], 
                "cost": row[3]
                }
                for row in results
            ]

    @staticmethod
    async def update(product_data: ProductChange) -> None:
        connection = await DatabaseConnection().connect()
        async with connection.cursor() as cursor:
            await cursor.execute(
                '''UPDATE product
                   SET name = ?, category_id = ?, cost = ?
                   WHERE id = ?''',
                (product_data.name, product_data.category_id, product_data.cost, product_data.id)
            )
            await connection.commit()

    @staticmethod
    async def delete(product_id: int) -> bool:
        connection = await DatabaseConnection().connect()
        async with connection.cursor() as cursor:
            await cursor.execute(
                "DELETE FROM product WHERE id = ?",
                (product_id,)
            )
            await connection.commit()
            return cursor.rowcount > 0

    @staticmethod
    async def get_by_id(product_id: int) -> Optional[dict]:
        connection = await DatabaseConnection().connect()
        async with connection.cursor() as cursor:
            await cursor.execute(
                "SELECT id, name, category_id, cost FROM product WHERE id = ?",
                (product_id,)
            )
            result = await cursor.fetchone()
            if result:
                return {
                    "id": result[0],
                    "name": result[1],
                    "category_id": result[2],
                    "cost": result[3]
                    }
            return None

    @staticmethod
    async def get_by_name(product_name: str) -> Optional[dict]:
        connection = await DatabaseConnection().connect()
        async with connection.cursor() as cursor:
            await cursor.execute(
                "SELECT id, name, category_id, cost FROM product WHERE name = ?",
                (product_name,)
            )
            result = await cursor.fetchone()
            if result:
                return {
                    "id": result[0],
                    "name": result[1],
                    "category_id": result[2],
                    "cost": result[3]
                    }
            return None

    @staticmethod
    async def get_by_category(category_id: int) -> List[dict]:
        connection = await DatabaseConnection().connect()
        async with connection.cursor() as cursor:
            await cursor.execute(
                "SELECT id, name, cost FROM product WHERE category_id = ?",
                (category_id,)
            )
            results = await cursor.fetchall()
            return [
                    {
                    "id": row[0], 
                    "name": row[1], 
                    "cost": row[2]
                    } 
                    for row in results
                ]


class Category(Model, ABC):
    def __init__(self, name: str = None, id: int = None) -> None:
        self.name = name
        self.id = id

    @staticmethod
    async def add(category_data: CategoryCreate) -> None:
        connection = await DatabaseConnection().connect()
        async with connection.cursor() as cursor:
            await cursor.execute(
                "INSERT INTO category (name) VALUES (?)",
                (category_data.name,)
            )
            await connection.commit()

    @staticmethod
    async def all() -> List[Dict[str, int | str]]:
        connection = await DatabaseConnection().connect()
        async with connection.cursor() as cursor:
            await cursor.execute(
                "SELECT id, name FROM category"
            )
            results = await cursor.fetchall()
            return [
                    {
                    "id": row[0],
                    "name": row[1]
                    }
                    for row in results
                ]

    @staticmethod
    async def update(category_data: CategoryChange) -> None:
        connection = await DatabaseConnection().connect()
        async with connection.cursor() as cursor:
            await cursor.execute(
                '''UPDATE category
                   SET name = ?
                   WHERE id = ?''',
                (category_data.name, category_data.id)
            )
            await connection.commit()

    @staticmethod
    async def delete(category_id: int) -> bool:
        connection = await DatabaseConnection().connect()
        async with connection.cursor() as cursor:
            await cursor.execute(
                "DELETE FROM category WHERE id = ?",
                (category_id,)
            )
            await connection.commit()
            return cursor.rowcount > 0

    @staticmethod
    async def get_by_id(category_id: int) -> Optional[Dict[str, int | str]]:
        connection = await DatabaseConnection().connect()
        async with connection.cursor() as cursor:
            await cursor.execute(
                "SELECT id, name FROM category WHERE id = ?",
                (category_id,)
            )
            result = await cursor.fetchone()
            if result:
                return {
                    "id": result[0],
                    "name": result[1]
                    }
            return None
        

class Warehouse(Model):
    def __init__(self, barcode: int, name: str, category: str, subcategory: str, retail_price: float, purchasing_price: float, quantity: int, display: int):
        self.barcode = barcode
        self.name = name
        self.category = category
        self.subcategory = subcategory
        self.retail_price = retail_price
        self.purchasing_price = purchasing_price
        self.quantity = quantity
        self.display = display

    @staticmethod
    async def add(warehouse_data: WarehouseModel) -> None:
        connection = await DatabaseConnection().connect()
        async with connection.cursor() as cursor:
            await cursor.execute(
                "INSERT INTO warehouse (barcode, name, category, subcategory, retail_price, purchasing_price, quantity, display) "
                "VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                (warehouse_data.barcode, warehouse_data.name, warehouse_data.category, warehouse_data.subcategory, 
                 warehouse_data.retail_price, warehouse_data.purchasing_price, warehouse_data.quantity, warehouse_data.display)
            )
            await connection.commit()

    @staticmethod
    async def all() -> List[Dict]:
        connection = await DatabaseConnection().connect()
        async with connection.cursor() as cursor:
            await cursor.execute(
                "SELECT id, barcode, name, category, subcategory, retail_price, purchasing_price, quantity, display FROM warehouse"
            )
            results = await cursor.fetchall()
            return [
                {
                    "id": row[0],
                    "barcode": row[1],
                    "name": row[2],
                    "category": row[3],
                    "subcategory": row[4],
                    "retail_price": row[5],
                    "purchasing_price": row[6],
                    "quantity": row[7],
                    "display": row[8]
                }
                for row in results
            ]

    @staticmethod
    async def update(warehouse_data: WarehouseUpdateModel) -> None:
        connection = await DatabaseConnection().connect()
        async with connection.cursor() as cursor:
            await cursor.execute(
                '''UPDATE warehouse
                   SET barcode = ?, name = ?, category = ?, subcategory = ?, retail_price = ?, purchasing_price = ?, quantity = ?, display = ?
                   WHERE id = ?''',
                (warehouse_data.barcode, warehouse_data.name, warehouse_data.category, warehouse_data.subcategory, 
                 warehouse_data.retail_price, warehouse_data.purchasing_price, warehouse_data.quantity, warehouse_data.display, warehouse_data.id)
            )
            await connection.commit()

    @staticmethod
    async def delete(warehouse_id: int) -> bool:
        connection = await DatabaseConnection().connect()
        async with connection.cursor() as cursor:
            await cursor.execute(
                "DELETE FROM warehouse WHERE id = ?",
                (warehouse_id,)
            )
            await connection.commit()
            return cursor.rowcount > 0

    @staticmethod
    async def get_by_id(warehouse_id: int) -> Optional[Dict]:
        connection = await DatabaseConnection().connect()
        async with connection.cursor() as cursor:
            await cursor.execute(
                "SELECT id, barcode, name, category, subcategory, retail_price, purchasing_price, quantity, display "
                "FROM warehouse WHERE id = ?",
                (warehouse_id,)
            )
            result = await cursor.fetchone()
            if result:
                return {
                    "id": result[0],
                    "barcode": result[1],
                    "name": result[2],
                    "category": result[3],
                    "subcategory": result[4],
                    "retail_price": result[5],
                    "purchasing_price": result[6],
                    "quantity": result[7],
                    "display": result[8]
                }
            return None

    @staticmethod
    async def get_by_name(warehouse_name: str) -> Optional[Dict]:
        connection = await DatabaseConnection().connect()
        async with connection.cursor() as cursor:
            await cursor.execute(
                "SELECT id, barcode, name, category, subcategory, retail_price, purchasing_price, quantity, display "
                "FROM warehouse WHERE name = ?",
                (warehouse_name,)
            )
            result = await cursor.fetchone()
            if result:
                return {
                    "id": result[0],
                    "barcode": result[1],
                    "name": result[2],
                    "category": result[3],
                    "subcategory": result[4],
                    "retail_price": result[5],
                    "purchasing_price": result[6],
                    "quantity": result[7],
                    "display": result[8]
                }
            return None

    @staticmethod
    async def get_by_category(category: str) -> List[Dict]:
        connection = await DatabaseConnection().connect()
        async with connection.cursor() as cursor:
            await cursor.execute(
                "SELECT id, barcode, name, category, subcategory, retail_price, purchasing_price, quantity, display "
                "FROM warehouse WHERE category = ?",
                (category,)
            )
            results = await cursor.fetchall()
            return [
                {
                    "id": row[0],
                    "barcode": row[1],
                    "name": row[2],
                    "category": row[3],
                    "subcategory": row[4],
                    "retail_price": row[5],
                    "purchasing_price": row[6],
                    "quantity": row[7],
                    "display": row[8]
                }
                for row in results
            ]

    @staticmethod
    async def get_by_barcode(barcode: int) -> List[Dict]:
        connection = await DatabaseConnection().connect()
        async with connection.cursor() as cursor:
            await cursor.execute(
                "SELECT id, barcode, name, category, subcategory, retail_price, purchasing_price, quantity, display "
                "FROM warehouse WHERE barcode = ?",
                (barcode,)
            )
            results = await cursor.fetchall()
            return [
                {
                    "id": row[0],
                    "barcode": row[1],
                    "name": row[2],
                    "category": row[3],
                    "subcategory": row[4],
                    "retail_price": row[5],
                    "purchasing_price": row[6],
                    "quantity": row[7],
                    "display": row[8]
                }
                for row in results
            ]

        