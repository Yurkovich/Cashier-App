
import { categoryManager } from './admin-category.js';
import { productManager } from './admin-products.js';
import { warehouseManager } from './admin-warehouse.js'


document.addEventListener("DOMContentLoaded", () => {
    initNavbar();
});

function initNavbar() {
    const mainNavButton = document.querySelector(".nav__button--main")
    const productsNavButton = document.querySelector(".nav__button--product");
    const categoriesNavButton = document.querySelector(".nav__button--category");
    const warehouseNavButton = document.querySelector(".nav__button--warehouse");

    if (mainNavButton) {
        mainNavButton.addEventListener("click", () => {
            toggleContainer("main")
        })
    }

    if (productsNavButton) {
        productsNavButton.addEventListener("click", () => {
            toggleContainer("product");
        });
    }

    if (categoriesNavButton) {
        categoriesNavButton.addEventListener("click", () => {
            toggleContainer("category");
        });
    }

    if (warehouseNavButton) {
        warehouseNavButton.addEventListener("click", () => {
            toggleContainer("warehouse");
        });
    }
}

function toggleContainer(type) {
    const productContainer = document.querySelector(".table__product");
    const categoryContainer = document.querySelector(".table__category");
    const warehouseContainer = document.querySelector(".table__warehouse");

    const productControl = document.querySelector(".products");
    const categoryControl = document.querySelector(".categories");
    const warehouseControl = document.querySelector(".warehouse");

    productContainer.style.display = "none";
    categoryContainer.style.display = "none";
    warehouseContainer.style.display = "none";

    productControl.style.display = "none";
    categoryControl.style.display = "none";
    warehouseControl.style.display = "none";


    if (type === "product") {
        productManager.generateProductTable(productContainer);
        productContainer.style.display = "block";
        productControl.style.display = "grid";
    } else if (type === "category") {
        categoryManager.refreshCategoryTable();
        categoryContainer.style.display = "block";
        categoryControl.style.display = "grid";
    } else if (type === "warehouse") {
        warehouseManager.refreshWarehouseTable();
        warehouseContainer.style.display = "block";
        warehouseControl.style.display = "grid";
    }
}
