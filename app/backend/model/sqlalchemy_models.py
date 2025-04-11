
from sqlalchemy import Column, Integer, String, ForeignKey, Numeric, create_engine, DateTime, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from typing import List, Optional
from datetime import datetime

Base = declarative_base()

class Category(Base):
    __tablename__ = 'category'
    
    id = Column(Integer, primary_key=True)
    name = Column(String(255), nullable=False)
    parent_id = Column(Integer, ForeignKey('category.id'))
    
    parent = relationship('Category', remote_side=[id], backref='children')
    products = relationship('Product', back_populates='category')
    warehouse_items = relationship('Warehouse', back_populates='category')

class Product(Base):
    __tablename__ = 'product'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(255), nullable=False)
    category_id = Column(Integer, ForeignKey('category.id', ondelete='CASCADE', onupdate='CASCADE'), nullable=False)
    cost = Column(Integer, nullable=False)
    
    category = relationship('Category', back_populates='products')

class Warehouse(Base):
    __tablename__ = 'warehouse'
    
    id = Column(Integer, primary_key=True)
    barcode = Column(Integer, nullable=False)
    name = Column(String, nullable=False)
    category_id = Column(Integer, ForeignKey('category.id', ondelete='CASCADE', onupdate='CASCADE'), nullable=False)
    retail_price = Column(Numeric(10, 2), nullable=False)
    purchasing_price = Column(Numeric(10, 2), nullable=False)
    quantity = Column(Integer, nullable=False)
    
    category = relationship('Category', back_populates='warehouse_items')

class DiscountCode(Base):
    __tablename__ = 'discount_code'
    
    id = Column(Integer, primary_key=True)
    code = Column(String, nullable=False)
    percent = Column(Integer, nullable=False)
    quantity = Column(Integer, nullable=False)

class DiscountSpecial(Base):
    __tablename__ = 'discount_special'
    
    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    percent = Column(Integer, nullable=False)

class Order(Base):
    __tablename__ = 'order'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    total_cost = Column(Numeric(10, 2), nullable=False)
    discount = Column(Integer, nullable=False, default=0)
    order_date = Column(DateTime, nullable=False, default=datetime.now)
    
    items = relationship('OrderItem', back_populates='order', cascade="all, delete-orphan")

class OrderItem(Base):
    __tablename__ = 'order_item'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    order_id = Column(Integer, ForeignKey('order.id', ondelete='CASCADE'), nullable=False)
    product_id = Column(Integer, ForeignKey('product.id', ondelete='CASCADE'), nullable=False)
    quantity = Column(Integer, nullable=False)
    price = Column(Numeric(10, 2), nullable=False)
    
    order = relationship('Order', back_populates='items')
    product = relationship('Product') 
    