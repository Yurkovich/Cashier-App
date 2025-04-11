import { categoryCache } from './category-cache.js';

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

        const data = { 
            name, 
            parent_id: parentId === "" ? null : parseInt(parentId)
        };

        try {
            const response = await this.addCategory(data);
            if (response.ok) {
                this.resetAddForm();
                await categoryCache.refreshCache();
                this.refreshCategoryTable();
                this.refreshCategorySelects();
            } else {
                const errorData = await response.json();
                throw new Error(errorData.detail || `Ошибка: ${response.status}`);
            }
        } catch (error) {
            console.error("Ошибка при добавлении категории:", error);
            alert("Произошла ошибка. Попробуйте снова.");
        }
    }

    async handleUpdateCategory() {
        const id = parseInt(this.categoryUpdateId.value);
        const name = this.categoryUpdateName.value.trim();
        const parentId = this.categoryUpdateParent.value;

        if (!id || !name) {
            alert("ID и название категории обязательны.");
            return;
        }

        const data = {
            id,
            name,
            parent_id: parentId === "" ? null : parseInt(parentId)
        };

        try {
            const response = await this.updateCategory(data);
            if (response.ok) {
                this.resetUpdateForm();
                await categoryCache.refreshCache();
                this.refreshCategoryTable();
                this.refreshCategorySelects();
            } else {
                const errorData = await response.json();
                throw new Error(errorData.detail || `Ошибка: ${response.status}`);
            }
        } catch (error) {
            console.error("Ошибка при обновлении категории:", error);
            alert("Произошла ошибка. Попробуйте снова.");
        }
    }

    async handleDeleteCategory() {
        const id = parseInt(this.categoryDeleteId.value);

        if (!id) {
            alert("Введите ID категории для удаления.");
            return;
        }

        if (!confirm("Вы уверены, что хотите удалить эту категорию?")) {
            return;
        }

        try {
            const response = await this.deleteCategory(id);
            if (response.ok) {
                this.resetDeleteForm();
                await categoryCache.refreshCache();
                this.refreshCategoryTable();
                this.refreshCategorySelects();
            } else {
                const errorData = await response.json();
                throw new Error(errorData.detail || `Ошибка: ${response.status}`);
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
            const response = await fetch("/api/categories/nested");
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
        if (!this.categoryTable) {
            console.error("Элемент с классом 'table__category' не найден");
            return;
        }
        await this.generateCategoryTable(this.categoryTable);
    }
    

    async generateCategoryTable(container) {
        if (!container) {
            console.error("Контейнер для таблицы категорий не найден");
            return;
        }
        
        container.innerHTML = `
            <table>
                <thead>
                    <tr>
                        <th data-sort="id" class="sortable">ID <span class="sort-icon">↕</span></th>
                        <th data-sort="name" class="sortable">Название <span class="sort-icon">↕</span></th>
                    </tr>
                </thead>
                <tbody id="category-table-body">
                </tbody>
            </table>
        `;

        try {
            const response = await fetch('/api/categories');
            const categories = await response.json();
            
            const categoryMap = new Map();
            function addCategoriesToMap(categories) {
                categories.forEach(category => {
                    categoryMap.set(category.id, category.name);
                    if (category.subcategories && category.subcategories.length > 0) {
                        addCategoriesToMap(category.subcategories);
                    }
                });
            }
            addCategoriesToMap(categories);

            const flattenedCategories = [];
            function flattenCategories(categories, parentName = '') {
                categories.forEach(category => {
                    flattenedCategories.push({
                        ...category,
                        parentName: parentName
                    });
                    if (category.subcategories && category.subcategories.length > 0) {
                        flattenCategories(category.subcategories, category.name);
                    }
                });
            }
            flattenCategories(categories);

            flattenedCategories.sort((a, b) => a.id - b.id);

            const tbody = container.querySelector('#category-table-body');
            if (!tbody) {
                console.error("Не удалось найти элемент tbody с id 'category-table-body'");
                return;
            }
            
            tbody.innerHTML = '';
            
            const nestedCategories = this.buildNestedCategories(flattenedCategories);
            
            const categoryRows = this.createCategoryRows(nestedCategories);
            tbody.appendChild(categoryRows);

            const sortableHeaders = container.querySelectorAll('th.sortable');
            sortableHeaders.forEach(header => {
                header.addEventListener('click', () => {
                    const sortKey = header.dataset.sort;
                    const currentOrder = header.querySelector('.sort-icon').textContent;
                    const newOrder = currentOrder === '↑' ? '↓' : '↑';
                    
                    sortableHeaders.forEach(h => h.querySelector('.sort-icon').textContent = '↕');
                    header.querySelector('.sort-icon').textContent = newOrder;
                    
                    flattenedCategories.sort((a, b) => {
                        const aValue = a[sortKey];
                        const bValue = b[sortKey];
                        const modifier = newOrder === '↑' ? 1 : -1;
                        
                        if (typeof aValue === 'string') {
                            return modifier * aValue.localeCompare(bValue);
                        }
                        return modifier * (aValue - bValue);
                    });
                    
                    const nestedCategories = this.buildNestedCategories(flattenedCategories);
                    tbody.innerHTML = '';
                    const categoryRows = this.createCategoryRows(nestedCategories);
                    tbody.appendChild(categoryRows);
                });
            });
        } catch (error) {
            console.error("Ошибка при загрузке данных:", error);
            container.innerHTML = '<p>Ошибка при загрузке данных</p>';
        }
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

        selectElement.innerHTML = '<option value="">Выберите родительскую категорию</option>';

        const categories = await categoryCache.getCategories();
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
                option.textContent = level > 0 ? `${"—".repeat(level)} ${category.name}` : category.name;
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
            "delivery__modal-category",
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

    buildNestedCategories(flattenedCategories) {
        const categoryMap = new Map();
        flattenedCategories.forEach(category => {
            categoryMap.set(category.id, {
                ...category,
                subcategories: []
            });
        });

        const rootCategories = [];
        flattenedCategories.forEach(category => {
            const categoryWithSubcategories = categoryMap.get(category.id);
            if (category.parent_id === null || category.parent_id === 0) {
                rootCategories.push(categoryWithSubcategories);
            } else {
                const parent = categoryMap.get(category.parent_id);
                if (parent) {
                    parent.subcategories.push(categoryWithSubcategories);
                } else {
                    rootCategories.push(categoryWithSubcategories);
                }
            }
        });

        return rootCategories;
    }
}

const categoryManager = new CategoryManager();
export { categoryManager };
