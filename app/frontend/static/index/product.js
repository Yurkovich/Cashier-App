
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

let allProducts = [];

function generateProductList(products) {
    const menuList = document.querySelector('.menu__list');

    menuList.innerHTML = '';

    products.forEach(product => {
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