
import os
import sqlite3
from dotenv import load_dotenv
from config import BASE_DIR

dotenv_path = BASE_DIR / "backend" / "config.env"
if not dotenv_path.exists():
    raise FileNotFoundError(f"Файл .env не найден по пути: {dotenv_path}")
load_dotenv(dotenv_path=dotenv_path)

db_path_env = os.getenv('DB_PATH')
if not db_path_env:
    raise ValueError("Переменная DB_PATH не найдена в файле .env")
db_path = BASE_DIR / db_path_env

class Database:
    def __init__(self) -> None:
        pass
    
    def get_connection(self):
        return sqlite3.connect(str(db_path))

    def create_table(self):
        conn = self.get_connection()
        try:
            cursor = conn.cursor()
            cursor.execute('''CREATE TABLE IF NOT EXISTS category (
                                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                                    name TEXT NOT NULL,
                                    parent_id INTEGER,
                                    FOREIGN KEY (parent_id) REFERENCES category (id) ON DELETE CASCADE ON UPDATE CASCADE)
                            ''')
            
            cursor.execute('''CREATE TABLE IF NOT EXISTS product (
                                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                                    name TEXT NOT NULL,
                                    category_id INTEGER NOT NULL,
                                    cost INTEGER NOT NULL,
                                    FOREIGN KEY (category_id) REFERENCES category (id) ON DELETE CASCADE ON UPDATE CASCADE)
                            ''')

            cursor.execute('''CREATE TABLE IF NOT EXISTS warehouse (
                                    id INTEGER PRIMARY KEY,
                                    barcode INTEGER NOT NULL,
                                    name TEXT NOT NULL,
                                    category_id INTEGER NOT NULL,
                                    retail_price DECIMAL(10, 2) NOT NULL,
                                    purchasing_price DECIMAL(10, 2) NOT NULL,
                                    quantity INTEGER NOT NULL,
                                    FOREIGN KEY (category_id) REFERENCES category (id) ON DELETE CASCADE ON UPDATE CASCADE)
                            ''')
            
            cursor.execute('''CREATE TABLE IF NOT EXISTS discount_code (
                                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                                    code TEXT NOT NULL,
                                    percent INTEGER NOT NULL,
                                    quantity INTEGER NOT NULL);
                            ''')
            
            cursor.execute('''CREATE TABLE IF NOT EXISTS discount_special (
                                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                                    name TEXT NOT NULL,
                                    percent INTEGER NOT NULL);
                            ''')
        finally:
            conn.close()

    def reset_table(self, table_name):
        conn = self.get_connection()
        try:
            cursor = conn.cursor()

            cursor.execute(f"DELETE FROM {table_name};")

            cursor.execute(f"DELETE FROM sqlite_sequence WHERE name = '{table_name}';")

            conn.commit()
        finally:
            conn.close()

    def reset_all_tables(self):
        self.reset_table("category")
        self.reset_table("product")
        self.reset_table("warehouse")
