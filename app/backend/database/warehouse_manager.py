
import os
from typing import Dict, List
import aiosqlite
from dotenv import load_dotenv

load_dotenv(dotenv_path='app/backend/config.env')
db_path = os.getenv('DB_PATH')


class WarehouseManager:
    def __init__(self, id: int = None, category: str = None, name: str = None, cost: int = None, quantity: int = None, amount: int = None) -> None:
        self.id: int | None = id
        self.category: str | None = category
        self.name: str | None = name
        self.cost: int | None = cost
        self.quantity: int | None = quantity
        self.amount: int | None = amount

    async def add_item(self) -> None:
        async with aiosqlite.connect(db_path) as conn:
            async with conn.cursor() as cursor:
                await cursor.execute(
                    "INSERT INTO warehouse (category, name, cost, quantity, amount) VALUES (?, ?, ?, ?, ?)",
                    (self.category, self.name, self.cost, self.quantity, self.amount)
                )
                await conn.commit()

    async def get_item_by_id(self) -> dict | None:
        async with aiosqlite.connect(db_path) as conn:
            async with conn.cursor() as cursor:
                await cursor.execute(
                    """
                    SELECT id, category, name, cost, quantity, amount 
                    FROM warehouse
                    WHERE id = ?
                    """,
                    (self.id,)
                )
                result = await cursor.fetchone()
                if result:
                    return {
                        "id": result[0],
                        "category": result[1],
                        "name": result[2],
                        "cost": result[3],
                        "quantity": result[4],
                        "amount": result[5]
                    }
                else:
                    return None

    async def get_all_items(self) -> List[Dict]:
        async with aiosqlite.connect(db_path) as conn:
            async with conn.cursor() as cursor:
                await cursor.execute(
                    """
                    SELECT id, category, name, cost, quantity, amount 
                    FROM warehouse
                    """
                )
                results = await cursor.fetchall()

                if not results:
                    return []

                return [
                    {
                        "id": row[0],
                        "category": row[1],
                        "name": row[2],
                        "cost": row[3],
                        "quantity": row[4],
                        "amount": row[5]
                    } for row in results
                ]

    async def delete_item(self) -> bool:
        async with aiosqlite.connect(db_path) as conn:
            async with conn.cursor() as cursor:
                await cursor.execute(
                    "DELETE FROM warehouse WHERE id = ?",
                    (self.id,)
                )
                await conn.commit()
                if cursor.rowcount == 0:
                    return False
                return True
