from abc import ABC, abstractmethod
import os
from typing import Any, Dict, List, Optional
import aiosqlite
from dotenv import load_dotenv

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

    async def get_connection(self):
        if self._connection is None:
            self._connection = await aiosqlite.connect(db_path)
        return self._connection

    async def close_connection(self):
        if self._connection is not None:
            await self._connection.close()
            self._connection = None


class Model(ABC):
    @abstractmethod
    async def all(self) -> List[Any]:
        raise NotImplementedError
    
    @abstractmethod
    async def add(self, data: Any) -> None:
        raise NotImplementedError

    @abstractmethod
    async def update(self, data: Any) -> None:
        raise NotImplementedError

    @abstractmethod
    async def delete(self, entity_id: int) -> bool:
        raise NotImplementedError

    @abstractmethod
    async def get_by_id(self, entity_id: int) -> Optional[Any]:
        raise NotImplementedError
    
    @abstractmethod
    async def get_by_name(self, name: str) -> List[Any]:
        raise NotImplementedError
    
    @abstractmethod
    async def get_by_category(self, category_id: int) -> List[Any]:
        raise NotImplementedError
    

class Product(Model, ABC):
    def __init__(self, name: str = None, category_id: int = None, cost: int = None, id: int = None) -> None:
        self.name = name
        self.category_id = category_id
        self.cost = cost
        self.id = id

    @staticmethod
    async def add(product_data: ProductCreate) -> None:
        connection = await DatabaseConnection().get_connection()
        async with connection.cursor() as cursor:
            await cursor.execute(
                "INSERT INTO product (name, category_id, cost) VALUES (?, ?, ?)",
                (product_data.name, product_data.category_id, product_data.cost)
            )
            await connection.commit()

    @staticmethod
    async def update(product_data: ProductChange) -> None:
        connection = await DatabaseConnection().get_connection()
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
        connection = await DatabaseConnection().get_connection()
        async with connection.cursor() as cursor:
            await cursor.execute(
                "DELETE FROM product WHERE id = ?",
                (product_id,)
            )
            await connection.commit()
            return cursor.rowcount > 0

    @staticmethod
    async def get_by_id(product_id: int) -> Optional[dict]:
        connection = await DatabaseConnection().get_connection()
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
        connection = await DatabaseConnection().get_connection()
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
    async def all() -> List[dict]:
        connection = await DatabaseConnection().get_connection()
        async with connection.cursor() as cursor:
            await cursor.execute(
                "SELECT id, name, category_id, cost FROM product"
            )
            results = await cursor.fetchall()
            return [
                {"id": row[0], "name": row[1], "category_id": row[2], "cost": row[3]}
                for row in results
            ]

    @staticmethod
    async def get_by_category(category_id: int) -> List[dict]:
        connection = await DatabaseConnection().get_connection()
        async with connection.cursor() as cursor:
            await cursor.execute(
                "SELECT id, name, cost FROM product WHERE category_id = ?",
                (category_id,)
            )
            results = await cursor.fetchall()
            return [{"id": row[0], "name": row[1], "cost": row[2]} for row in results]
    

class Category(Model, ABC):
    def __init__(self, name: str = None, id: int = None) -> None:
        self.name = name
        self.id = id

    @staticmethod
    async def add(category_data: CategoryCreate) -> None:
        connection = await DatabaseConnection().get_connection()
        async with connection.cursor() as cursor:
            await cursor.execute(
                "INSERT INTO category (name) VALUES (?)",
                (category_data.name,)
            )
            await connection.commit()

    @staticmethod
    async def update(category_data: CategoryChange) -> None:
        connection = await DatabaseConnection().get_connection()
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
        connection = await DatabaseConnection().get_connection()
        async with connection.cursor() as cursor:
            await cursor.execute(
                "DELETE FROM category WHERE id = ?",
                (category_id,)
            )
            await connection.commit()
            return cursor.rowcount > 0

    @staticmethod
    async def get_by_id(category_id: int) -> Optional[Dict[str, int | str]]:
        connection = await DatabaseConnection().get_connection()
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

    @staticmethod
    async def all() -> List[Dict[str, int | str]]:
        connection = await DatabaseConnection().get_connection()
        async with connection.cursor() as cursor:
            await cursor.execute(
                "SELECT id, name FROM category"
            )
            results = await cursor.fetchall()
            return [
                {"id": row[0], "name": row[1]}
                for row in results
            ]
        