
class OrderManager {
    constructor() {
        this.order = {};
        this.currentPage = 0;
        this.maxItemsPerPage = 7;
        this.totalAmount = 0;
        this.currentCategoryPage = 0;
        this.maxCategoriesPerPage = 9;
        this.categories = [];

        this.init();
    }

    init() {
        document.querySelector(".scroll-up").addEventListener("click", () => this.scrollUp());
        document.querySelector(".scroll-down").addEventListener("click", () => this.scrollDown());
        window.onload = () => this.fetchCategories();
    }

    async fetchCategories() {
        try {
            const response = await fetch("/api/categories");
            const data = await response.json();
            this.categories = data;
            this.updateCategoryMenu(this.categories);
        } catch (error) {
            console.error("Ошибка при получении категорий:", error);
        }
    }

    updateCategoryMenu(categories) {
        const menuBody = document.querySelector(".menu-body");
        menuBody.innerHTML = "";

        const start = this.currentCategoryPage * this.maxCategoriesPerPage;
        const end = Math.min(start + this.maxCategoriesPerPage, categories.length);

        categories.slice(start, end).forEach((category) => {
            const menuItem = document.createElement("div");
            menuItem.className = "menu-item";

            const button = document.createElement("button");
            button.className = "category-button";
            button.id = `category-${category.id}`;
            button.textContent = category.name;

            button.addEventListener("click", () => {
                this.fetchProductsByCategory(category.id);
            });

            menuItem.appendChild(button);
            menuBody.appendChild(menuItem);
        });

        this.addPaginationButton(menuBody, categories.length);
    }

    addPaginationButton(menuBody, totalCategories) {
        const existingButton = document.querySelector(".next-button");
        const isOnFirstPage = this.currentCategoryPage === 0;

        if (totalCategories > this.maxCategoriesPerPage) {
            if (!existingButton) {
                const nextButton = document.createElement("button");
                nextButton.className = "next-button";
                nextButton.textContent = isOnFirstPage ? ">" : "<";
                nextButton.addEventListener("click", () => {
                    if (isOnFirstPage) {
                        this.scrollDownCategories();
                    } else {
                        this.scrollUpCategories();
                    }
                });

                const menuItem = document.createElement("div");
                menuItem.className = "menu-item";
                menuItem.appendChild(nextButton);
                menuBody.appendChild(menuItem);
            } else {
                existingButton.textContent = isOnFirstPage ? "Дальше" : "Назад";
            }
        } else if (existingButton) {
            existingButton.parentElement.remove();
        }
    }

    scrollUpCategories() {
        if (this.currentCategoryPage > 0) {
            this.currentCategoryPage--;
            this.updateCategoryMenu(this.categories);
        }
    }

    scrollDownCategories() {
        this.currentCategoryPage++;
        this.updateCategoryMenu(this.categories);
    }

    handleProductClick(productName, productCost) {
        if (this.order[productName]) {
            this.order[productName].quantity += 1;
        } else {
            this.order[productName] = { quantity: 1, cost: productCost };
        }

        this.updateTotalAmount();
        this.updateOrder();

        const orderCount = Object.keys(this.order).length;
        if (orderCount > this.maxItemsPerPage) {
            const productIndex = this.getProductIndex(productName);
            const newPage = Math.floor(productIndex / this.maxItemsPerPage);
            if (newPage !== this.currentPage) {
                this.currentPage = newPage;
                this.updateOrder();
            }
        }
    }

    getProductIndex(productName) {
        const orderEntries = Object.entries(this.order);
        return orderEntries.findIndex(([name]) => name === productName);
    }

    updateTotalAmount() {
        this.totalAmount = 0;
        for (const { quantity, cost } of Object.values(this.order)) {
            this.totalAmount += quantity * cost;
        }
        document.getElementById("total-amount").textContent = `${this.totalAmount} ₽`;
    }

    updateOrder() {
        const orderItemsContainer = document.getElementById("order-items");
        orderItemsContainer.innerHTML = "";

        const orderEntries = Object.entries(this.order);
        const start = this.currentPage * this.maxItemsPerPage;
        const end = Math.min(start + this.maxItemsPerPage, orderEntries.length);

        orderEntries.slice(start, end).forEach(([name, { quantity, cost }]) => {
            const itemTotal = quantity * cost;

            const orderItem = document.createElement("div");
            orderItem.className = "order-item";

            const nameElement = document.createElement("div");
            nameElement.className = "order-item-name";
            nameElement.textContent = name;

            const quantityElement = document.createElement("div");
            quantityElement.className = "order-item-quantity";
            quantityElement.textContent = quantity;

            const totalElement = document.createElement("div");
            totalElement.className = "order-item-total";
            totalElement.textContent = `${itemTotal} ₽`;

            orderItem.appendChild(nameElement);
            orderItem.appendChild(quantityElement);
            orderItem.appendChild(totalElement);
            orderItemsContainer.appendChild(orderItem);
        });

        this.updatePaginationButtons(orderEntries.length);
    }

    updatePaginationButtons(totalItems) {
        const upButton = document.querySelector(".scroll-up");
        const downButton = document.querySelector(".scroll-down");

        upButton.disabled = this.currentPage === 0;
        downButton.disabled = (this.currentPage + 1) * this.maxItemsPerPage >= totalItems;
    }

    scrollUp() {
        if (this.currentPage > 0) {
            this.currentPage--;
            this.updateOrder();
        }
    }

    scrollDown() {
        const totalItems = Object.keys(this.order).length;
        if ((this.currentPage + 1) * this.maxItemsPerPage < totalItems) {
            this.currentPage++;
            this.updateOrder();
        }
    }

    async fetchProductsByCategory(categoryId) {
        try {
            const response = await fetch(`/api/products?category_id=${categoryId}`);
            const data = await response.json();

            const positionBody = document.querySelector(".position-body");
            const positionHeader = document.querySelector(".position-header div");
            positionBody.innerHTML = "";

            data.products.forEach((product) => {
                const productItem = document.createElement("div");
                productItem.className = "position-item";

                const button = document.createElement("button");
                button.onclick = () => this.handleProductClick(product.name, product.cost);

                const productName = document.createElement("span");
                productName.className = "product-name";
                productName.textContent = product.name;

                const productPrice = document.createElement("span");
                productPrice.className = "product-price";
                productPrice.textContent = `${product.cost}₽`;

                button.appendChild(productName);
                button.appendChild(productPrice);

                productItem.appendChild(button);
                positionBody.appendChild(productItem);
            });

            const categoryResponse = await fetch(`/api/categories/${categoryId}`);
            const categoryData = await categoryResponse.json();
            positionHeader.textContent = categoryData.name;
        } catch (error) {
            console.error("Ошибка при получении продуктов:", error);
        }
    }
}

const orderManager = new OrderManager();
