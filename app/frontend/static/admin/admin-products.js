class ProductManager {
    constructor() {
        document.addEventListener("DOMContentLoaded", () => {
            this.initProduct();
        });

        this.sortOrder = {
            id: 'asc',
            name: 'asc',
            category: 'asc',
            cost: 'asc',
        };
    }

    initProduct() {
        document.getElementById("change-product-button")
            .addEventListener("click", this.handleChangeProduct.bind(this));
        document.getElementById("change-id-input")
            .addEventListener("input", this.handleIdInput.bind(this));
        document.getElementById("change-title-input")
            .addEventListener("blur", this.handleTitleBlur.bind(this));
        document.getElementById("change-title-input")
            .addEventListener("keypress", this.handleTitleEnter.bind(this));
        document.getElementById("add-product-button")
            .addEventListener("click", this.addProduct.bind(this));
        document.getElementById("delete-product-button")
            .addEventListener("click", this.deleteProduct.bind(this));

        document.querySelector(".product-page")
            .addEventListener("click", async () => {
                const products = await this.fetchProducts();
                this.generateProductTable(products);
            });

        this.categorySelector();
    }

    async deleteProduct() {
        const productId = document.getElementById("delete-id-input").value;

        if (!productId) {
            alert("Введите ID товара для удаления.");
            return;
        }

        const confirmed = confirm(`Вы уверены, что хотите удалить товар с ID: ${productId}?`);
        if (!confirmed) return;

        try {
            const response = await fetch(`/api/products/${productId}`, { method: "DELETE" });

            if (response.status === 204) {
                this.refreshProductTable();
                document.getElementById("delete-id-input").value = '';
            } else if (response.status === 404) {
                alert("Товар с таким ID не найден.");
            } else {
                throw new Error(`Ошибка: ${response.statusText}`);
            }
        } catch (error) {
            console.error("Ошибка при удалении товара:", error);
        }
    }

    async handleIdInput(event) {
        const productId = event.target.value;
        if (productId) {
            await this.fetchProductDataById(productId);
        } else {
            this.clearChangeFields();
        }
    }

    handleTitleBlur(event) {
        const productName = event.target.value;
        if (productName) {
            this.fetchProductDataByName(productName);
        } else {
            this.clearChangeFields();
        }
    }

    handleTitleEnter(event) {
        if (event.key === "Enter") {
            const productName = event.target.value;
            if (productName) {
                this.fetchProductDataByName(productName);
            } else {
                this.clearChangeFields();
            }
        }
    }

    async fetchProductDataById(productId) {
        try {
            const response = await fetch(`/api/products/${productId}`);
            if (!response.ok) throw new Error(`Ошибка: ${response.status}`);

            const productData = await response.json();
            document.getElementById("change-title-input").value = productData.name;
            document.getElementById("change-category-select").value = productData.category_id;
            document.getElementById("change-cost-input").value = productData.cost;
        } catch (error) {
            console.error("Ошибка при получении данных о продукте:", error);
            this.clearChangeFields();
        }
    }

    async fetchProductDataByName(productName) {
        try {
            const response = await fetch(`/api/products/name/${productName}`);
            if (!response.ok) throw new Error(`Ошибка: ${response.status}`);

            const productData = await response.json();

            document.getElementById("change-id-input").value = productData.id;
            document.getElementById("change-category-select").value = productData.category_id;
            document.getElementById("change-cost-input").value = productData.cost;
        } catch (error) {
            console.error("Ошибка при получении данных о продукте:", error);
            this.clearChangeFields();
        }
    }

    async handleChangeProduct() {
        const productId = document.getElementById("change-id-input").value;
        const productName = document.getElementById("change-title-input").value;
        const categoryId = document.getElementById("change-category-select").value;
        const productCost = document.getElementById("change-cost-input").value;

        if (productId && productName && categoryId && productCost) {
            await this.updateProduct(productId, productName, categoryId, productCost);
            await this.refreshProductTable();
        } else {
            alert("Пожалуйста, заполните все поля.");
        }
    }

    async updateProduct(id, name, categoryId, cost) {
        try {
            const response = await fetch(`/api/products`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, name, category_id: categoryId, cost }),
            });

            if (!response.ok) throw new Error(`Ошибка: ${response.status}`);

            this.clearChangeFields();
        } catch (error) {
            console.error("Ошибка при обновлении товара:", error);
        }
    }

    async addProduct() {
        const getCategory = document.getElementById("add-category-select").value;
        const getTitle = document.getElementById("add-title-input").value;
        const getCost = document.getElementById("add-cost-input").value;

        const productData = { category_id: getCategory, name: getTitle, cost: getCost };

        try {
            const response = await fetch("/api/products", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(productData),
            });

            if (response.ok) {
                const responseData = await response.json();
                document.getElementById("add-title-input").value = "";
                document.getElementById("add-cost-input").value = "";
                document.getElementById("add-category-select").value = "";
                alert(`Товар ${responseData.name} добавлен успешно.`);
                await this.refreshProductTable();
            } else {
                const errorData = await response.json();
                alert("Ошибка при добавлении продукта: " + (errorData.message || "Неизвестная ошибка"));
            }
        } catch (error) {
            console.error("Ошибка сети:", error);
        }
    }

    async categorySelector() {
        const addSelector = document.getElementById("add-category-select");
        const changeSelector = document.getElementById("change-category-select");
    
        try {
            const response = await fetch("/api/categories");
            const data = await response.json();
    
            if (!Array.isArray(data)) throw new Error("Неверный формат данных категорий");
    
            [addSelector, changeSelector].forEach(selector => {
                selector.innerHTML = "";
                const defaultOption = document.createElement("option");
                defaultOption.text = "Выберите категорию";
                defaultOption.value = "";
                selector.appendChild(defaultOption);
            });
    
            data.forEach(category => {
                const addOption = document.createElement("option");
                addOption.value = category.id;
                addOption.text = category.name;
    
                const changeOption = document.createElement("option");
                changeOption.value = category.id;
                changeOption.text = category.name;
    
                addSelector.appendChild(addOption);
                changeSelector.appendChild(changeOption);
            });
        } catch (error) {
            console.error("Ошибка при получении категорий:", error);
        }
    }

    async fetchProducts() {
        try {
            const [productsResponse, categoriesResponse] = await Promise.all([
                fetch("/api/all_products"),
                fetch("/api/categories")
            ]);

            if (!productsResponse.ok || !categoriesResponse.ok) {
                throw new Error(`Ошибка HTTP: ${productsResponse.status} или ${categoriesResponse.status}`);
            }

            const products = await productsResponse.json();
            const categories = await categoriesResponse.json();

            const categoryMap = {};
            categories.forEach(category => {
                categoryMap[category.id] = category.name;
            });

            products.forEach(product => {
                product.category = categoryMap[product.category_id];
            });

            return products;
        } catch (error) {
            console.error("Ошибка при получении продуктов или категорий:", error);
            return [];
        }
    }

    async refreshProductTable() {
        const products = await this.fetchProducts();
        this.generateProductTable(products);
    }

    generateProductTable(products) {
        const containerDiv = document.querySelector(".show-table");
        containerDiv.innerHTML = "";

        if (!Array.isArray(products) || products.length === 0) {
            containerDiv.textContent = "Продукты не найдены.";
            return;
        }

        const table = document.createElement("table");
        const thead = document.createElement("thead");
        const tbody = document.createElement("tbody");

        const headerRow = document.createElement("tr");
        const headers = [
            { key: "id", text: "ID" },
            { key: "name", text: "Название" },
            { key: "category", text: "Категория" },
            { key: "cost", text: "Цена" },
        ];

        headers.forEach(({ key, text }) => {
            const th = document.createElement("th");
            const headerContent = document.createElement("span");
            headerContent.textContent = text;

            const arrow = document.createElement("span");
            arrow.className = "sort-arrow";
            arrow.textContent = this.sortOrder[key] === 'asc' ? ' ▲' : ' ▼';

            th.appendChild(headerContent);
            th.appendChild(arrow);
            th.style.cursor = "pointer";
            th.addEventListener("click", () => {
                this.sortProducts(key);
                this.generateProductTable(products);
            });
            headerRow.appendChild(th);
        });

        thead.appendChild(headerRow);
        products.forEach(product => {
            const row = document.createElement("tr");
            headers.forEach(({ key }) => {
                const td = document.createElement("td");
                td.textContent = product[key];
                row.appendChild(td);
            });
            tbody.appendChild(row);
        });

        table.appendChild(thead);
        table.appendChild(tbody);
        containerDiv.appendChild(table);
    }

    sortProducts(key) {
        this.sortOrder[key] = this.sortOrder[key] === 'asc' ? 'desc' : 'asc';
    }

    clearChangeFields() {
        document.getElementById("change-id-input").value = '';
        document.getElementById("change-title-input").value = '';
        document.getElementById("change-category-select").value = '';
        document.getElementById("change-cost-input").value = '';
    }
}

const productManager = new ProductManager();
