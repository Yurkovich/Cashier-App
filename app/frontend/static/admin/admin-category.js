
class CategoryManager {
    constructor() {
        this.initCategory();
    }

    initCategory() {
        const addButton = document.getElementById("category-add-button");
        const editButton = document.getElementById("category-edit-button");
        const deleteButton = document.getElementById("category-delete-button");

        if (addButton) {
            addButton.addEventListener("click", () => this.addCategory());
        }

        if (editButton) {
            editButton.addEventListener("click", () => this.handleChangeCategory());
        }

        if (deleteButton) {
            deleteButton.addEventListener("click", () => this.deleteCategory());
        }

        this.refreshCategoryTable();
    }

    async addCategory() {
        const categoryName = document.getElementById("category-add-title").value;

        if (!categoryName) {
            alert("Введите название категории.");
            return;
        }

        try {
            const response = await fetch("/api/categories", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ name: categoryName }),
            });

            if (response.ok) {
                document.getElementById("category-add-title").value = "";
                this.refreshCategoryTable();
            } else {
                const errorData = await response.json();
                alert(`Ошибка: ${errorData.detail || "Неизвестная ошибка"}`);
            }
        } catch (error) {
            console.error("Ошибка:", error);
        }
    }

    async handleChangeCategory() {
        const categoryId = document.getElementById("category-edit-id").value;
        const categoryName = document.getElementById("category-edit-title").value;

        if (!categoryId || !categoryName) {
            alert("Введите ID и новое название категории.");
            return;
        }

        try {
            const response = await fetch(`/api/categories`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ id: categoryId, name: categoryName }),
            });

            if (response.ok) {
                document.getElementById("category-edit-id").value = "";
                document.getElementById("category-edit-title").value = "";
                this.refreshCategoryTable();
            } else {
                const errorData = await response.json();
                alert(`Ошибка: ${errorData.detail || "Неизвестная ошибка"}`);
            }
        } catch (error) {
            console.error("Ошибка при изменении категории:", error);
        }
    }

    async deleteCategory() {
        const categoryId = document.getElementById("category-delete-id").value;

        if (!categoryId) {
            alert("Введите ID категории для удаления.");
            return;
        }

        const confirmed = confirm(`Вы уверены, что хотите удалить категорию с ID: ${categoryId}?`);
        if (!confirmed) {
            return;
        }

        try {
            const response = await fetch(`/api/categories/${categoryId}`, {
                method: "DELETE",
            });

            if (response.status === 204) {
                document.getElementById("category-delete-id").value = "";
                this.refreshCategoryTable();
            } else if (response.status === 404) {
                alert("Категория с таким ID не найдена.");
            } else {
                throw new Error(`Ошибка: ${response.statusText}`);
            }
        } catch (error) {
            console.error("Ошибка при удалении категории:", error);
        }
    }

    async fetchCategories() {
        try {
            const response = await fetch("/api/categories");
            if (!response.ok) {
                throw new Error(`Ошибка HTTP: ${response.status}`);
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error("Ошибка при получении категорий:", error);
            return [];
        }
    }

    async refreshCategoryTable() {
        const categories = await this.fetchCategories();
        this.generateCategoryTable(categories);
    }

    generateCategoryTable(categories) {
        const containerDiv = document.querySelector(".categories-table");
        containerDiv.innerHTML = "";

        if (!Array.isArray(categories) || categories.length === 0) {
            containerDiv.textContent = "Категории не найдены.";
            return;
        }

        const table = document.createElement("table");
        const thead = document.createElement("thead");
        const tbody = document.createElement("tbody");

        const headerRow = document.createElement("tr");
        const headers = [
            { key: "id", text: "ID" },
            { key: "name", text: "Название" },
        ];

        headers.forEach(({ key, text }) => {
            const th = document.createElement("th");
            th.textContent = text;
            headerRow.appendChild(th);
        });

        thead.appendChild(headerRow);

        categories.forEach((category) => {
            const row = document.createElement("tr");
            const idCell = document.createElement("td");
            idCell.textContent = category.id;
            row.appendChild(idCell);

            const nameCell = document.createElement("td");
            nameCell.textContent = category.name;
            row.appendChild(nameCell);

            tbody.appendChild(row);
        });

        table.appendChild(thead);
        table.appendChild(tbody);
        containerDiv.appendChild(table);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    new CategoryManager();
});
