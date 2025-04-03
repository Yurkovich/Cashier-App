
from config import BASE_DIR

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

from urls.url import url_router
from routes.product_router import product_router
from routes.category_router import category_router
from routes.warehouse_router import warehouse_router
from routes.discount_router import discount_code_router, discount_special_router


templates = Jinja2Templates(directory=str(BASE_DIR / "frontend/templates"))
app = FastAPI()

app.mount("/static", StaticFiles(directory=str(BASE_DIR / "frontend/static")), name="static")

app.include_router(url_router)
app.include_router(product_router)
app.include_router(category_router)
app.include_router(warehouse_router)
app.include_router(discount_code_router)
app.include_router(discount_special_router)


if __name__ == '__main__':
    import uvicorn
    from database.database import Database
    db = Database()
    db.create_table()

    uvicorn.run('main:app', reload=True, port=8000)
    # uvicorn.run('main:app', reload=True, host='0.0.0.0', port=8000)
