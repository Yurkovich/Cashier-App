
import sqlite3
from config.config import db_path


class DataBase:
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
                                name TEXT NOT NULL)
                           ''')
            
            cursor.execute('''CREATE TABLE IF NOT EXISTS product (
                                id INTEGER PRIMARY KEY AUTOINCREMENT,
                                name TEXT NOT NULL,
                                category_id INTEGER NOT NULL,
                                cost INTEGER NOT NULL,
                                FOREIGN KEY (category_id) REFERENCES category (id))
                           ''')

            cursor.execute('''CREATE TABLE IF NOT EXISTS warehouse (
                           id INTEGER PRIMARY KEY AUTOINCREMENT,
                           category TEXT NOT NULL,
                           name TEXT NOT NULL,
                           cost INTEGER NOT NULL,
                           quantity INTEGER NOT NULL,
                           amount INTEGER NOT NULL)
                           ''')
            
            cursor.execute('''CREATE TABLE IF NOT EXISTS sale (
                                id INTEGER PRIMARY KEY AUTOINCREMENT,
                                product_id INTEGER NOT NULL,
                                basket TEXT NOT NULL,
                                quantity INTEGER NOT NULL,
                                price INTEGER NOT NULL,
                                date TEXT NOT NULL,
                                FOREIGN KEY (product_id) REFERENCES product (id))
                           ''')
            conn.commit()

        finally:
            conn.close()