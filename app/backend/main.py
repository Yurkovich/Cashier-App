
import os
import sys
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent.parent.parent
sys.path.append(str(ROOT_DIR))

from app.backend.config import BASE_DIR
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

from app.backend.urls.url import url_router
from app.backend.routes.product_router import product_router
from app.backend.routes.category_router import category_router
from app.backend.routes.warehouse_router import warehouse_router
from app.backend.routes.discount_router import discount_router
from app.backend.routes.order_router import order_router

templates_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "app", "frontend", "templates")
templates = Jinja2Templates(directory=templates_dir)
app = FastAPI()

static_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "app", "frontend", "static")
app.mount("/static", StaticFiles(directory=static_dir), name="static")

app.include_router(url_router)
app.include_router(product_router)
app.include_router(category_router)
app.include_router(warehouse_router)
app.include_router(discount_router)
app.include_router(order_router)

if __name__ == '__main__':
    from app.backend.database.database import init_db
    init_db()
    
    import uvicorn
    uvicorn.run("app.backend.main:app", host="127.0.0.1", port=8000, reload=True)
    # uvicorn.run('main:app', reload=True, host='0.0.0.0', port=8000)
