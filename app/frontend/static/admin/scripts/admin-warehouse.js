import { categoryCache } from './category-cache.js';

class WarehouseManager {
    constructor() {
        this.warehouseAddCategory = document.getElementById("warehouse__add-category");
        this.warehouseAddBarcode = document.getElementById("warehouse__add-barcode");
        this.warehouseAddName = document.getElementById("warehouse__add-name");
        this.warehouseAddRetail = document.getElementById("warehouse__add-retail");
        this.warehouseAddPurchasing = document.getElementById("warehouse__add-purchasing");
        this.warehouseAddQuantity = document.getElementById("warehouse__add-quantity");
        this.warehouseAddButton = document.getElementById("warehouse__add-button")

        this.warehouseUpdateId = document.getElementById("warehouse__update-id")
        this.warehouseUpdateCategory = document.getElementById("warehouse__update-category");
        this.warehouseUpdateBarcode = document.getElementById("warehouse__update-barcode");
        this.warehouseUpdateName = document.getElementById("warehouse__update-name");
        this.warehouseUpdateRetail = document.getElementById("warehouse__update-retail");
        this.warehouseUpdatePurchasing = document.getElementById("warehouse__update-purchasing");
        this.warehouseUpdateQuantity = document.getElementById("warehouse__update-quantity");
        this.warehouseUpdateButton = document.getElementById("warehouse__update-button")

        this.warehouseDeleteId = document.getElementById("warehouse__delete-id");
        this.warehouseDeleteButton = document.getElementById("warehouse__delete-button");

        this.warehouseContainer = document.querySelector(".table__warehouse");

        this.init();
    }

    init() {
        if (this.warehouseAddButton) {
            this.warehouseAddButton.addEventListener("click", () => this.handleAddItem());
        }

        if (this.warehouseUpdateButton) {
            this.warehouseUpdateButton.addEventListener("click", () => this.handleUpdateItem());
        }

        if (this.warehouseDeleteButton) {
            this.warehouseDeleteButton.addEventListener("click", () => this.handleDeleteItem());
        }

        if (this.warehouseUpdateId) {
            this.warehouseUpdateId.addEventListener("input", () => this.trackUpdateId());
        }

        this.refreshWarehouseTable();
    }

    async refreshWarehouseTable() {
        const warehouse = await this.fetchWarehouse();
        this.generateWarehouseTable(this.warehouseContainer);
    }
    
    async generateWarehouseTable(container) {
        container.innerHTML = `
            <table>
                <thead>
                    <tr>
                        <th data-sort="id" class="sortable">ID <span class="sort-icon">↕</span></th>
                        <th data-sort="product" class="sortable">Товар <span class="sort-icon">↕</span></th>
                        <th data-sort="category" class="sortable">Категория <span class="sort-icon">↕</span></th>
                        <th data-sort="quantity" class="sortable">Количество <span class="sort-icon">↕</span></th>
                    </tr>
                </thead>
                <tbody id="warehouse-table-body">
                </tbody>
            </table>
        `;

        try {
            const [productsResponse, categories] = await Promise.all([
                fetch('/api/products'),
                categoryCache.getCategories()
            ]);
            
            const products = await productsResponse.json();
            
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

            const productsWithCategoryNames = products.map(product => ({
                ...product,
                categoryName: categoryMap.get(product.category_id) || 'Неизвестно'
            }));

            productsWithCategoryNames.sort((a, b) => a.id - b.id);

            const tbody = document.getElementById('warehouse-table-body');
            this.renderWarehouseRows(tbody, productsWithCategoryNames);

            const sortableHeaders = container.querySelectorAll('th.sortable');
            sortableHeaders.forEach(header => {
                header.addEventListener('click', () => {
                    const sortKey = header.dataset.sort;
                    const currentOrder = header.querySelector('.sort-icon').textContent;
                    const newOrder = currentOrder === '↑' ? '↓' : '↑';
                    
                    sortableHeaders.forEach(h => h.querySelector('.sort-icon').textContent = '↕');
                    header.querySelector('.sort-icon').textContent = newOrder;
                    
                    productsWithCategoryNames.sort((a, b) => {
                        const aValue = a[sortKey];
                        const bValue = b[sortKey];
                        const modifier = newOrder === '↑' ? 1 : -1;
                        
                        if (typeof aValue === 'string') {
                            return modifier * aValue.localeCompare(bValue);
                        }
                        return modifier * (aValue - bValue);
                    });
                    
                    this.renderWarehouseRows(tbody, productsWithCategoryNames);
                });
            });
        } catch (error) {
            console.error("Ошибка при загрузке данных:", error);
            container.innerHTML = '<p>Ошибка при загрузке данных</p>';
        }
    }

