
import os
from dotenv import load_dotenv

from model.models import DatabaseConnection

load_dotenv(dotenv_path='app/backend/config.env')
db_path = os.getenv('DB_PATH')


class Product:
    def __init__(self, name: str = None, category_id: int = None, cost: int = None, id: int = None) -> None:
        self.name: str | None = name
        self.category_id: int | None = category_id
        self.cost: int | None = cost
        self.id: int | None = id

    async def get_product_by_id(self) -> dict | None:
        connection = await DatabaseConnection().get_connection()
        async with connection.cursor() as cursor:
            await cursor.execute(
                "SELECT id, name, category_id, cost FROM product WHERE id = ?",
                (self.id,)
            )
            result = await cursor.fetchone()
            if result:
                return {
                    "id": result[0],
                    "name": result[1],
                    "category_id": result[2],
                    "cost": result[3]
                }
            else:
                return None

    async def get_products_by_category(self) -> list[dict]:
        connection = await DatabaseConnection().get_connection()
        async with connection.cursor() as cursor:
            await cursor.execute(
                "SELECT id, name, cost FROM product WHERE category_id = ?",
                (self.category_id,)
            )
            results = await cursor.fetchall()
            return [{"id": row[0], "name": row[1], "cost": row[2]} for row in results]

    async def get_all_products(self) -> list[dict]:
        connection = await DatabaseConnection().get_connection()
        async with connection.cursor() as cursor:
            query = """
                SELECT p.id, p.name, c.name AS category_name, p.cost
                FROM product p
                JOIN category c ON p.category_id = c.id
            """
            await cursor.execute(query)
            results = await cursor.fetchall()
            return [
                {
                    "id": row[0],
                    "name": row[1],
                    "category": row[2],
                    "cost": row[3]
                }
                for row in results
            ]

    async def add_product(self) -> None:
        connection = await DatabaseConnection().get_connection()
        async with connection.cursor() as cursor:
            await cursor.execute(
                "INSERT INTO product (name, category_id, cost) VALUES (?, ?, ?)",
                (self.name, self.category_id, self.cost)
            )
            await connection.commit()

    async def change_product(self) -> None:
        connection = await DatabaseConnection().get_connection()
        async with connection.cursor() as cursor:
            await cursor.execute(
                '''UPDATE product
                   SET name = ?, category_id = ?, cost = ?
                   WHERE id = ?''',
                (self.name, self.category_id, self.cost, self.id)
            )
            await connection.commit()

    async def delete_product(self) -> bool:
        connection = await DatabaseConnection().get_connection()
        async with connection.cursor() as cursor:
            await cursor.execute(
                "DELETE FROM product WHERE id = ?",
                (self.id,)
            )
            await connection.commit()
            if cursor.rowcount == 0:
                return False
            return True
