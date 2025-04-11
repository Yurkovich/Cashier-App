
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base
from dotenv import load_dotenv
from app.backend.config import BASE_DIR

dotenv_path = BASE_DIR / ".env"
if not dotenv_path.exists():
    raise FileNotFoundError(f".env file not found at path: {dotenv_path}")
load_dotenv(dotenv_path=dotenv_path)

db_name = os.getenv('DB_NAME')
db_user = os.getenv('DB_USER')
db_password = os.getenv('DB_PASSWORD')
db_host = os.getenv('DB_HOST')
db_port = os.getenv('DB_PORT')

if not all([db_name, db_user, db_password, db_host, db_port]):
    raise ValueError("Not all PostgreSQL connection variables are specified in .env file")

DATABASE_URL = f"postgresql://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}?client_encoding=utf8"

engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    from app.backend.model.sqlalchemy_models import Base
    Base.metadata.create_all(bind=engine)
    
