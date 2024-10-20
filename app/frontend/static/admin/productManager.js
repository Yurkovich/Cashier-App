import DOMManager from './domManager.js';

class ProductManager {
    constructor() {
        this.domManager = new DOMManager();
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
        this.domManager.initializeEventListeners(this);
        await this.categorySelector();
        await this.refreshProductTable();
    }

    async deleteProduct() {
        const productId = this.domManager.deleteIdInput.value;
        if (!productId) {
            alert("Введите ID товара для удаления.");
            return;
        }
        const confirmed = confirm(`Вы уверены, что хотите удалить товар с ID: ${productId}?`);
        if (!confirmed) return;

        try {
            const response = await fetch(`/api/products/${productId}`, { method: "DELETE" });
            if (response.status === 204) {
                await this.refreshProductTable();
                this.domManager.deleteIdInput.value = '';
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
            this.domManager.clearChangeFields();
        }
    }

    handleTitleBlur(event) {
        const productName = event.target.value;
        if (productName) {
            this.fetchProductDataByName(productName);
        } else {
            this.domManager.clearChangeFields();
        }
    }

    handleTitleEnter(event) {
        if (event.key === "Enter") {
            const productName = event.target.value;
            if (productName) {
                this.fetchProductDataByName(productName);
            } else {
                this.domManager.clearChangeFields();
            }
        }
    }

    async fetchProductDataById(productId) {
        try {
            const response = await fetch(`/api/products/${productId}`);
            if (!response.ok) throw new Error(`Ошибка: ${response.status}`);

            const productData = await response.json();
            this.domManager.changeTitleInput.value = productData.name;
            this.domManager.changeCategorySelect.value = productData.category_id;
            this.domManager.changeCostInput.value = productData.cost;
        } catch (error) {
            console.error("Ошибка при получении данных о продукте:", error);
            this.domManager.clearChangeFields();
        }
    }

    async fetchProductDataByName(productName) {
        try {
            const response = await fetch(`/api/products/name/${productName}`);
            if (!response.ok) throw new Error(`Ошибка: ${response.status}`);

            const productData = await response.json();
            this.domManager.changeIdInput.value = productData.id;
            this.domManager.changeCategorySelect.value = productData.category_id;
            this.domManager.changeCostInput.value = productData.cost;
        } catch (error) {
            console.error("Ошибка при получении данных о продукте:", error);
            this.domManager.clearChangeFields();
        }
    }

    async handleChangeProduct() {
        const productId = this.domManager.changeIdInput.value;
        const productName = this.domManager.changeTitleInput.value;
        const categoryId = this.domManager.changeCategorySelect.value;
        const productCost = this.domManager.changeCostInput.value;

        if (productId && productName && categoryId && productCost) {
            await this.updateProduct(productId, productName, categoryId, productCost);
            await this.refreshProductTable();
        } else {
            alert("Пожалуйста, заполните все поля.");
        }
    }

    async updateProduct(id, name, categoryId, cost) {
        try {
            const response = await fetch(`/api/all_products`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, name, category_id: categoryId, cost }),
            });
            if (!response.ok) throw new Error(`Ошибка: ${response.status}`);
            this.domManager.clearChangeFields();
        } catch (error) {
            console.error("Ошибка при обновлении товара:", error);
        }
    }

    async addProduct() {
        const getCategory = this.domManager.addCategorySelect.value;
        const getTitle = this.domManager.addTitleInput.value;
        const getCost = this.domManager.addCostInput.value;

        const productData = { category_id: getCategory, name: getTitle, cost: getCost };

        try {
            const response = await fetch("/api/all_products", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(productData),
            });
            if (!response.ok) throw new Error(`Ошибка: ${response.status}`);

            await this.refreshProductTable();
            this.domManager.addTitleInput.value = "";
            this.domManager.addCostInput.value = "";
            this.domManager.addCategorySelect.value = "";
        } catch (error) {
            console.error("Ошибка при добавлении товара:", error);
        }
    }

    async categorySelector() {
        try {
            const response = await fetch("/api/categories");
            if (!response.ok) throw new Error(`Ошибка: ${response.status}`);

            const categories = await response.json();
            this.domManager.populateCategorySelectors(categories);
        } catch (error) {
            console.error("Ошибка при получении категорий:", error);
        }
    }

    async refreshProductTable() {
        try {
            const response = await fetch("/api/all_products");
            if (!response.ok) throw new Error(`Ошибка: ${response.status}`);

            const products = await response.json();
            this.products = products;
            this.domManager.generateProductTable(products, this.sortProducts.bind(this));
        } catch (error) {
            console.error("Ошибка при обновлении таблицы продуктов:", error);
        }
    }

    sortProducts(column) {
        const order = this.sortOrder[column] === 'asc' ? 'desc' : 'asc';
        this.sortOrder[column] = order;

        this.products.sort((a, b) => {
            const aValue = a[column];
            const bValue = b[column];

            if (aValue < bValue) return order === 'asc' ? -1 : 1;
            if (aValue > bValue) return order === 'asc' ? 1 : -1;
            return 0;
        });

        this.domManager.generateProductTable(this.products, this.sortProducts.bind(this));
    }
}

export default ProductManager;
