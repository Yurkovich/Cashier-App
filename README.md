# CashierApp: Управление Товарами и Заказами
CashierApp — это веб-приложение, предназначенное для управления товарами, категориями, складом и заказами. Оно включает в себя интерфейс кассира для оформления заказов и админ-панель для управления данными.

---

## Содержание
1. [Описание проекта](#описание-проекта)
2. [Функционал приложения](#функционал-приложения)
3. [Структура проекта](#структура-проекта)
4. [Технологии](#технологии)
5. [Установка и запуск](#установка-и-запуск)
6. [API](#api)
7. [Автор](#автор)

---

## Описание проекта

CashierApp предоставляет инструменты для:
- **Кассира**: Создание, редактирование и сохранение заказов.
- **Администратора**: Добавление, обновление и удаление товаров, категорий, данных о складе и поставках через удобный интерфейс.

Проект разделён на две основные части:
1. **Интерфейс кассира**: Позволяет добавлять товары в заказ, управлять текущими заказами и производить оплату.
2. **Админ-панель**: Предоставляет инструменты для управления товарами, категориями, складом и поставками через удобный интерфейс.

---

## Функционал приложения

### Интерфейс кассира
- **Добавление товаров в заказ**:
  - Выбор товаров из меню.
  - Автоматический подсчёт общей стоимости заказа.
- **Редактирование заказа**:
  - Удаление товаров через свайп.
  - Сохранение текущего заказа для дальнейшего использования.
- **Просмотр истории заказов**:
  - Навигация между предыдущими заказами.
  - Возможность загрузить ранее сохранённый заказ.
- **Оплата заказа**:
  - Отображение QR-кода для оплаты.
  - Калькулятор для расчета наличными.

### Админ-панель
- **Управление товарами**:
  - Добавление, обновление и удаление товаров.
  - Привязка товаров к категориям.
- **Управление категориями**:
  - Создание вложенных категорий.
  - Редактирование и удаление категорий.
- **Управление складом**:
  - Добавление товаров на склад с указанием баркода, цен и количества.
  - Обновление данных о товарах на складе.
- **Управление поставками**:
  - Добавление товаров через модальное окно.
  - Автоматическая проверка существования товара по баркоду.

---

## Структура проекта
```
CashierApp/
├── app/
│   ├── backend/
│   │   ├── database/
│   │   │   ├── database.py
│   │   ├── models/
│   │   │   ├── models.py
│   │   │   ├── category_model.py
│   │   │   ├── product_model.py
│   │   │   └── warehouse_model.py
│   │   ├── routes/
│   │   │   ├── category_router.py
│   │   │   ├── product_router.py
│   │   │   └── warehouse_router.py
│   │   ├── urls/
│   │   │   └── url.py
│   │   ├── config.env
│   │   ├── config.py
│   │   ├── database.db
│   │   └── main.py
│   └── frontend/
│       ├── static/
│       │   ├── admin/
│       │   │   ├── css/
│       │   │   │   ├── admin.css
│       │   │   │   └── reset.css
│       │   │   ├── scripts/
│       │   │   │   ├── admin-category.js
│       │   │   │   ├── admin-delivery.js
│       │   │   │   ├── admin-products.js
│       │   │   │   ├── admin-warehouse.js
│       │   │   │   └── navbar.js
│       │   │   └── img/
│       │   │   │   ├── icons/
│       │   │   │   └── qr.jpg
│       │   └── index/
│       │       ├── css/
│       │       │   ├── adaptive.css
│       │       │   ├── calculator.css
│       │       │   ├── reset.css
│       │       │   └── style.css
│       │       ├── scripts/
│       │       │   ├── calculator.js
│       │       │   ├── timer.js
│       │       │   ├── category.js
│       │       │   ├── order.js
│       │       │   ├── pay.js
│       │       │   └── product.js
│       │       └── favicon.ico
│       └── templates/
│           ├── admin.html
│           └── cashier.html
├── requirements.txt
└── README.md
```

---

## Технологии

- **Frontend**:
  - HTML, CSS (включая адаптивную верстку).
  - JavaScript (ES6+).
  - SVG для иконок.
- **Backend**:
  - Python 3.x.
  - API для взаимодействия с клиентской частью.
- **База данных**:
  - SQLite.
- **Дополнительно**:
  - `.env` для хранения переменных окружения.

---
 
## Установка и запуск
### Требования
+ Python 3.x

### Шаги установки
1. Клонируйте репозиторий:
   
 ```bash
 git clone https://github.com/Yurkovich/Cashier-App.git
 cd CashierApp
 ```

2. Установите зависимости Python:
   
```bash
pip install -r requirements.txt
```

3. Настройте переменные окружения:
    + Создайте файл config.env в папке app/backend/.
    + Укажите путь к базе данных:
  
```
DB_PATH=backend/database.db
```

4. Запустите сервер:

```
python app/backend/main.py
```

5. Откройте приложение в браузере:
    + Интерфейс кассира: http://localhost:8000/
    + Админ-панель: http://localhost:8000/admin

## API
### Эндпоинты для админ-панели

### **1. Product (Товары)**

| Метод   | URL                          | Описание                                      |
|---------|------------------------------|-----------------------------------------------|
| **GET** | `/api/all_products`          | Получить все товары                           |
| **GET** | `/api/products/{product_id}` | Получить товар по ID                          |
| **GET** | `/api/products/name/{product_name}` | Получить товар по названию                  |
| **POST** | `/api/products`             | Добавить новый товар                          |
| **PUT** | `/api/products`              | Изменить товар по ID                          |
| **DELETE** | `/api/products/{product_id}` | Удалить товар по ID                         |

---

### **2. Category (Категории)**

| Метод   | URL                          | Описание                                      |
|---------|------------------------------|-----------------------------------------------|
| **GET** | `/api/categories`            | Получить все категории в иерархическом формате |
| **GET** | `/api/categories/{category_id}` | Получить категорию по ID                     |
| **GET** | `/api/categories/parent/{parent_id}` | Получить категории по ID родительской категории |
| **POST** | `/api/categories`           | Добавить новую категорию                      |
| **PUT** | `/api/categories`            | Изменить категорию по ID                      |
| **DELETE** | `/api/categories/{category_id}` | Удалить категорию по ID                    |

---

### **3. Warehouse (Склад)**

| Метод   | URL                          | Описание                                      |
|---------|------------------------------|-----------------------------------------------|
| **GET** | `/api/all_warehouse`         | Получить все товары на складе                 |
| **GET** | `/api/warehouse/barcode/{barcode}` | Получить товар по баркоду                   |
| **GET** | `/api/warehouse/item_id/{item_id}` | Получить товар по ID                       |
| **GET** | `/api/warehouse/{item_name}` | Получить товар по имени                      |
| **POST** | `/api/warehouse`            | Добавить товар на склад                      |
| **PUT** | `/api/warehouse`            | Обновить товар на складе                     |
| **DELETE** | `/api/warehouse/{item_id}` | Удалить товар со склада                     |


## Автор
+ Имя: Антон
+ Email: yurkov200000@gmail.com
+ GitHub: https://github.com/Yurkovich
