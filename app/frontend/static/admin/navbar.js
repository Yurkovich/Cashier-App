
document.addEventListener("DOMContentLoaded", () => {
    initNavbar();
});

function initNavbar() {
    const mainNavButton = document.querySelector(".admin-nav-main");
    const productsNavButton = document.querySelector(".admin-nav-products");
    const categoriesNavButton = document.querySelector(".admin-nav-categories");
    const warehouseNavButton = document.querySelector('.admin-nav-warehouse');

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

    if (warehouseNavButton) {
        warehouseNavButton.addEventListener("click", () => {
            toggleContainer("warehouse");
        });
    }
}

function toggleContainer(type) {
    const productContainer = document.querySelector(".admin-products");
    const categoryContainer = document.querySelector(".admin-categories");
    const warehouseContainer = document.querySelector(".admin-warehouse");

    if (type === "product") {
        productContainer.style.display = "grid";
        categoryContainer.style.display = "none";
        warehouseContainer.style.display = "none";
    } else if (type === "category") {
        categoryContainer.style.display = "grid";
        productContainer.style.display = "none";
        warehouseContainer.style.display = "none";
    } else if (type == "warehouse") {
        warehouseContainer.style.display = "grid";
        categoryContainer.style.display = "none";
        productContainer.style.display = "none";
    }
    else {
        warehouseContainer.style.display = "none";
        productContainer.style.display = "none";
        categoryContainer.style.display = "none";
    }
}
