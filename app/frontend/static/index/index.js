(function () {
    let order = {};
    let currentPage = 0;
    const maxItemsPerPage = 7;
    let totalAmount = 0;
    let currentCategoryPage = 0;
    const maxCategoriesPerPage = 9;

    async function fetchCategories() {
        try {
            const response = await fetch("/api/categories");
            const data = await response.json();
            updateCategoryMenu(data);
        } catch (error) {
            console.error("Ошибка при получении категорий:", error);
        }
    }

    function updateCategoryMenu(categories) {
        const menuBody = document.querySelector(".menu-body");
        menuBody.innerHTML = "";

        const start = currentCategoryPage * maxCategoriesPerPage;
        const end = Math.min(start + maxCategoriesPerPage, categories.length);

        categories.slice(start, end).forEach((category) => {
            const menuItem = document.createElement("div");
            menuItem.className = "menu-item";

            const button = document.createElement("button");
            button.className = "category-button";
            button.id = `category-${category.id}`;
            button.textContent = category.name;

            button.addEventListener("click", () => {
                fetchProductsByCategory(category.id);
            });

            menuItem.appendChild(button);
            menuBody.appendChild(menuItem);
        });

        if (categories.length > maxCategoriesPerPage) {
            const nextOrPrevButton = document.createElement("div");
            nextOrPrevButton.className = "menu-item nextorprevButton";

            const scrollButton = document.createElement("button");
            scrollButton.className = "scroll-button";
            scrollButton.textContent = ">";

            scrollButton.addEventListener("click", () => {
                if ((currentCategoryPage + 1) * maxCategoriesPerPage < categories.length) {
                    scrollDownCategories(categories);
                } else if (currentCategoryPage > 0) {
                    scrollUpCategories(categories);
                }
            });

            nextOrPrevButton.appendChild(scrollButton);
            menuBody.appendChild(nextOrPrevButton);

            updateCategoryPaginationButtons(categories.length);
        }
    }

    function updateCategoryPaginationButtons(totalCategories) {
        const scrollButton = document.querySelector(".scroll-button");

        if (totalCategories > maxCategoriesPerPage) {
            if ((currentCategoryPage + 1) * maxCategoriesPerPage >= totalCategories) {
                scrollButton.textContent = "<";
                scrollButton.onclick = scrollUpCategories;
            } else if (currentCategoryPage === 0) {
                scrollButton.textContent = ">";
                scrollButton.onclick = scrollDownCategories;
            } else {
                scrollButton.textContent = ">";
            }
        } else {
            scrollButton.style.display = "none";
        }
    }

    function scrollUpCategories(categories) {
        if (currentCategoryPage > 0) {
            currentCategoryPage--;
            updateCategoryMenu(categories);
        }
    }

    function scrollDownCategories(categories) {
        if ((currentCategoryPage + 1) * maxCategoriesPerPage < categories.length) {
            currentCategoryPage++;
            updateCategoryMenu(categories);
        }
    }

    function handleProductClick(productName, productCost) {
        if (order[productName]) {
            order[productName].quantity += 1;
        } else {
            order[productName] = { quantity: 1, cost: productCost };
        }

        updateTotalAmount();
        updateOrder();

        const orderCount = Object.keys(order).length;
        if (orderCount > maxItemsPerPage) {
            const productIndex = getProductIndex(productName);
            const newPage = Math.floor(productIndex / maxItemsPerPage);
            if (newPage !== currentPage) {
                currentPage = newPage;
                updateOrder();
            }
        }
    }

    function getProductIndex(productName) {
        const orderEntries = Object.entries(order);
        return orderEntries.findIndex(([name]) => name === productName);
    }

    function updateTotalAmount() {
        totalAmount = 0;
        for (const { quantity, cost } of Object.values(order)) {
            totalAmount += quantity * cost;
        }
        document.getElementById("total-amount").textContent = `${totalAmount} P`;
    }

    function updateOrder() {
        const orderItemsContainer = document.getElementById("order-items");
        orderItemsContainer.innerHTML = "";

        const orderEntries = Object.entries(order);
        const start = currentPage * maxItemsPerPage;
        const end = Math.min(start + maxItemsPerPage, orderEntries.length);

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
            totalElement.textContent = `${itemTotal} P`;

            orderItem.appendChild(nameElement);
            orderItem.appendChild(quantityElement);
            orderItem.appendChild(totalElement);
            orderItemsContainer.appendChild(orderItem);
        });

        updatePaginationButtons(orderEntries.length);
    }

    function updatePaginationButtons(totalItems) {
        const upButton = document.querySelector(".scroll-up");
        const downButton = document.querySelector(".scroll-down");

        upButton.disabled = currentPage === 0;
        downButton.disabled = (currentPage + 1) * maxItemsPerPage >= totalItems;
    }

    function scrollUp() {
        if (currentPage > 0) {
            currentPage--;
            updateOrder();
        }
    }

    function scrollDown() {
        const totalItems = Object.keys(order).length;
        if ((currentPage + 1) * maxItemsPerPage < totalItems) {
            currentPage++;
            updateOrder();
        }
    }

    async function fetchProductsByCategory(categoryId) {
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
                button.onclick = () => handleProductClick(product.name, product.cost);

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

    document.querySelector(".scroll-up").addEventListener("click", scrollUp);
    document.querySelector(".scroll-down").addEventListener("click", scrollDown);

    window.onload = fetchCategories;
})();
