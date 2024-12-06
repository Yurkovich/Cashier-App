
class CategoryManager {
    constructor() {
        this.categoryAddButton = document.getElementById("categories__add-button");
        this.categoryAddName = document.getElementById("categories__add-name");
        this.categoryAddParent = document.getElementById("categories__add-category");

        this.categoryUpdateButton = document.getElementById("categories__update-button");
        this.categoryUpdateId = document.getElementById("categories__update-id");
        this.categoryUpdateName = document.getElementById("categories__update-name");
        this.categoryUpdateParent = document.getElementById("categories__update-category");

        this.categoryDeleteId = document.getElementById("categories__delete-id");
        this.categoryDeleteButton = document.getElementById("categories__delete-button");

        this.categoryTable = document.querySelector(".table__category");

        this.init();
    }

    init() {
        if (this.categoryAddButton) {
            this.categoryAddButton.addEventListener("click", () => this.handleAddCategory());
        }

        if (this.categoryUpdateButton) {
            this.categoryUpdateButton.addEventListener("click", () => this.handleUpdateCategory());
        }

        if (this.categoryDeleteButton) {
            this.categoryDeleteButton.addEventListener("click", () => this.handleDeleteCategory());
        }

        this.categoryUpdateId.addEventListener("input", () => this.trackUpdateId());

        this.refreshCategoryTable();
        this.refreshCategorySelects();
    }

    async trackUpdateId() {
        const value = this.categoryUpdateId.value;

        if (value === '') {
            this.categoryUpdateName.value = '';
            this.categoryUpdateParent.value = '0';
            this.categoryUpdateButton.disabled = true;
            return;
        }

        try {
            const data = await this.findCategoryById(value);
            if (data) {
                this.categoryUpdateName.value = data.name || '';
                this.categoryUpdateParent.value = data.parent_id || '0';
                this.categoryUpdateButton.disabled = false;
                this.categoryUpdateButton.style.opacity = "1";
            } else {
                throw new Error('Категория не найдена');
            }
        } catch (error) {
            this.categoryUpdateName.value = 'НЕСУЩЕСТВУЮЩАЯ КАТЕГОРИЯ';
            this.categoryUpdateParent.value = '0';
            this.categoryUpdateButton.disabled = true;
            this.categoryUpdateButton.style.opacity = "0.7";
            console.error('Ошибка при получении категории:', error);
        }
    }

    async handleAddCategory() {
        const name = this.categoryAddName.value.trim();
        const parentId = this.categoryAddParent.value;

        if (!name) {
            alert("Название категории не может быть пустым.");
            return;
        }

        const data = { name, parent_id: parentId || null };

        try {
            const response = await this.addCategory(data);
            if (response.ok) {
                this.resetAddForm();
                this.refreshCategoryTable();
                this.refreshCategorySelects();
            } else {
                throw new Error(`Ошибка: ${response.status}`);
            }
        } catch (error) {
            console.error("Ошибка при добавлении категории:", error);
            alert("Произошла ошибка. Попробуйте снова.");
        }
    }

    async handleUpdateCategory() {
        const id = this.categoryUpdateId.value.trim();
        const name = this.categoryUpdateName.value.trim();
        const parentId = this.categoryUpdateParent.value;

        if (!id || !name) {
            alert("ID и название категории не могут быть пустыми.");
            return;
        }

        if (id == parentId) {
            alert("Вы не можете выбрать родителем категорию, которую обновляете.");
            return;
        }

        const data = { id, name, parent_id: parentId || null };

        try {
            const response = await this.updateCategory(data);
            if (response.ok) {
                this.resetUpdateForm();
                this.refreshCategoryTable();
                this.refreshCategorySelects();
            } else {
                throw new Error(`Ошибка: ${response.status}`);
            }
        } catch (error) {
            console.error("Ошибка при обновлении категории:", error);
            alert("Произошла ошибка. Попробуйте снова.");
        }
    }

    async handleDeleteCategory() {
        const id = this.categoryDeleteId.value.trim();

        if (!id) {
            alert("ID категории не может быть пустым.");
            return;
        }

        try {
            const response = await this.deleteCategory(id);
            if (response.ok) {
                this.resetDeleteForm();
                this.refreshCategoryTable();
                this.refreshCategorySelects();
            } else {
                throw new Error(`Ошибка: ${response.status}`);
            }
        } catch (error) {
            console.error("Ошибка при удалении категории:", error);
            alert("Произошла ошибка. Попробуйте снова.");
        }
    }

