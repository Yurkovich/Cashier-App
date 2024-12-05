async function refreshWarehouseTable() {
    const warehouse = await fetchWarehouse();
    generateWarehouseTable(warehouse);
}

async function fetchWarehouse() {
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

function generateWarehouseTable(warehouse) {
    const containerDiv = document.querySelector(".table__warehouse");
    containerDiv.innerHTML = "";

    if (!Array.isArray(warehouse) || warehouse.length === 0) {
        containerDiv.textContent = "Данные о складе не найдены.";
        return;
    }

    const table = document.createElement("table");
    const thead = document.createElement("thead");
    const tbody = document.createElement("tbody");

    const headerRow = document.createElement("tr");
    const headers = [
        { key: "id", text: "ID" },
        { key: "category", text: "Категория" },
        { key: "name", text: "Название товара" },
        { key: "cost", text: "Стоимость" },
        { key: "quantity", text: "Количество" },
        { key: "amount", text: "Сумма" },
    ];

    headers.forEach(({ key, text }) => {
        const th = document.createElement("th");
        th.textContent = text;
        headerRow.appendChild(th);
    });

    thead.appendChild(headerRow);
    tbody.appendChild(createWarehouseRows(warehouse));

    table.appendChild(thead);
    table.appendChild(tbody);
    containerDiv.appendChild(table);
}

function createWarehouseRows(warehouse) {
    const fragment = document.createDocumentFragment();

    warehouse.forEach(item => {
        const row = document.createElement("tr");

        const idCell = document.createElement("td");
        idCell.textContent = item.id;
        row.appendChild(idCell);

        const categoryCell = document.createElement("td");
        categoryCell.textContent = item.category;
        row.appendChild(categoryCell);

        const nameCell = document.createElement("td");
        nameCell.textContent = item.name;
        row.appendChild(nameCell);

        const costCell = document.createElement("td");
        costCell.textContent = item.cost;
        row.appendChild(costCell);

        const quantityCell = document.createElement("td");
        quantityCell.textContent = item.quantity;
        row.appendChild(quantityCell);

        const amountCell = document.createElement("td");
        amountCell.textContent = item.amount;
        row.appendChild(amountCell);

        fragment.appendChild(row);
    });

    return fragment;
}