
import aiosqlite
from config.config import db_path


class CategoryManager:
    def __init__(self, name: str = None, id: int = None) -> None:
        self.name = name
        self.id = id


    @staticmethod
    def get_db_path() -> str:
        return db_path
    

    async def add_category(self) -> None: 
        async with aiosqlite.connect(self.get_db_path()) as conn:
            async with conn.cursor() as cursor:
                await cursor.execute(
                    "INSERT INTO category (name) VALUES (?)",
                    (self.name,)
                )
                await conn.commit()


    async def get_category_by_id(self) -> dict | None:
        async with aiosqlite.connect(self.get_db_path()) as conn:
            async with conn.cursor() as cursor:
                await cursor.execute(
                    "SELECT id, name FROM category WHERE id = ?",
                    (self.id,)
                )
                result = await cursor.fetchone()
                if result:
                    return {"id": result[0], "name": result[1]}
                else:
                    return None


    async def get_all_categories(self) -> list[dict]:
        async with aiosqlite.connect(self.get_db_path()) as conn:
            async with conn.cursor() as cursor:
                await cursor.execute("SELECT id, name FROM category")
                results = await cursor.fetchall()
                return [{"id": row[0], "name": row[1]} for row in results]
            

    async def delete_category(self) -> bool:
        async with aiosqlite.connect(self.get_db_path()) as conn:
            async with conn.cursor() as cursor:
                await cursor.execute(
                    "DELETE FROM category WHERE id = ?",
                    (self.id,)
                )
                await conn.commit()
                if cursor.rowcount == 0:
                    return False
                return True