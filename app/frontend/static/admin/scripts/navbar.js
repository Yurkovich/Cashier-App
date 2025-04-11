import { categoryManager } from './admin-category.js';
import { productManager } from './admin-products.js';
import { warehouseManager } from './admin-warehouse.js';
import { discountManager } from './admin-discount.js';

document.addEventListener("DOMContentLoaded", () => {
    initNavbar();
    restoreLastTab();
});

function initNavbar() {
    const mainNavButton = document.querySelector(".nav__button--main");
    const productsNavButton = document.querySelector(".nav__button--product");
    const categoriesNavButton = document.querySelector(".nav__button--category");
    const discountNavButton = document.querySelector(".nav__button--discount");
    const warehouseNavButton = document.querySelector(".nav__button--warehouse");

    if (mainNavButton) {
        mainNavButton.addEventListener("click", () => {
            toggleContainer("main");
        });
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
    
    if (discountNavButton) {
        discountNavButton.addEventListener("click", () => {
            toggleContainer("discount");
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
    const discountContainer = document.querySelector(".table__discount");

    const productControl = document.querySelector(".products");
    const categoryControl = document.querySelector(".categories");
    const warehouseControl = document.querySelector(".warehouse");
    const discountControl = document.querySelector(".discount");

    [productContainer, categoryContainer, warehouseContainer, discountContainer].forEach(container => {
        if (container) container.style.display = "none";
    });

    [productControl, categoryControl, warehouseControl, discountControl].forEach(control => {
        if (control) control.style.display = "none";
    });

    switch (type) {
        case "product":
            if (productContainer && productControl) {
                productManager.generateProductTable(productContainer);
                productContainer.style.display = "block";
                productControl.style.display = "grid";
            }
            break;
        case "category":
            if (categoryContainer && categoryControl) {
                categoryManager.refreshCategoryTable();
                categoryContainer.style.display = "block";
                categoryControl.style.display = "grid";
            }
            break;
        case "discount":
            if (discountContainer && discountControl) {
                discountManager.generateDiscountTable(discountContainer);
                discountContainer.style.display = "block";
                discountControl.style.display = "grid";
            }
            break;
        case "warehouse":
            if (warehouseContainer && warehouseControl) {
                warehouseManager.refreshWarehouseTable();
                warehouseContainer.style.display = "block";
                warehouseControl.style.display = "grid";
            }
            break;
    }

    localStorage.setItem("activeTab", type);
}

function restoreLastTab() {
    const lastTab = localStorage.getItem("activeTab") || "main";
    toggleContainer(lastTab);
}

class Navbar {
    constructor() {
        this.containers = {
            products: document.querySelector('.container__products'),
            categories: document.querySelector('.container__categories'),
            warehouse: document.querySelector('.container__warehouse'),
            discounts: document.querySelector('.container__discounts')
        };

        this.controls = {
            products: document.querySelector('.control__products'),
            categories: document.querySelector('.control__categories'),
            warehouse: document.querySelector('.control__warehouse'),
            discounts: document.querySelector('.control__discounts')
        };

        this.init();
    }

    init() {
        Object.keys(this.controls).forEach(key => {
            const control = this.controls[key];
            if (control) {
                control.addEventListener('click', () => this.showContainer(key));
            }
        });
    }

    showContainer(key) {
        Object.values(this.containers).forEach(container => {
            if (container) {
                container.style.display = 'none';
            }
        });

        Object.values(this.controls).forEach(control => {
            if (control) {
                control.classList.remove('active');
            }
        });

        if (this.containers[key]) {
            this.containers[key].style.display = 'block';
        }

        if (this.controls[key]) {
            this.controls[key].classList.add('active');
        }
    }
}

const navbar = new Navbar();
export { navbar };
