class OrderManager {
    constructor(totalCostElementSelector, orderListSelector) {
        this.orderData = {};
        this.totalCostElement = document.querySelector(totalCostElementSelector);
        this.orderList = document.querySelector(orderListSelector);
        this.isEditing = false; // Флаг режима редактирования
        this.editButton = document.querySelector('.header__edit'); // Кнопка редактирования
    }

    // Обновление общей стоимости заказа
    updateTotalCost() {
        const totalCost = Object.values(this.orderData).reduce((sum, item) => sum + item.totalCost, 0);
        this.totalCostElement.textContent = `${totalCost} ₽`;
    }

    // Создание элемента заказа
    createOrderItem(productName, quantity, price) {
        const li = document.createElement('li');
        li.className = 'order__item';
        li.innerHTML = `
            <p class="order__item-name">${productName}</p>
            <p class="order__item-amount">${quantity}</p>
            <p class="order__item-price">${price} ₽</p>
        `;
        return li;
    }

    // Удаление элемента заказа
    removeOrderItem(li, productName) {
        delete this.orderData[productName]; // Удаляем данные из объекта
        li.remove(); // Удаляем элемент из DOM
        this.updateTotalCost(); // Пересчитываем общую стоимость
    }

    updateOrderItem(li, quantity, totalCost) {
        const quantityElement = li.querySelector('.order__item-amount');
        const priceElement = li.querySelector('.order__item-price');

        quantityElement.textContent = quantity;
        priceElement.textContent = `${totalCost} ₽`;
    }

    // Добавление функциональности смахивания
    enableSwipeToRemove() {
        Array.from(this.orderList.children).forEach((item) => {
            let startX = 0;
            let currentX = 0;

            item.addEventListener('mousedown', (e) => {
                startX = e.clientX; // Начальная позиция курсора
                item.style.transition = 'none'; // Отключаем анимацию для плавного движения
            });

            item.addEventListener('mousemove', (e) => {
                if (startX !== 0) {
                    currentX = e.clientX;
                    const deltaX = currentX - startX; // Разница между текущей и начальной позицией
                    item.style.transform = `translateX(${deltaX}px)`; // Перемещаем элемент
                }
            });

            item.addEventListener('mouseup', () => {
                if (startX !== 0) {
                    const productName = item.querySelector('.order__item-name').textContent.trim();
                    const threshold = 100; // Пороговое значение для удаления (в пикселях)
                    const deltaX = currentX - startX;

                    if (Math.abs(deltaX) > threshold) {
                        // Если смещение больше порогового значения, удаляем элемент
                        this.removeOrderItem(item, productName);
                    } else {
                        // Иначе возвращаем элемент на место
                        item.style.transform = 'translateX(0)';
                    }

                    item.style.transition = 'transform 0.3s ease'; // Включаем анимацию
                    startX = 0; // Сбрасываем начальную позицию
                }
            });

            item.addEventListener('mouseleave', () => {
                if (startX !== 0) {
                    item.style.transform = 'translateX(0)';
                    item.style.transition = 'transform 0.3s ease';
                    startX = 0;
                }
            });
        });
    }

    // Переключение режима редактирования
    toggleEditMode() {
        this.isEditing = !this.isEditing;

        if (this.isEditing) {
            this.editButton.classList.add('is-active'); // Добавляем класс is-active
            this.enableSwipeToRemove(); // Включаем функциональность смахивания
        } else {
            this.editButton.classList.remove('is-active'); // Удаляем класс is-active
        }
    }

    // Инициализация обработчиков событий
    init() {
        // Обработка кликов по кнопкам добавления товаров
        document.addEventListener('click', (event) => {
            const button = event.target.closest('.menu__button');
            if (button) {
                const productName = button.querySelector('#product').textContent.trim();
                const priceText = button.querySelector('#price').textContent.trim();
                const price = parseInt(priceText.replace(' ₽', ''), 10);

                if (this.orderData[productName]) {
                    this.orderData[productName].quantity += 1;
                    this.orderData[productName].totalCost = this.orderData[productName].quantity * price;

                    const existingItem = Array.from(this.orderList.children).find(
                        (item) => item.querySelector('.order__item-name').textContent === productName
                    );

                    this.updateOrderItem(existingItem, this.orderData[productName].quantity, this.orderData[productName].totalCost);
                } else {
                    this.orderData[productName] = {
                        quantity: 1,
                        price: price,
                        totalCost: price,
                    };

                    const newOrderItem = this.createOrderItem(productName, 1, price);
                    this.orderList.prepend(newOrderItem);
                }

                this.updateTotalCost();
            }
        });

        // Обработка клика по кнопке "Редактировать"
        this.editButton.addEventListener('click', () => this.toggleEditMode());
    }
}

// Инициализация менеджера заказов
const orderManager = new OrderManager('#total-cost', '.order__list');
orderManager.init();