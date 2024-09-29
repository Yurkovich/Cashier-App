document.addEventListener("DOMContentLoaded", () => {
    initNavbar();
});

function initNavbar() {
    document.querySelector(".main-page").addEventListener("click", () => {
        toggleContainer("main");
    });
    
    document.querySelector(".product-page").addEventListener("click", () => {
        toggleContainer("product");
    });

    document.querySelector(".category-page").addEventListener("click", () => {
        toggleContainer("category");
    });
}

function toggleContainer(type) {
    const productContainer = document.querySelector(".product-container");
    const categoryContainer = document.querySelector(".category-container");

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
