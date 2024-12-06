
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
    
    @staticmethod
    @abstractmethod
    async def get_by_parent_id(entity_id: int):
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
    def __init__(self, name: str = None, id: int = None, parent_id: Optional[int] = None) -> None:
        self.name = name
        self.id = id
        self.parent_id = parent_id

    @staticmethod
    async def add(category_data: CategoryCreate) -> None:
        connection = await DatabaseConnection().connect()
        async with connection.cursor() as cursor:
            await cursor.execute(
                "INSERT INTO category (name, parent_id) VALUES (?, ?)",
                (category_data.name, category_data.parent_id)
            )
            await connection.commit()

    @staticmethod
    async def all() -> List[Dict[str, int | str | None]]:
        connection = await DatabaseConnection().connect()
        async with connection.cursor() as cursor:
            await cursor.execute("SELECT id, name, parent_id FROM category WHERE")
            results = await cursor.fetchall()
            return [
                {
                    "id": row[0],
                    "name": row[1],
                    "parent_id": row[2]
                }
                for row in results
            ]
        
        
    @staticmethod
    async def all_nested() -> List[Dict]:
        connection = await DatabaseConnection().connect()
        async with connection.cursor() as cursor:
            await cursor.execute("SELECT id, name, parent_id FROM category")
            categories = await cursor.fetchall()

        category_dict = {
            category[0]: {"id": category[0], "name": category[1], "subcategories": []}
            for category in categories
        }

        root_categories = [category_dict[category[0]] for category in categories if category[2] == 0]

        def add_subcategories(category_id):
            for category in categories:
                if category[2] == category_id:
                    subcategory = category_dict[category[0]]
                    category_dict[category_id]["subcategories"].append(subcategory)
                    add_subcategories(category[0])

        for root_category in root_categories:
            add_subcategories(root_category["id"])
        return root_categories


    @staticmethod
    async def update(category_data: CategoryChange) -> None:
        connection = await DatabaseConnection().connect()
        async with connection.cursor() as cursor:
            await cursor.execute(
                "UPDATE category SET name = ?, parent_id = ? WHERE id = ?",
                (category_data.name, category_data.parent_id, category_data.id)
            )
            await connection.commit()

    @staticmethod
    async def delete(category_id: int) -> bool:
        connection = await DatabaseConnection().connect()
        async with connection.cursor() as cursor:
            await cursor.execute("DELETE FROM category WHERE id = ?", (category_id,))
            await connection.commit()
            return cursor.rowcount > 0

    @staticmethod
    async def get_by_id(category_id: int) -> Optional[Dict[str, int | str | None]]:
        connection = await DatabaseConnection().connect()
        async with connection.cursor() as cursor:
            await cursor.execute(
                "SELECT id, name, parent_id FROM category WHERE id = ?",
                (category_id,)
            )
            result = await cursor.fetchone()
            if result:
                return {
                    "id": result[0],
                    "name": result[1],
                    "parent_id": result[2]
                }
            return None

    @staticmethod
    async def get_by_parent_id(parent_id: int) -> List[Dict[str, int | str | None]]:
        connection = await DatabaseConnection().connect()
        async with connection.cursor() as cursor:
            await cursor.execute(
                "SELECT id, name, parent_id FROM category WHERE parent_id = ?",
                (parent_id,)
            )
            results = await cursor.fetchall()
            return [
                {
                    "id": row[0],
                    "name": row[1],
                    "parent_id": row[2]
                }
                for row in results
            ]
        

class Warehouse(Model):
    def __init__(self, barcode: int, name: str, category_id: int, retail_price: float, purchasing_price: float, quantity: int):
        self.barcode = barcode
        self.name = name
        self.category_id = category_id
        self.retail_price = retail_price
        self.purchasing_price = purchasing_price
        self.quantity = quantity

    @staticmethod
    async def add(warehouse_data: WarehouseModel) -> None:
        connection = await DatabaseConnection().connect()
        async with connection.cursor() as cursor:
            await cursor.execute(
                "INSERT INTO warehouse (barcode, name, category_id, retail_price, purchasing_price, quantity) "
                "VALUES (?, ?, ?, ?, ?, ?)",
                (
                    warehouse_data.barcode,
                    warehouse_data.name,
                    warehouse_data.category_id,
                    warehouse_data.retail_price,
                    warehouse_data.purchasing_price,
                    warehouse_data.quantity,
                )
            )
            await connection.commit()

    @staticmethod
    async def all() -> List[Dict]:
        connection = await DatabaseConnection().connect()
        async with connection.cursor() as cursor:
            await cursor.execute(
                "SELECT id, barcode, name, category_id, retail_price, purchasing_price, quantity FROM warehouse"
            )
            results = await cursor.fetchall()
            return [
                dict(zip(
                    ["id", "barcode", "name", "category_id", "retail_price", "purchasing_price", "quantity"],
                    row
                )) for row in results
            ]

    @staticmethod
    async def update(warehouse_data: WarehouseUpdateModel) -> None:
        connection = await DatabaseConnection().connect()
        async with connection.cursor() as cursor:
            await cursor.execute(
                '''UPDATE warehouse
                   SET barcode = ?, name = ?, category_id = ?, retail_price = ?, purchasing_price = ?, quantity = ?
                   WHERE id = ?''',
                (
                    warehouse_data.barcode,
                    warehouse_data.name,
                    warehouse_data.category_id,
                    warehouse_data.retail_price,
                    warehouse_data.purchasing_price,
                    warehouse_data.quantity,
                    warehouse_data.id,
                )
            )
            await connection.commit()

    @staticmethod
    async def delete(warehouse_id: int) -> bool:
        connection = await DatabaseConnection().connect()
        async with connection.cursor() as cursor:
            await cursor.execute("DELETE FROM warehouse WHERE id = ?", (warehouse_id,))
            await connection.commit()
            return cursor.rowcount > 0

    @staticmethod
    async def get_by_id(warehouse_id: int) -> Optional[Dict]:
        connection = await DatabaseConnection().connect()
        async with connection.cursor() as cursor:
            await cursor.execute(
                "SELECT id, barcode, name, category_id, retail_price, purchasing_price, quantity "
                "FROM warehouse WHERE id = ?",
                (warehouse_id,)
            )
            result = await cursor.fetchone()
            return dict(zip(
                ["id", "barcode", "name", "category_id", "retail_price", "purchasing_price", "quantity"],
                result
            )) if result else None

    @staticmethod
    async def get_by_category(category_id: int) -> List[Dict]:
        connection = await DatabaseConnection().connect()
        async with connection.cursor() as cursor:
            await cursor.execute(
                "SELECT id, barcode, name, category_id, retail_price, purchasing_price, quantity "
                "FROM warehouse WHERE category_id = ?",
                (category_id,)
            )
            results = await cursor.fetchall()
            return [
                dict(zip(
                    ["id", "barcode", "name", "category_id", "retail_price", "purchasing_price", "quantity"],
                    row
                )) for row in results
            ]

    @staticmethod
    async def get_by_barcode(barcode: int) -> Optional[Dict]:
        connection = await DatabaseConnection().connect()
        async with connection.cursor() as cursor:
            await cursor.execute(
                "SELECT id, barcode, name, category_id, retail_price, purchasing_price, quantity "
                "FROM warehouse WHERE barcode = ?",
                (barcode,)
            )
            result = await cursor.fetchone()
            return dict(zip(
                ["id", "barcode", "name", "category_id", "retail_price", "purchasing_price", "quantity"],
                result
            )) if result else None
