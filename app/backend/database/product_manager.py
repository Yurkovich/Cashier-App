
import aiosqlite
from config.config import db_path


class ProductManager:
    def __init__(self, name: str = None, category_id: int = None, cost: int = None, id: int = None) -> None:
        self.name = name
        self.category_id = category_id
        self.cost = cost
        self.id = id


    @staticmethod
    def get_db_path() -> str:
        return db_path


    async def add_product(self) -> None: 
        async with aiosqlite.connect(self.get_db_path()) as conn:
            async with conn.cursor() as cursor:
                await cursor.execute(
                    "INSERT INTO product (name, category_id, cost) VALUES (?, ?, ?)",
                    (self.name, self.category_id, self.cost)
                )
                await conn.commit()

    
    async def get_products_by_category(self) -> list[dict]:
        async with aiosqlite.connect(self.get_db_path()) as conn:
            async with conn.cursor() as cursor:
                await cursor.execute(
                    "SELECT id, name, cost FROM product WHERE category_id = ?",
                    (self.category_id,)
                )
                results = await cursor.fetchall()
                return [{"id": row[0], "name": row[1], "cost": row[2]} for row in results]


    async def get_product_by_id(self) -> dict | None:
        async with aiosqlite.connect(self.get_db_path()) as conn:
            async with conn.cursor() as cursor:
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
                

    async def get_all_products(self) -> list[dict]:
        async with aiosqlite.connect(self.get_db_path()) as conn:
            async with conn.cursor() as cursor:
                await cursor.execute("SELECT id, name, category_id, cost FROM product")
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

    async def delete_product(self) -> bool:
        async with aiosqlite.connect(self.get_db_path()) as conn:
            async with conn.cursor() as cursor:
                await cursor.execute(
                    "DELETE FROM product WHERE id = ?",
                    (self.id,)
                )
                await conn.commit()
                if cursor.rowcount == 0:
                    return False
                return True


