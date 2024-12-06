
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

        this.productDeleteId = document.getElementById("products__delete-id");
        this.productDeleteButton = document.getElementById("products__delete-button");

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

        if (this.productUpdateId) {
            this.productUpdateId.addEventListener("input", () => this.trackUpdateProductId());
        }

    }

    async trackUpdateProductId() {
        const value = this.productUpdateId.value;
    
        if (value === '') {
            this.productUpdateName.value = '';
            this.productUpdateCategory.value = '0';
            this.productUpdateCost.value = '';
            this.productUpdateButton.disabled = true;
            this.productUpdateButton.style.opacity = "0.7";
            return;
        }
    
        try {
            const data = await this.getProductById(value);
            if (data) {
                this.productUpdateName.value = data.name || '';
                this.productUpdateCategory.value = data.category_id || '0';
                this.productUpdateCost.value = data.cost || '';
                this.productUpdateButton.disabled = false;
                this.productUpdateButton.style.opacity = "1";
            } else {
                throw new Error('Товар не найден');
            }
        } catch (error) {
            this.productUpdateName.value = 'НЕСУЩЕСТВУЮЩИЙ ТОВАР';
            this.productUpdateCategory.value = '0';
            this.productUpdateCost.value = '';
            this.productUpdateButton.disabled = true;
            this.productUpdateButton.style.opacity = "0.7";
            console.error('Ошибка при получении товара:', error);
        }
    }

    async getProductById(productId) {
        try {
            const response = await fetch(`/api/products/${productId}`);
            if (!response.ok) {
                throw new Error(`Ошибка: ${response.status}`);
            }
            const product = await response.json();
            return product;
        } catch (error) {
            console.error("Ошибка при получении продукта:", error);
            return null;
        }
    }

    async generateProductTable(container) {
        container.innerHTML = `
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Название</th>
                        <th>Категория</th>
                        <th>Цена</th>
                    </tr>
                </thead>
                <tbody id="product-table-body">
                    <!-- Здесь будут строки таблицы с продуктами -->
                </tbody>
            </table>
        `;
    
        fetch('/api/all_products')
            .then(response => response.json())
            .then(data => {
                const tbody = document.getElementById('product-table-body');
    
                fetch('/api/categories')
                    .then(response => response.json())
                    .then(categories => {
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
    
                        data.forEach(product => {
                            const categoryName = categoryMap.get(product.category_id) || 'Неизвестно';
    
                            const row = document.createElement('tr');
                            row.innerHTML = `
                                <td>${product.id}</td>
                                <td>${product.name}</td>
                                <td>${categoryName}</td>
                                <td>${product.cost} ₽</td>
                            `;
                            tbody.appendChild(row);
                        });
                    })
                    .catch(error => {
                        console.error('Error loading categories:', error);
                    });
            })
            .catch(error => {
                console.error('Error loading products:', error);
            });
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
                generateProductTable(document.querySelector(".table__product"));
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
        });
        return response;
    }

    resetAddForm() {
        this.productAddName.value = "";
        this.productAddCost.value = "";
        this.productAddCategory.value = "0";
    }

    resetUpdateForm() {
        this.productUpdateId.value = "";
        this.productUpdateName.value = "";
        this.productUpdateCategory.value = "0";
        this.productUpdateCost.value = "";
    }

    resetDeleteForm() {
        this.productDeleteId.value = "";
    }
}

const productManager = new ProductManager();
export { productManager };