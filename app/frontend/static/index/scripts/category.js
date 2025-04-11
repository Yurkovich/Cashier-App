async function fetchCategories() {
    try {
        const response = await fetch('/api/categories/nested');
        if (!response.ok) {
            throw new Error(`Ошибка при загрузке категорий: ${response.status}`);
        }
        const categories = await response.json();
        if (!Array.isArray(categories)) {
            throw new Error('Неверный формат данных категорий');
        }
        return categories;
    } catch (error) {
        console.error('Ошибка при загрузке категорий:', error);
        const categoryList = document.querySelector('.category__list');
        if (categoryList) {
            categoryList.innerHTML = '<li class="category__item"><p>Ошибка при загрузке категорий</p></li>';
        }
        return [];
    }
}

let categoryHistory = [];
let currentCategories = [];
let currentPage = 0;

const menuTitleElement = document.querySelector('.menu__title');

function getAllCategoryIds(category) {
    let ids = [category.id];
    if (category.subcategories && category.subcategories.length > 0) {
        category.subcategories.forEach((subcategory) => {
            ids = ids.concat(getAllCategoryIds(subcategory));
        });
    }
    return ids;
}

function createCategoryList(categories, parentElement) {
    const itemsPerPage = categoryHistory.length > 0 ? 8 : 9;
    const totalPages = Math.ceil(categories.length / itemsPerPage);
    const startIndex = currentPage * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pageCategories = categories.slice(startIndex, endIndex);

    parentElement.innerHTML = '';

    if (categoryHistory.length === 0) {
        menuTitleElement.textContent = 'Все товары';
    } else {
        const currentCategoryName = categoryHistory[categoryHistory.length - 1]?.categories?.[0]?.name || 'Все товары';
        menuTitleElement.textContent = currentCategoryName;
    }

    if (categoryHistory.length > 0 || currentPage > 0) {
        const backButton = document.createElement('button');
        backButton.className = 'category__back-button';
        backButton.textContent = 'Назад';

        const previousState = categoryHistory[categoryHistory.length - 1];
        if (previousState && previousState.dataCategory) {
            backButton.dataset.category = previousState.dataCategory;
        }

        backButton.addEventListener('click', () => {
            if (currentPage > 0) {
                currentPage--;
                createCategoryList(categories, parentElement);
            } else {
                const previousState = categoryHistory.pop();
                currentPage = previousState?.currentPage || 0;
                createCategoryList(previousState?.categories || currentCategories, parentElement);

                if (categoryHistory.length === 1) {
                    const categoryIds = JSON.parse(categoryHistory[0].dataCategory);
                    const filteredProducts = filterProductsByCategories(allProducts, categoryIds);
                    generateProductList(filteredProducts);
                } else if (categoryHistory.length === 0) {
                    generateProductList(allProducts);
                }

                menuTitleElement.textContent = categoryHistory.length > 0
                    ? categoryHistory[categoryHistory.length - 1]?.categories?.[0]?.name || 'Все товары'
                    : 'Все товары';
            }
        });

        const backItem = document.createElement('li');
        backItem.className = 'category__item';
        backItem.appendChild(backButton);
        parentElement.appendChild(backItem);
    }

    pageCategories.forEach((category) => {
        const li = document.createElement('li');
        li.className = 'category__item';

        const button = document.createElement('button');
        button.className = 'category__button';
        button.textContent = category.name;

        const relatedCategoryIds = getAllCategoryIds(category);
        button.dataset.category = JSON.stringify(relatedCategoryIds);

        button.addEventListener('click', () => {
            if (category.subcategories && category.subcategories.length > 0) {
                categoryHistory.push({
                    categories: categories,
                    currentPage: currentPage,
                    dataCategory: button.dataset.category
                });
                currentPage = 0;
                createCategoryList(category.subcategories, parentElement);

                menuTitleElement.textContent = category.name;
            }
        });

        li.appendChild(button);
        parentElement.appendChild(li);
    });

    if (currentPage < totalPages - 1) {
        const nextButton = document.createElement('button');
        nextButton.className = 'category__next-button';
        nextButton.textContent = 'Дальше';

        nextButton.addEventListener('click', () => {
            currentPage++;
            createCategoryList(categories, parentElement);
        });

        const nextItem = document.createElement('li');
        nextItem.className = 'category__item';
        nextItem.appendChild(nextButton);
        parentElement.appendChild(nextItem);
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    const categoryList = document.querySelector('.category__list');
    currentCategories = await fetchCategories();
    createCategoryList(currentCategories, categoryList);

    if (menuTitleElement) {
        menuTitleElement.textContent = 'Все товары';
    }
});
