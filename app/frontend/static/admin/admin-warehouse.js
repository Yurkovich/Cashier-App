
class WarehouseManager {
    constructor() {
        this.initWarehouse();
    }

    async initWarehouse() {
        this.refreshWarehouseTable();
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
            console.error("Ошибка при получении товаров склада:", error);
            return [];
        }
    }

    async refreshWarehouseTable() {
        const warehouse = await this.fetchWarehouse();
        this.generateWarehouseTable(warehouse);
    }

    generateWarehouseTable(warehouse) {
        const containerDiv = document.querySelector(".warehouse-table");

        if (!Array.isArray(warehouse) || warehouse.length === 0) {
            containerDiv.textContent = "Товары на складе не найдены.";
            return;
        }

        const table = document.createElement("table");
        const thead = document.createElement("thead");
        const tbody = document.createElement("tbody");

        const headerRow = document.createElement("tr");
        const headers = [
            { key: "id", text: "ID" },
            { key: "barcode", text: "Штрих-код" },
            { key: "name", text: "Название" },
            { key: "category", text: "Категория" },
            { key: "subcategory", text: "Подкатегория" },
            { key: "retail_price", text: "Цена розн." },
            { key: "purchasing_price", text: "Цена закуп." },
            { key: "quantity", text: "Кол-во" },
        ];

        headers.forEach(({ text }) => {
            const th = document.createElement("th");
            th.textContent = text;
            headerRow.appendChild(th);
        });

        thead.appendChild(headerRow);

        warehouse.forEach((item) => {
            const row = document.createElement("tr");
            headers.forEach(({ key }) => {
                const td = document.createElement("td");
                td.textContent = item[key] || '';
                row.appendChild(td);
            });
            tbody.appendChild(row);
        });

        table.appendChild(thead);
        table.appendChild(tbody);
        containerDiv.appendChild(table);
    }

}

document.addEventListener("DOMContentLoaded", () => {
    new WarehouseManager();
});
