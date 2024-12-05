const categoryAddButton = document.getElementById("categories__add-button");
const categoryAddName = document.getElementById("categories__add-name");
const categoryAddParent = document.getElementById("categories__add-category");

const categoryUpdateButton = document.getElementById("categories__update-button");
const categoryUpdateId = document.getElementById("categories__update-id");
const categoryUpdateName = document.getElementById("categories__update-name");
const categoryUpdateParent = document.getElementById("categories__update-category");

const categoryDeleteId = document.getElementById("categories__delete-id");
const categoryDeleteButton = document.getElementById("categories__delete-button");

const categoryTable = document.querySelector(".table__category");

function initCategoryManager() {
    if (categoryAddButton) {
        categoryAddButton.addEventListener("click", handleAddCategory);
    }

    if (categoryUpdateButton) {
        categoryUpdateButton.addEventListener("click", handleUpdateCategory);
    }

    if (categoryDeleteButton) {
        categoryDeleteButton.addEventListener("click", handleDeleteCategory);
    }

    categoryUpdateId.addEventListener("input", trackUpdateId);

    refreshCategoryTable();
    refreshCategorySelects();
}

async function trackUpdateId() {
    const value = categoryUpdateId.value;

    if (value === '') {
        categoryUpdateName.value = '';
        categoryUpdateParent.value = '0';
        categoryUpdateButton.disabled = true;
        return;
    }

    try {
        const data = await findCategoryById(value);
        if (data) {
            categoryUpdateName.value = data.name || '';
            categoryUpdateParent.value = data.parent_id || '0';
            categoryUpdateButton.disabled = false;
            categoryUpdateButton.style.opacity = "1";
        } else {
            throw new Error('Категория не найдена');
        }
    } catch (error) {
        categoryUpdateName.value = 'НЕСУЩЕСТВУЮЩАЯ КАТЕГОРИЯ';
        categoryUpdateParent.value = '0';
        categoryUpdateButton.disabled = true;
        categoryUpdateButton.style.opacity = "0.7";
        console.error('Ошибка при получении категории:', error);
    }
}


async function handleAddCategory() {
    const name = categoryAddName.value.trim();
    const parentId = categoryAddParent.value;

    if (!name) {
        alert("Название категории не может быть пустым.");
        return;
    }

    const data = { name, parent_id: parentId || null };

    try {
        const response = await addCategory(data);
        if (response.ok) {
            resetAddForm();
            refreshCategoryTable();
            refreshCategorySelects();
        } else {
            throw new Error(`Ошибка: ${response.status}`);
        }
    } catch (error) {
        console.error("Ошибка при добавлении категории:", error);
        alert("Произошла ошибка. Попробуйте снова.");
    }
}

async function handleUpdateCategory() {
    const id = categoryUpdateId.value.trim();
    const name = categoryUpdateName.value.trim();
    const parentId = categoryUpdateParent.value;

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
        const response = await updateCategory(data);
        if (response.ok) {
            resetUpdateForm();
            refreshCategoryTable();
            refreshCategorySelects();
        } else {
            throw new Error(`Ошибка: ${response.status}`);
        }
    } catch (error) {
        console.error("Ошибка при обновлении категории:", error);
        alert("Произошла ошибка. Попробуйте снова.");
    }
}

async function handleDeleteCategory() {
    const id = categoryDeleteId.value.trim();

    if (!id) {
        alert("ID категории не может быть пустым.");
        return;
    }

    try {
        const response = await deleteCategory(id);
        if (response.ok) {
            resetDeleteForm();
            refreshCategoryTable();
            refreshCategorySelects();
        } else {
            throw new Error(`Ошибка: ${response.status}`);
        }
    } catch (error) {
        console.error("Ошибка при удалении категории:", error);
        alert("Произошла ошибка. Попробуйте снова.");
    }
}

async function addCategory(data) {
    const response = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });
    return response;
}

async function updateCategory(data) {
    const response = await fetch("/api/categories", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });
    return response;
}

async function deleteCategory(id) {
    const response = await fetch(`/api/categories/${id}`, {
        method: "DELETE",
    });
    return response;
}

async function findCategoryById(id) {
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

async function fetchCategories() {
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

export async function refreshCategoryTable() {
    const categories = await fetchCategories();
    generateCategoryTable(categories);
}

function generateCategoryTable(categories) {
    categoryTable.innerHTML = "";

    if (!Array.isArray(categories) || categories.length === 0) {
        categoryTable.textContent = "Категории не найдены.";
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
    tbody.appendChild(createCategoryRows(categories));
    table.appendChild(thead);
    table.appendChild(tbody);
    categoryTable.appendChild(table);
}

function createCategoryRows(categories, level = 0) {
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
            const subcategoryRows = createCategoryRows(category.subcategories, level + 1);
            fragment.appendChild(subcategoryRows);
        }
    });

    return fragment;
}

async function populateCategorySelect(selectElementId) {
    const selectElement = document.getElementById(selectElementId);
    if (!selectElement) {
        console.error(`Элемент с id "${selectElementId}" не найден.`);
        return;
    }

    selectElement.innerHTML = '<option value="0">Выберите родительскую категорию</option>';

    const categories = await fetchCategories();
    console.log('Из populate')
    const options = createCategoryOptions(categories);
    selectElement.appendChild(options);
}

function createCategoryOptions(categories, level = 0, uniqueCategories = new Set()) {
    const fragment = document.createDocumentFragment();

    categories.forEach(category => {
        if (!uniqueCategories.has(category.id)) {
            uniqueCategories.add(category.id);

            const option = document.createElement("option");
            option.value = category.id;
            option.textContent = `${"—".repeat(level)} ${category.name}`;
            fragment.appendChild(option);

            if (category.subcategories && category.subcategories.length > 0) {
                const subcategoryOptions = createCategoryOptions(category.subcategories, level + 1, uniqueCategories);
                fragment.appendChild(subcategoryOptions);
            }
        }
    });

    return fragment;
}

function refreshCategorySelects() {
    const categorySelectIds = [
        "products__add-category",
        "products__update-category",
        "categories__add-category",
        "categories__update-category",
        "warehouse__add-category",
        "warehouse__update-category"
    ];

    categorySelectIds.forEach(selectId => {
        populateCategorySelect(selectId);
    });
}

function resetAddForm() {
    categoryAddName.value = "";
    categoryAddParent.value = "";
}

function resetUpdateForm() {
    categoryUpdateId.value = "";
    categoryUpdateName.value = "";
    categoryUpdateParent.value = "";
}

function resetDeleteForm() {
    categoryDeleteId.value = "";
}

document.addEventListener("DOMContentLoaded", initCategoryManager);
