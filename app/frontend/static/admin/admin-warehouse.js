
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
        this.generateWarehouseTable(warehouse);
    }

    async generateWarehouseTable() {
        const warehouseContainer = document.querySelector('.table__warehouse');
        if (!warehouseContainer) {
            console.error('Element with class "table__warehouse" not found');
            return;
        }
        
        this.warehouseContainer.innerHTML = `
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Баркод</th>
                        <th>Название товара</th>
                        <th>Категория</th>
                        <th>Закупочная стоимость</th>
                        <th>Розничная стомость</th>
                        <th>Количество</th>
                    </tr>
                </thead>
                <tbody id="warehouse-table-body">
                    <!-- Здесь будут строки таблицы со складом -->
                </tbody>
            </table>
        `;
    
        try {
            const response = await fetch('/api/all_warehouse');
            const warehouse = await response.json();
    
            if (!Array.isArray(warehouse) || warehouse.length === 0) {
                warehouseContainer.innerHTML = `<p>Данные о складе не найдены.</p>`;
                return;
            }
    
            const tbody = document.getElementById('warehouse-table-body');
            if (!tbody) {
                console.error('Element with ID "warehouse-table-body" not found');
                return;
            }
    
            const categoryResponse = await fetch('/api/categories');
            const categories = await categoryResponse.json();
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
    
            warehouse.forEach(item => {
                const row = document.createElement('tr');
    
                row.innerHTML = `
                    <td>${item.id}</td>
                    <td>${item.barcode || 'Неизвестно'}</td>
                    <td>${item.name || 'Неизвестно'}</td>
                    <td>${categoryMap.get(item.category_id) || 'Неизвестно'}</td>
                    <td>${item.retail_price || 0} ₽</td>
                    <td>${item.purchasing_price || 0} ₽</td>
                    <td>${item.quantity || 0} ед.</td>
                `;
    
                tbody.appendChild(row);
            });
        } catch (error) {
            console.error('Error generating warehouse table:', error);
            warehouseContainer.innerHTML = `<p>Ошибка загрузки данных о складе.</p>`;
        }
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
            const response = await fetch("/api/all_warehouse");
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

    // =====================================

    
}

const warehouseManager = new WarehouseManager();
export { warehouseManager };