    async addCategory(data) {
        const response = await fetch("/api/categories", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });
        return response;
    }

    async updateCategory(data) {
        const response = await fetch("/api/categories", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });
        return response;
    }

    async deleteCategory(id) {
        const response = await fetch(`/api/categories/${id}`, {
            method: "DELETE",
        });
        return response;
    }

    async findCategoryById(id) {
        try {
            const response = await fetch(`/api/categories/${id}`, {
                method: "GET",
                headers: { "Content-Type": "application/json" }
            });

            if (!response.ok) {
                throw new Error(`Ошибка HTTP: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error("Ошибка при получении категории:", error);
            return null;
        }
    }

    async fetchCategories() {
        try {
            const response = await fetch("/api/categories");
            if (!response.ok) {
                throw new Error(`Ошибка HTTP: ${response.status}`);
            }
            return await response.json();
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
        this.categoryTable.innerHTML = "";

        if (!Array.isArray(categories) || categories.length === 0) {
            this.categoryTable.textContent = "Категории не найдены.";
            return;
        }

        const table = document.createElement("table");
        const thead = document.createElement("thead");
        const tbody = document.createElement("tbody");

        const headerRow = document.createElement("tr");
        const headers = [{ key: "id", text: "ID" }, { key: "name", text: "Название" }];

        headers.forEach(({ text }) => {
            const th = document.createElement("th");
            th.textContent = text;
            headerRow.appendChild(th);
        });

        thead.appendChild(headerRow);
        tbody.appendChild(this.createCategoryRows(categories));
        table.appendChild(thead);
        table.appendChild(tbody);
        this.categoryTable.appendChild(table);
    }

    createCategoryRows(categories, level = 0) {
        const fragment = document.createDocumentFragment();

        categories.forEach(category => {
            const row = document.createElement("tr");

            const idCell = document.createElement("td");
            idCell.textContent = category.id;
            row.appendChild(idCell);

            const nameCell = document.createElement("td");
            nameCell.textContent = `${"—".repeat(level)} ${category.name}`;
            row.appendChild(nameCell);

            fragment.appendChild(row);

            if (category.subcategories && category.subcategories.length > 0) {
                const subcategoryRows = this.createCategoryRows(category.subcategories, level + 1);
                fragment.appendChild(subcategoryRows);
            }
        });

        return fragment;
    }

    async populateCategorySelect(selectElementId) {
        const selectElement = document.getElementById(selectElementId);
        if (!selectElement) {
            console.error(`Элемент с id "${selectElementId}" не найден.`);
            return;
        }

        selectElement.innerHTML = '<option value="0">Выберите родительскую категорию</option>';

        const categories = await this.fetchCategories();
        console.log('Из populate')
        const options = this.createCategoryOptions(categories);
        selectElement.appendChild(options);
    }

    createCategoryOptions(categories, level = 0, uniqueCategories = new Set()) {
        const fragment = document.createDocumentFragment();

        categories.forEach(category => {
            if (!uniqueCategories.has(category.id)) {
                uniqueCategories.add(category.id);

                const option = document.createElement("option");
                option.value = category.id;
                option.textContent = `${"—".repeat(level)} ${category.name}`;
                fragment.appendChild(option);

                if (category.subcategories && category.subcategories.length > 0) {
                    const subcategoryOptions = this.createCategoryOptions(category.subcategories, level + 1, uniqueCategories);
                    fragment.appendChild(subcategoryOptions);
                }
            }
        });

        return fragment;
    }

    refreshCategorySelects() {
        const categorySelectIds = [
            "products__add-category",
            "products__update-category",
            "categories__add-category",
            "categories__update-category",
            "warehouse__add-category",
            "warehouse__update-category",
        ];

        categorySelectIds.forEach(selectId => this.populateCategorySelect(selectId));
    }

    resetAddForm() {
        this.categoryAddName.value = '';
        this.categoryAddParent.value = '0';
    }

    resetUpdateForm() {
        this.categoryUpdateId.value = '';
        this.categoryUpdateName.value = '';
        this.categoryUpdateParent.value = '0';
    }

    resetDeleteForm() {
        this.categoryDeleteId.value = '';
    }
}

const categoryManager = new CategoryManager();
export { categoryManager };
