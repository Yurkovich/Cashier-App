import { generateProductTable } from "./navbar.js"

class ProductManager {
    constructor() {
        this.productAddButton = document.getElementById("products__add-button");
        this.productAddCategory = document.getElementById("products__add-category");
        this.productAddName = document.getElementById("products__add-name");
        this.productAddCost = document.getElementById("products__add-cost");

        this.productUpdateButton = document.getElementById("products__update-button");
        this.productUpdateId = document.getElementById("products__update-id");
        this.productUpdateCategory = document.getElementById("products__update-category");
        this.productUpdateName = document.getElementById("products__update-name");
        this.productUpdateCost = document.getElementById("products__update-cost");

        this.productDeleteId = document.getElementById("products__delete-id")
        this.productDeleteButton = document.getElementById("products__delete-button")

        this.init();
    }

    init() {
        if (this.productAddButton) {
            this.productAddButton.addEventListener("click", () => this.handleAddProduct());
        }

        if (this.productUpdateButton) {
            this.productUpdateButton.addEventListener("click", () => this.handleUpdateProduct());
        }

        if (this.productDeleteButton) {
            this.productDeleteButton.addEventListener("click", () => this.handleDeleteProduct());
        }
    }

    async handleAddProduct() {
        const category = this.productAddCategory.value;
        const name = this.productAddName.value.trim();
        const cost = parseFloat(this.productAddCost.value);

        if (!this.validateFields(name, cost, category)) {
            alert("Пожалуйста, заполните все поля корректно.");
            return;
        }

        const data = {
            category_id: category,
            name: name,
            cost: cost
        };

        try {
            const response = await this.addProduct(data);
            if (response.ok) {
                this.resetAddForm();
                generateProductTable(document.querySelector(".table__product"));
            } else {
                throw new Error(`Ошибка: ${response.status}`);
            }
        } catch (error) {
            console.error("Ошибка при добавлении продукта:", error);
            alert("Произошла ошибка. Попробуйте снова.");
        }
    }

    validateFields(name, cost, category) {
        return name && !isNaN(cost) && category;
    }

    async handleUpdateProduct() {
        const id = this.productUpdateId.value.trim();
        const name = this.productUpdateName.value.trim();
        const category = this.productUpdateCategory.value;
        const cost = parseFloat(this.productUpdateCost.value.trim());

        if (!this.validateFields(name, cost, category)) {
            alert("Пожалуйста, заполните все поля корректно.");
            return;
        }

        const data = {
            id: id,
            name: name,
            category_id: category,
            cost: cost
        };

        try {
            const response = await this.updateProduct(data);
            if (response.ok) {
                this.resetUpdateForm();
                generateProductTable(document.querySelector(".table__product"));
            } else {
                throw new Error(`Ошибка: ${response.status}`);
            }
        } catch (error) {
            console.error("Ошибка при обновлении продукта:", error);
            alert("Произошла ошибка. Попробуйте снова.");
        }
    }

    async handleDeleteProduct() {
        const id = this.productDeleteId.value.trim();

        const data = {
            id: id,
        };

        try {
            const response = await this.deleteProduct(data);
            if (response.ok) {
                this.resetDeleteForm();
                generateProductTable(document.querySelector(".table__product"))
            } else {
                throw new Error(`Ошибка: ${response.status}`);
            }
        } catch (error) {
            console.error("Ошибка при удалении продукта:", error);
            alert("Произошла ошибка. Попробуйте снова.");
        }
    }

    async addProduct(data) {
        const response = await fetch("/api/products", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        return response;
    }

    async updateProduct(data) {
        const response = await fetch("/api/products", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });
        return response;
    }

    async deleteProduct(data) {
        const response = await fetch(`/api/products/${data.id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        })
        return response;
    }

    resetAddForm() {
        this.productAddName.value = "";
        this.productAddCost.value = "";
        this.productAddCategory.value = "";
    }

    resetUpdateForm() {
        this.productUpdateId.value = "";
        this.productUpdateName.value = "";
        this.productUpdateCategory.value = "";
        this.productUpdateCost.value = "";
    }

    resetDeleteForm() {
        this.productDeleteId.value = "";
    }

    
}

document.addEventListener("DOMContentLoaded", () => {
    new ProductManager();
});
