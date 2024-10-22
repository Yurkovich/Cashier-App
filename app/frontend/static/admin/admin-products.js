
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
        this.products = [];
    }

    async initProduct() {
        document.getElementById("product-edit-button").addEventListener("click", this.handleChangeProduct.bind(this));
        document.getElementById("product-edit-id").addEventListener("input", this.handleIdInput.bind(this));
        document.getElementById("product-edit-title").addEventListener("blur", this.handleTitleBlur.bind(this));
        document.getElementById("product-edit-title").addEventListener("keypress", this.handleTitleEnter.bind(this));
        document.getElementById("product-add-button").addEventListener("click", this.addProduct.bind(this));
        document.getElementById("product-delete-button").addEventListener("click", this.deleteProduct.bind(this));

        await this.categorySelector();
        await this.refreshProductTable();
    }

    async deleteProduct() {
        const productId = document.getElementById("product-delete-id").value;
        if (!productId) {
            this.displayError("Введите ID товара для удаления.");
            return;
        }

        const confirmed = confirm(`Вы уверены, что хотите удалить товар с ID: ${productId}?`);
        if (!confirmed) return;

        try {
            const response = await fetch(`/api/products/${productId}`, { method: "DELETE" });
            if (response.status === 204) {
                await this.refreshProductTable();
                document.getElementById("product-delete-id").value = '';
            } else if (response.status === 404) {
                this.displayError("Товар с таким ID не найден.");
            } else {
                throw new Error(`Ошибка: ${response.statusText}`);
            }
        } catch (error) {
            console.error("Ошибка при удалении товара:", error);
        }
    }

    displayError(message) {
        const errorDiv = document.getElementById("error-message");
        errorDiv.textContent = message;
        errorDiv.style.display = "block";
        setTimeout(() => { errorDiv.style.display = "none"; }, 3000);
    }

    async handleIdInput(event) {
        const productId = event.target.value;
        if (productId) {
            await this.fetchProductDataById(productId);
        } else {
            this.clearEditFields();
        }
    }

    handleTitleBlur(event) {
        const productName = event.target.value;
        if (productName) {
            this.fetchProductDataByName(productName);
        } else {
            this.clearEditFields();
        }
    }

    handleTitleEnter(event) {
        if (event.key === "Enter") {
            const productName = event.target.value;
            if (productName) {
                this.fetchProductDataByName(productName);
            } else {
                this.clearEditFields();
            }
        }
    }

    async fetchProductDataById(productId) {
        try {
            const response = await fetch(`/api/products/${productId}`);
            if (!response.ok) throw new Error(`Ошибка: ${response.status}`);
            const productData = await response.json();
            this.populateProductFields(productData);
        } catch (error) {
            console.error("Ошибка при получении данных о продукте:", error);
            this.clearEditFields();
        }
    }

    async fetchProductDataByName(productName) {
        try {
            const response = await fetch(`/api/products/name/${productName}`);
            if (!response.ok) throw new Error(`Ошибка: ${response.status}`);
            const productData = await response.json();
            this.populateProductFields(productData);
        } catch (error) {
            console.error("Ошибка при получении данных о продукте:", error);
            this.clearEditFields();
        }
    }

    populateProductFields(productData) {
        document.getElementById("product-edit-title").value = productData.name;
        document.getElementById("product-edit-category-select").value = productData.category_id;
        document.getElementById("product-edit-cost").value = productData.cost;
        document.getElementById("product-edit-id").value = productData.id;
    }

    async handleChangeProduct() {
        const productId = document.getElementById("product-edit-id").value;
        const productName = document.getElementById("product-edit-title").value;
        const categoryId = document.getElementById("product-edit-category-select").value;
        const productCost = document.getElementById("product-edit-cost").value;

        if (productId && productName && categoryId && productCost) {
            await this.updateProduct(productId, productName, categoryId, productCost);
            await this.refreshProductTable();
        } else {
            this.displayError("Пожалуйста, заполните все поля.");
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
            if (document.getElementById("product-edit-id").value = "") {
                this.clearEditFields();
            }
        } catch (error) {
            console.error("Ошибка при обновлении товара:", error);
        }
    }

    async addProduct() {
        const getCategory = document.getElementById("product-add-category-select").value;
        const getTitle = document.getElementById("product-add-title").value;
        const getCost = document.getElementById("product-add-cost").value;

        const productData = { category_id: getCategory, name: getTitle, cost: getCost };

        try {
            const response = await fetch("/api/products", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(productData),
            });

            if (response.ok) {
                const responseData = await response.json();
                this.clearAddProductFields();
                alert(`Товар ${responseData.name} добавлен успешно.`);
                await this.refreshProductTable();
            } else {
                const errorData = await response.json();
                this.displayError("Ошибка при добавлении продукта: " + (errorData.message || "Неизвестная ошибка"));
            }
        } catch (error) {
            console.error("Ошибка сети:", error);
        }
    }

    clearAddProductFields() {
        document.getElementById("product-add-title").value = "";
        document.getElementById("product-add-cost").value = "";
        document.getElementById("product-add-category-select").value = "";
    }

    async categorySelector() {
        const addSelector = document.getElementById("product-add-category-select");
        const changeSelector = document.getElementById("product-edit-category-select");

        try {
            const response = await fetch("/api/categories");
            const data = await response.json();
            if (data.length) {
                data.forEach(category => {
                    const option = new Option(category.name, category.id);
                    addSelector.appendChild(option);
                    changeSelector.appendChild(option.cloneNode(true));
                });
            }
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

            this.products = products;
            return products;
        } catch (error) {
            console.error("Ошибка при получении продуктов или категорий:", error);
            return [];
        }
    }

    async refreshProductTable() {
        this.products = await this.fetchProducts();
        this.generateProductTable(this.products);
    }

    generateProductTable(products) {
        const containerDiv = document.querySelector(".products-table");
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

        headers.forEach(header => {
            const th = document.createElement("th");
            th.textContent = header.text;
            th.style.cursor = "pointer";
            th.addEventListener("click", () => this.sortProducts(header.key));
            headerRow.appendChild(th);
        });

        thead.appendChild(headerRow);
        table.appendChild(thead);

        products.forEach(product => {
            const row = document.createElement("tr");
            headers.forEach(header => {
                const td = document.createElement("td");
                td.textContent = product[header.key];
                row.appendChild(td);
            });
            tbody.appendChild(row);
        });

        table.appendChild(tbody);
        containerDiv.appendChild(table);
    }

    clearEditFields() {
        document.getElementById("product-edit-id").value = "";
        document.getElementById("product-edit-title").value = "";
        document.getElementById("product-edit-cost").value = "";
        document.getElementById("product-edit-category-select").value = "";
    }
}

new ProductManager();
