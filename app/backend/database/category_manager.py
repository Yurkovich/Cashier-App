
import os
import aiosqlite
from dotenv import load_dotenv

load_dotenv(dotenv_path='app/backend/config.env')
db_path = os.getenv('DB_PATH')


class CategoryManager:
    def __init__(self, name: str = None, id: int = None) -> None:
        self.name: str | None = name
        self.id: int | None = id
    
    async def get_all_categories(self) -> list[dict]:
        async with aiosqlite.connect(db_path) as conn:
            async with conn.cursor() as cursor:
                await cursor.execute("SELECT id, name FROM category")
                results = await cursor.fetchall()
                return [{"id": row[0], "name": row[1]} for row in results]
    
    async def get_category_by_id(self) -> dict | None:
        async with aiosqlite.connect(db_path) as conn:
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

    async def add_category(self) -> None: 
        async with aiosqlite.connect(db_path) as conn:
            async with conn.cursor() as cursor:
                await cursor.execute(
                    "INSERT INTO category (name) VALUES (?)",
                    (self.name,)
                )
                await conn.commit()

    async def change_category(self) -> None:
        async with aiosqlite.connect(db_path) as conn:
            async with conn.cursor() as cursor:
                await cursor.execute(
                    '''UPDATE category
                       SET name = ?
                       WHERE id = ?''',
                    (self.name, self.id)
                )
                await conn.commit()

    async def delete_category(self) -> bool:
        async with aiosqlite.connect(db_path) as conn:
            async with conn.cursor() as cursor:
                await cursor.execute(
                    "DELETE FROM category WHERE id = ?",
                    (self.id,)
                )
                await conn.commit()
                if cursor.rowcount == 0:
                    return False
                return True
