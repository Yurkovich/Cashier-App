
import { refreshCategoryTable } from './admin-category.js';

document.addEventListener("DOMContentLoaded", () => {
    initNavbar();
});

function initNavbar() {
    const productsNavButton = document.querySelector(".nav__button--product");
    const categoriesNavButton = document.querySelector(".nav__button--category");
    const warehouseNavButton = document.querySelector(".nav__button--warehouse");

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
        generateProductTable(productContainer);
        productContainer.style.display = "block";
        productControl.style.display = "grid";
    } else if (type === "category") {
        refreshCategoryTable();
        categoryContainer.style.display = "block";
        categoryControl.style.display = "grid";
    } else if (type === "warehouse") {
        refreshWarehouseTable();
        warehouseContainer.style.display = "block";
        warehouseControl.style.display = "grid";
    }
}

async function generateProductTable(container) {
    container.innerHTML = `
        <table>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Название</th>
                    <th>Категория</th>
                    <th>Цена</th>
                </tr>
            </thead>
            <tbody id="product-table-body">
                <!-- Здесь будут строки таблицы с продуктами -->
            </tbody>
        </table>
    `;

    fetch('/api/all_products')
        .then(response => response.json())
        .then(data => {
            const tbody = document.getElementById('product-table-body');

            fetch('/api/categories')
                .then(response => response.json())
                .then(categories => {
                    const categoryMap = new Map();

                    function addCategoriesToMap(categories) {
                        categories.forEach(category => {
                            categoryMap.set(category.id, category.name);
                            if (category.subcategories && category.subcategories.length > 0) {
                                addCategoriesToMap(category.subcategories);
                            }
                        });
                    }

                    addCategoriesToMap(categories);

                    data.forEach(product => {
                        const categoryName = categoryMap.get(product.category_id) || 'Неизвестно';

                        const row = document.createElement('tr');
                        row.innerHTML = `
                            <td>${product.id}</td>
                            <td>${product.name}</td>
                            <td>${categoryName}</td>
                            <td>${product.cost}</td>
                        `;
                        tbody.appendChild(row);
                    });
                })
                .catch(error => {
                    console.error('Error loading categories:', error);
                });
        })
        .catch(error => {
            console.error('Error loading products:', error);
        });
}

export {generateProductTable}