    renderWarehouseRows(tbody, products) {
        tbody.innerHTML = '';
        products.forEach(product => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${product.id}</td>
                <td>${product.name}</td>
                <td>${product.categoryName}</td>
                <td>${product.quantity || 0}</td>
            `;
            tbody.appendChild(row);
        });
    }

    async trackUpdateId() {
        const value = this.warehouseUpdateId.value;

        if (value === '') {
            this.warehouseUpdateName.value = '';
            this.warehouseUpdateCategory.value = '0';
            this.warehouseUpdateBarcode.value = '';
            this.warehouseUpdateRetail.value = '';
            this.warehouseUpdatePurchasing.value = '';
            this.warehouseUpdateQuantity.value = '';
            this.warehouseUpdateButton.disabled = true;
            this.warehouseUpdateButton.style.opacity = "0.7";
            return;
        }

        try {
            const data = await this.findItemById(value);
            if (data) {
                this.warehouseUpdateCategory.value = data.category_id || '0';
                this.warehouseUpdateBarcode.value = data.barcode;
                this.warehouseUpdateName.value = data.name || '';
                this.warehouseUpdateRetail.value = data.retail_price || '';
                this.warehouseUpdatePurchasing.value = data.purchasing_price || '';
                this.warehouseUpdateQuantity.value = data.quantity || '';

                this.warehouseUpdateButton.disabled = false;
                this.warehouseUpdateButton.style.opacity = "1";
            } else {
                throw new Error('Товар не найден');
            }
        } catch (error) {
            this.warehouseUpdateName.value = 'НЕСУЩЕСТВУЮЩИЙ ТОВАР';
            this.warehouseUpdateCategory.value = '0';
            this.warehouseUpdateBarcode.value = '';
            this.warehouseUpdateRetail.value = '';
            this.warehouseUpdatePurchasing.value = '';
            this.warehouseUpdateQuantity.value = '';

            this.warehouseUpdateButton.disabled = true;
            this.warehouseUpdateButton.style.opacity = "0.7";
            console.error('Ошибка при получении njdfhf:', error);
        }
    }

    async handleAddItem() {
        const category_id = this.warehouseAddCategory.value;
        const barcode = this.warehouseAddBarcode.value;
        const name = this.warehouseAddName.value;
        const retail = this.warehouseAddRetail.value;
        const purchasing = this.warehouseAddPurchasing.value;
        const quantity = this.warehouseAddQuantity.value;

        console.log(category_id, barcode, name, retail, purchasing, quantity)

        if ( !barcode || !name || !retail || !purchasing || !quantity) {
            alert("Все поля должны быть заполнены.");
            return;
        }

        const data = { category_id: category_id || null, barcode: barcode, name: name, retail_price: retail, purchasing_price: purchasing, quantity: quantity };
        console.log(data)

        try {
            const response = await this.addItem(data);
            if (response.ok) {
                this.resetAddForm();
                this.refreshWarehouseTable();
            } else {
                throw new Error(`Ошибка: ${response.status}`);
            }
        } catch (error) {
            console.error("Ошибка при добавлении товара:", error);
            alert("Произошла ошибка. Попробуйте снова.");
        }
    }

    async handleUpdateItem() {
        const id = this.warehouseUpdateId.value.trim();
        const categoryId = this.warehouseUpdateCategory.value;
        const barcode = this.warehouseUpdateBarcode.value.trim();
        const name = this.warehouseUpdateName.value.trim();
        const retail = this.warehouseUpdateRetail.value.trim();
        const purchasing = this.warehouseUpdatePurchasing.value.trim();
        const quantity = this.warehouseUpdateQuantity.value.trim();
        

        if (!id || !barcode || !name || !retail || !purchasing || !quantity) {
            alert("Все поля должны быть заполнены.");
            return;
        }

        if (id == categoryId) {
            alert("Вы не можете выбрать родителем категорию, которую обновляете.");
            return;
        }

        const data = { id, category_id: categoryId || null, barcode: barcode, name: name, retail_price: retail, purchasing_price: purchasing, quantity: quantity };

        try {
            const response = await this.updateItem(data);
            if (response.ok) {
                this.resetUpdateForm();
                this.refreshWarehouseTable();
            } else {
                throw new Error(`Ошибка: ${response.status}`);
            }
        } catch (error) {
            console.error("Ошибка при обновлении товара:", error);
            alert("Произошла ошибка. Попробуйте снова.");
        }
    }

    async handleDeleteItem() {
        const id = this.warehouseDeleteId.value.trim();

        if (!id) {
            alert("ID товара не может быть пустым.");
            return;
        }

        try {
            const response = await this.deleteItem(id);
            if (response.ok) {
                this.resetDeleteForm();
                this.refreshWarehouseTable();
            } else {
                throw new Error(`Ошибка: ${response.status}`);
            }
        } catch (error) {
            console.error("Ошибка при удалении товара:", error);
            alert("Произошла ошибка. Попробуйте снова.");
        }
    }

    async addItem(data) {
        const response = await fetch("/api/warehouse", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });
        return response;
    }

    async updateItem(data) {
        const response = await fetch("/api/warehouse", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });
        return response;
    }

    async deleteItem(id) {
        const response = await fetch(`/api/warehouse/${id}`, {
            method: "DELETE",
        });
        return response;
    }

    async findItemById(id) {
        try {
            const response = await fetch(`/api/warehouse/item_id/${id}`, {
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

    async fetchWarehouse() {
        try {
            const response = await fetch("/api/warehouse");
            if (!response.ok) {
                throw new Error(`Ошибка HTTP: ${response.status}`);
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error("Ошибка при получении данных о складе:", error);
            return [];
        }
    }

    resetAddForm() {
        this.warehouseAddCategory.value = '0';
        this.warehouseAddBarcode.value = '';
        this.warehouseAddName.value = '';
        this.warehouseAddRetail.value = '';
        this.warehouseAddPurchasing.value = '';
        this.warehouseAddQuantity.value = '';
    }

    resetUpdateForm() {
        this.warehouseUpdateId.value = '';
        this.warehouseUpdateCategory.value = '0';
        this.warehouseUpdateBarcode.value = '';
        this.warehouseUpdateName.value = '';
        this.warehouseUpdateRetail.value = '';
        this.warehouseUpdatePurchasing.value = '';
        this.warehouseUpdateQuantity.value = '';
    }
    
    resetDeleteForm() {
        this.warehouseDeleteId.value = '';
    }
    
}

const warehouseManager = new WarehouseManager();
export { warehouseManager };
