document.addEventListener("DOMContentLoaded", () => {
    init();
});

function init() {
    document
        .getElementById("change-product-button")
        .addEventListener("click", handleChangeProduct);
    document
        .getElementById("change-id-input")
        .addEventListener("input", handleIdInput);
    document
        .getElementById("add-product-button")
        .addEventListener("click", addProduct);
    categorySelector();

    document
        .querySelector(".product-page")
        .addEventListener("click", async () => {
            const products = await fetchProducts();
            generateProductTable(products);
        });
}

async function handleIdInput(event) {
    const productId = event.target.value;
    if (productId) {
        await fetchProductData(productId);
    } else {
        clearChangeFields();
    }
}

async function handleChangeProduct() {
    const productId = document.getElementById("change-id-input").value;
    const productName = document.getElementById("change-title-input").value;
    const categoryId = document.getElementById("change-category-select").value;
    const productCost = document.getElementById("change-cost-input").value;

    if (productId && productName && categoryId && productCost) {
        await updateProduct(productId, productName, categoryId, productCost);
        await refreshProductTable(); // Обновляем таблицу после изменения
    } else {
        alert("Пожалуйста, заполните все поля.");
    }
}

async function categorySelector() {
    const addSelector = document.getElementById("add-category-select");
    const changeSelector = document.getElementById("change-category-select");

    try {
        const response = await fetch("/api/categories");
        const data = await response.json();

        if (!Array.isArray(data.categories)) {
            throw new Error("Неверный формат данных категорий");
        }

        [addSelector, changeSelector].forEach((selector) => {
            selector.innerHTML = "";
            const defaultOption = document.createElement("option");
            defaultOption.text = "Выберите категорию";
            defaultOption.value = "";
            selector.appendChild(defaultOption);
        });

        data.categories.forEach((category) => {
            const optionAdd = document.createElement("option");
            optionAdd.value = category.id;
            optionAdd.text = category.name;
            addSelector.appendChild(optionAdd);

            const optionChange = document.createElement("option");
            optionChange.value = category.id;
            optionChange.text = category.name;
            changeSelector.appendChild(optionChange);
        });
    } catch (error) {
        console.error("Ошибка при получении категорий:", error);
    }
}

async function fetchProductData(productId) {
    try {
        const response = await fetch(`/api/products/${productId}`);
        if (!response.ok) {
            throw new Error(`Ошибка: ${response.status}`);
        }

        const productData = await response.json();
        document.getElementById("change-title-input").value = productData.name;
        document.getElementById("change-category-select").value =
            productData.category_id;
        document.getElementById("change-cost-input").value = productData.cost;
    } catch (error) {
        console.error("Ошибка при получении данных о продукте:", error);
        clearChangeFields();
    }
}

async function updateProduct(id, name, categoryId, cost) {
    try {
        const response = await fetch(`/api/products`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                id: id,
                name: name,
                category_id: categoryId,
                cost: cost,
            }),
        });

        if (!response.ok) {
            throw new Error(`Ошибка: ${response.status}`);
        }

        const result = await response.json();
        clearChangeFields();
    } catch (error) {
        console.error("Ошибка при обновлении товара:", error);
    }
}

async function addProduct() {
    let getCategory = document.getElementById("add-category-select").value;
    let getTitle = document.getElementById("add-title-input").value;
    let getCost = document.getElementById("add-cost-input").value;

    const productData = {
        category_id: getCategory,
        name: getTitle,
        cost: getCost,
    };

    try {
        const response = await fetch("/api/products", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(productData),
        });

        if (response.ok) {
            const responseData = await response.json();
            document.getElementById("add-title-input").value = "";
            document.getElementById("add-cost-input").value = "";
            document.getElementById("add-category-select").value = "";
            alert(`Товар ${responseData.name} добавлен успешно.`);
            await refreshProductTable();
        } else {
            const errorData = await response.json();
            alert(
                "Ошибка при добавлении продукта: " +
                    (errorData.message || "Неизвестная ошибка")
            );
        }
    } catch (error) {
        console.error("Ошибка сети:", error);
    }
}

async function fetchProducts() {
    const showTable = (document.querySelector(
        ".product-container"
    ).style.display = "grid");
    try {
        const response = await fetch("/api/all_products");
        if (!response.ok) {
            throw new Error(`Ошибка HTTP: ${response.status}`);
        }
        const data = await response.json();

        if (Array.isArray(data)) {
            return data;
        } else {
            console.warn(
                "Ожидался массив продуктов, но получено что-то другое:",
                data
            );
            return [];
        }
    } catch (error) {
        console.error("Ошибка при получении продуктов:", error);
        return [];
    }
}

async function refreshProductTable() {
    const products = await fetchProducts();
    generateProductTable(products);
}

function generateProductTable(products) {
    const containerDiv = document.querySelector(".show-table");
    containerDiv.innerHTML = "";

    if (!Array.isArray(products) || products.length === 0) {
        containerDiv.textContent = "Продукты не найдены.";
        return;
    }

    const table = document.createElement("table");
    const thead = document.createElement("thead");
    const tbody = document.createElement("tbody");

    const headerRow = document.createElement("tr");
    const headers = ["ID", "Название", "Категория", "Цена"];
    headers.forEach((headerText) => {
        const th = document.createElement("th");
        th.textContent = headerText;
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);

    products.forEach((product) => {
        const row = document.createElement("tr");

        const idCell = document.createElement("td");
        idCell.textContent = product.id;
        row.appendChild(idCell);

        const nameCell = document.createElement("td");
        nameCell.textContent = product.name;
        row.appendChild(nameCell);

        const categoryCell = document.createElement("td");
        categoryCell.textContent = product.category_id;
        row.appendChild(categoryCell);

        const costCell = document.createElement("td");
        costCell.textContent = product.cost;
        row.appendChild(costCell);

        tbody.appendChild(row);
    });

    table.appendChild(thead);
    table.appendChild(tbody);

    containerDiv.appendChild(table);
}

function clearChangeFields() {
    document.getElementById("change-id-input").value = "";
    document.getElementById("change-title-input").value = "";
    document.getElementById("change-category-select").value = "";
    document.getElementById("change-cost-input").value = "";
}
