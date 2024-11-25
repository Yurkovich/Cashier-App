
import os
import sqlite3
from dotenv import load_dotenv

load_dotenv(dotenv_path='app/backend/config.env')
db_path = os.getenv('DB_PATH')

class Database:
    def __init__(self) -> None:
        pass
    
    def get_connection(self):
        return sqlite3.connect(db_path)

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
                                    subcategory_id INTEGER NOT NULL,
                                    cost INTEGER NOT NULL,
                                    FOREIGN KEY (category_id) REFERENCES category (id) ON DELETE CASCADE ON UPDATE CASCADE,
                                    FOREIGN KEY (subcategory_id) REFERENCES subcategory (id) ON DELETE CASCADE ON UPDATE CASCADE)
                            ''')

            cursor.execute('''CREATE TABLE IF NOT EXISTS warehouse (
                                    id INTEGER PRIMARY KEY,
                                    barcode INTEGER NOT NULL,
                                    name TEXT NOT NULL,
                                    category_id INTEGER NOT NULL,
                                    subcategory_id INTEGER NOT NULL,
                                    retail_price DECIMAL(10, 2) NOT NULL,
                                    purchasing_price DECIMAL(10, 2) NOT NULL,
                                    quantity INTEGER NOT NULL,
                                    display INTEGER NOT NULL DEFAULT 0,
                                    FOREIGN KEY (category_id) REFERENCES category (id) ON DELETE CASCADE ON UPDATE CASCADE,
                                    FOREIGN KEY (subcategory_id) REFERENCES subcategory (id) ON DELETE CASCADE ON UPDATE CASCADE)
                            ''')
        finally:
            conn.close()
