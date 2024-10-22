
document.addEventListener("DOMContentLoaded", () => {
    initNavbar();
});

function initNavbar() {
    const mainNavButton = document.querySelector(".admin-nav-main");
    const productsNavButton = document.querySelector(".admin-nav-products");
    const categoriesNavButton = document.querySelector(".admin-nav-categories");

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
}

function toggleContainer(type) {
    const productContainer = document.querySelector(".admin-products");
    const categoryContainer = document.querySelector(".admin-categories");

    if (type === "product") {
        productContainer.style.display = "grid";
        categoryContainer.style.display = "none";
    } else if (type === "category") {
        categoryContainer.style.display = "grid";
        productContainer.style.display = "none";
    } else {
        productContainer.style.display = "none";
        categoryContainer.style.display = "none";
    }
}
