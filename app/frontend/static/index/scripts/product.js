
let allProducts = [];
let pageNumber = 1;
const productsPerPage = 14;

async function fetchProducts() {
    try {
        const response = await fetch('/api/all_products');
        if (!response.ok) {
            throw new Error('Ошибка при загрузке товаров');
        }
        const products = await response.json();
        return products;
    } catch (error) {
        console.error(error);
        return [];
    }
}

function generateProductList(products) {
    const menuList = document.querySelector('.menu__list');
    
    menuList.innerHTML = '';

    if (pageNumber > 1) {
        const backButtonItem = document.createElement('li');
        backButtonItem.className = 'menu__item';

        const backButton = document.createElement('button');
        backButton.className = 'menu__button menu__back-button';
        backButton.textContent = 'Назад';

        backButtonItem.appendChild(backButton);
        menuList.appendChild(backButtonItem);

        backButton.addEventListener('click', () => {
            pageNumber = 1;
            generateProductList(allProducts);
        });
    }

    const startIndex = (pageNumber - 1) * productsPerPage;
    const endIndex = startIndex + productsPerPage;
    const currentProducts = products.slice(startIndex, endIndex);

    currentProducts.forEach(product => {
        const li = document.createElement('li');
        li.className = 'menu__item';

        const button = document.createElement('button');
        button.className = 'menu__button';

        const productName = document.createElement('p');
        productName.id = 'product';
        productName.textContent = product.name;

        const productPrice = document.createElement('span');
        productPrice.id = 'price';
        productPrice.textContent = `${product.cost} ₽`;

        button.appendChild(productName);
        button.appendChild(productPrice);

        li.appendChild(button);

        menuList.appendChild(li);
    });

    const totalPages = Math.ceil(products.length / productsPerPage);

    if (pageNumber < totalPages) {
        const nextButtonItem = document.createElement('li');
        nextButtonItem.className = 'menu__item';

        const nextButton = document.createElement('button');
        nextButton.className = 'menu__button menu__next-button';
        nextButton.textContent = 'Дальше';

        nextButtonItem.appendChild(nextButton);
        menuList.appendChild(nextButtonItem);

        nextButton.addEventListener('click', () => {
            pageNumber++;
            generateProductList(allProducts);
        });
    }
}

function filterProductsByCategories(products, categoryIds) {
    return products.filter(product => categoryIds.includes(product.category_id));
}

document.addEventListener('DOMContentLoaded', async () => {
    allProducts = await fetchProducts();
    generateProductList(allProducts);

    const categoryList = document.querySelector('.category__list');
    categoryList.addEventListener('click', (event) => {
        const button = event.target.closest('.category__button');
        if (!button) return;
    
        pageNumber = 1;

        if (button.textContent.trim() === 'Назад') {
            if (categoryHistory.length === 0) {
                generateProductList(allProducts);
            }
            return;
        }
    
        const categoryIds = JSON.parse(button.dataset.category);
        const filteredProducts = filterProductsByCategories(allProducts, categoryIds);
        generateProductList(filteredProducts);
    });
});
