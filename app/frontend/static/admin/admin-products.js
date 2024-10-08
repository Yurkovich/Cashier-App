document.addEventListener("DOMContentLoaded", () => {
    initProduct();
});


function initProduct() {
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
        .getElementById("delete-product-button")
        .addEventListener("click", deleteProduct);

    document
        .querySelector(".product-page")
        .addEventListener("click", async () => {
            const products = await fetchProducts();
            generateProductTable(products);
        });
}


async function deleteProduct() {
    let productId = document.getElementById("delete-id-input").value;

    if (!productId) {
        alert("Введите ID товара для удаления.");
        return;
    }

    const confirmed = confirm(`Вы уверены, что хотите удалить товар с ID: ${productId}?`);
    if (!confirmed) {
        return;
    }

    try {
        const response = await fetch(`/api/products/${productId}`, {
            method: "DELETE",
        });

        if (response.status === 204) {
            refreshProductTable();
            document.getElementById("delete-id-input").value = '';
        } else if (response.status === 404) {
            alert("Товар с таким ID не найден.");
        } else {
            throw new Error(`Ошибка: ${response.statusText}`);
        }
    } catch (error) {
        console.error("Ошибка при удалении товара:", error);
    }
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
        await refreshProductTable();
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

        if (!Array.isArray(data)) {
            throw new Error("Неверный формат данных категорий");
        }

        [addSelector, changeSelector].forEach((selector) => {
            selector.innerHTML = "";
            const defaultOption = document.createElement("option");
            defaultOption.text = "Выберите категорию";
            defaultOption.value = "";
            selector.appendChild(defaultOption);
        });

        data.forEach((category) => {
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

        clearChangeFields();
    } catch (error) {
        console.error("Ошибка при обновлении товара:", error);
    }
}


async function addProduct() {
    const getCategory = document.getElementById("add-category-select").value;
    const getTitle = document.getElementById("add-title-input").value;
    const getCost = document.getElementById("add-cost-input").value;

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
    const showTable = (document.querySelector(".product-container").style.display = "grid");
    try {
        const [productsResponse, categoriesResponse] = await Promise.all([
            fetch("/api/all_products"),
            fetch("/api/categories")
        ]);

        if (!productsResponse.ok || !categoriesResponse.ok) {
            throw new Error(`Ошибка HTTP: ${productsResponse.status} или ${categoriesResponse.status}`);
        }

        const products = await productsResponse.json();
        const categories = await categoriesResponse.json();

        const categoryMap = {};
        categories.forEach(category => {
            categoryMap[category.id] = category.name;
        });

        products.forEach(product => {
            product.category = categoryMap[product.category_id];
        });

        return products;

    } catch (error) {
        console.error("Ошибка при получении продуктов или категорий:", error);
        return [];
    }
}



async function refreshProductTable() {
    const products = await fetchProducts();
    generateProductTable(products);
}


let sortOrder = {
    id: 'asc',
    name: 'asc',
    category: 'asc',
    cost: 'asc',
};


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

    const headers = [
        { key: "id", text: "ID" },
        { key: "name", text: "Название" },
        { key: "category", text: "Категория" },
        { key: "cost", text: "Цена" },
    ];

    headers.forEach(({ key, text }) => {
        const th = document.createElement("th");
        
        const headerContent = document.createElement("span");
        headerContent.textContent = text;

        const arrow = document.createElement("span");
        arrow.className = "sort-arrow";
        arrow.textContent = sortOrder[key] === 'asc' ? ' ▲' : ' ▼';

        th.appendChild(headerContent);
        th.appendChild(arrow);

        th.style.cursor = "pointer";

        th.addEventListener("click", () => {
            sortProducts(products, key);
            generateProductTable(products);
        });

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
        categoryCell.textContent = product.category;
        row.appendChild(categoryCell);

        const costCell = document.createElement("td");
        costCell.textContent = product.cost + " ₽";
        row.appendChild(costCell);

        tbody.appendChild(row);
    });

    table.appendChild(thead);
    table.appendChild(tbody);

    containerDiv.appendChild(table);
}


function sortProducts(products, field) {
    const order = sortOrder[field];

    products.sort((a, b) => {
        if (order === 'asc') {
            return a[field] > b[field] ? 1 : -1;
        } else {
            return a[field] < b[field] ? 1 : -1;
        }
    });

    sortOrder[field] = order === 'asc' ? 'desc' : 'asc';
}
