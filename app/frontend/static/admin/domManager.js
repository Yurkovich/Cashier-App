class DOMManager {
    
    constructor() {
        document.addEventListener("DOMContentLoaded", () => {
            this.initializeEventListeners();
        });
        this.changeProductButton = document.getElementById("change-product-button");
        this.changeIdInput = document.getElementById("change-id-input");
        this.changeTitleInput = document.getElementById("change-title-input");
        this.addProductButton = document.getElementById("add-product-button");
        this.deleteProductButton = document.getElementById("delete-product-button");
        this.productPageButton = document.querySelector(".product-page");
        this.addCategorySelect = document.getElementById("add-category-select");
        this.changeCategorySelect = document.getElementById("change-category-select");
        this.deleteIdInput = document.getElementById("delete-id-input");
        this.changeCostInput = document.getElementById("change-cost-input");
        this.addTitleInput = document.getElementById("add-title-input");
        this.addCostInput = document.getElementById("add-cost-input");
        this.showTableContainer = document.querySelector(".show-table");
    }

    initializeEventListeners(productManager) {
        this.changeProductButton.addEventListener("click", productManager.handleChangeProduct.bind(productManager));
        this.changeIdInput.addEventListener("input", productManager.handleIdInput.bind(productManager));
        this.changeTitleInput.addEventListener("blur", productManager.handleTitleBlur.bind(productManager));
        this.changeTitleInput.addEventListener("keypress", productManager.handleTitleEnter.bind(productManager));
        this.addProductButton.addEventListener("click", productManager.addProduct.bind(productManager));
        this.deleteProductButton.addEventListener("click", productManager.deleteProduct.bind(productManager));
        this.productPageButton.addEventListener("click", async () => {
            console.log("Клик по кнопке product-page");
            await productManager.refreshProductTable();
        });
    }

    clearChangeFields() {
        this.changeIdInput.value = "";
        this.changeTitleInput.value = "";
        this.changeCostInput.value = "";
        this.changeCategorySelect.value = "";
    }

    populateCategorySelectors(categories) {
        const selectors = [this.addCategorySelect, this.changeCategorySelect];
        selectors.forEach(selector => {
            selector.innerHTML = "";
            const defaultOption = document.createElement("option");
            defaultOption.text = "Выберите категорию";
            defaultOption.value = "";
            selector.appendChild(defaultOption);
        });

        categories.forEach(category => {
            selectors.forEach(selector => {
                const option = document.createElement("option");
                option.value = category.id;
                option.text = category.name;
                selector.appendChild(option);
            });
        });
    }

    generateProductTable(products, sortHandler) {
        this.showTableContainer.innerHTML = "";

        if (!Array.isArray(products) || products.length === 0) {
            this.showTableContainer.textContent = "Продукты не найдены.";
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
            th.addEventListener("click", () => sortHandler(header.key));
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
        this.showTableContainer.appendChild(table);
    }
}

export default DOMManager;
