
class OrderManager {
    constructor(totalCostElementSelector, orderListSelector) {
        this.orderData = {};
        this.totalCostElement = document.querySelector(totalCostElementSelector);
        this.footerPaymentAmountElement = document.querySelector('.footer__payment-amount');
        this.calculatorTotalCostElement = document.querySelector('.calculator__total-cost');
        this.orderList = document.querySelector(orderListSelector);
        this.isEditing = false;
        this.editButton = document.querySelector('.header__edit');
        this.checkScrollability();
    }

    updateTotalCost() {
        const totalCost = Object.values(this.orderData).reduce((sum, item) => sum + item.totalCost, 0);

        this.totalCostElement.textContent = `${totalCost} ₽`;
        if (this.footerPaymentAmountElement) {
            this.footerPaymentAmountElement.textContent = `${totalCost} ₽`;
        }
        if (this.calculatorTotalCostElement) {
            this.calculatorTotalCostElement.textContent = `${totalCost} ₽`;
        }
    }

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

    removeOrderItem(li, productName) {
        delete this.orderData[productName];
        li.remove();

        this.checkScrollability();
        this.updateTotalCost();
    }

    updateOrderItem(li, quantity, totalCost) {
        const quantityElement = li.querySelector('.order__item-amount');
        const priceElement = li.querySelector('.order__item-price');

        if (quantityElement && priceElement) {
            quantityElement.textContent = quantity;
            priceElement.textContent = `${totalCost} ₽`;
        } else {
            console.error('One of the required elements (.order__item-amount or .order__item-price) is missing.');
        }
    }

    checkScrollability() {
        const items = this.orderList.querySelectorAll('.order__item');
        if (items.length > 9) {
            this.orderList.classList.add('scrollable');
        } else {
            this.orderList.classList.remove('scrollable');
        }
    }

    enableSwipeToRemove() {
        this.swipeHandlers = [];

        Array.from(this.orderList.children).forEach((item) => {
            let startX = 0;
            let currentX = 0;

            const handleMouseDown = (e) => {
                startX = e.clientX;
                item.style.transition = 'none';
            };

            const handleMouseMove = (e) => {
                if (startX !== 0) {
                    currentX = e.clientX;
                    const deltaX = currentX - startX;
                    item.style.transform = `translateX(${deltaX}px)`;
                }
            };

            const handleMouseUp = () => {
                if (startX !== 0) {
                    const productName = item.querySelector('.order__item-name')?.textContent.trim();
                    const threshold = 100;
                    const deltaX = currentX - startX;

                    if (Math.abs(deltaX) > threshold && productName) {
                        this.removeOrderItem(item, productName);
                    } else {
                        item.style.transform = 'translateX(0)';
                    }

                    item.style.transition = 'transform 0.3s ease';
                    startX = 0;
                }
            };

            const handleMouseLeave = () => {
                if (startX !== 0) {
                    item.style.transform = 'translateX(0)';
                    item.style.transition = 'transform 0.3s ease';
                    startX = 0;
                }
            };

            item.addEventListener('mousedown', handleMouseDown);
            item.addEventListener('mousemove', handleMouseMove);
            item.addEventListener('mouseup', handleMouseUp);
            item.addEventListener('mouseleave', handleMouseLeave);

            this.swipeHandlers.push({
                item,
                handleMouseDown,
                handleMouseMove,
                handleMouseUp,
                handleMouseLeave,
            });
        });
    }

    disableSwipeToRemove() {
        if (this.swipeHandlers) {
            this.swipeHandlers.forEach(({ item, handleMouseDown, handleMouseMove, handleMouseUp, handleMouseLeave }) => {
                item.removeEventListener('mousedown', handleMouseDown);
                item.removeEventListener('mousemove', handleMouseMove);
                item.removeEventListener('mouseup', handleMouseUp);
                item.removeEventListener('mouseleave', handleMouseLeave);

                item.style.transition = '';
                item.style.transform = '';
            });

            this.swipeHandlers = [];
        }
    }

    toggleEditMode() {
        this.isEditing = !this.isEditing;

        if (this.isEditing) {
            this.editButton.classList.add('is-active');
            this.enableSwipeToRemove();
        } else {
            this.editButton.classList.remove('is-active');
            this.disableSwipeToRemove();
        }
    }

    init() {
        document.addEventListener('click', (event) => {
            // Проверяем, является ли целевой элемент или его родитель кнопкой пагинации
            const isPaginationButton = event.target.closest('.order__prev, .order__next');
            if (isPaginationButton) {
                return; // Прекращаем выполнение обработчика для кнопок пагинации
            }
    
            const button = event.target.closest('.menu__button');
            if (button) {
                const productName = button.querySelector('#product')?.textContent.trim();
                const priceElement = button.querySelector('#price');
                const priceText = priceElement?.textContent?.trim();
                if (!priceText) {
                    console.error('Цена не найдена для товара:', productName);
                    return;
                }
                const price = parseInt(priceText.replace(' ₽', ''), 10);
                if (isNaN(price)) {
                    console.error('Некорректная цена:', priceText);
                    return;
                }
                if (productName && price) {
                    if (this.orderData[productName]) {
                        this.orderData[productName].quantity += 1;
                        this.orderData[productName].totalCost = this.orderData[productName].quantity * price;
                        const existingItem = Array.from(this.orderList.children).find(
                            (item) => item.querySelector('.order__item-name')?.textContent === productName
                        );
                        if (existingItem) {
                            this.updateOrderItem(existingItem, this.orderData[productName].quantity, this.orderData[productName].totalCost);
                        }
                    } else {
                        this.orderData[productName] = {
                            quantity: 1,
                            price: price,
                            totalCost: price,
                        };
                        const newOrderItem = this.createOrderItem(productName, 1, price);
                        this.orderList.prepend(newOrderItem);
                        this.checkScrollability();
                    }
                    this.updateTotalCost();
                }
            }
        });
        this.editButton.addEventListener('click', () => this.toggleEditMode());
    }

    clearOrderData() {
        this.orderData = {};
        this.orderList.innerHTML = '';
        this.updateTotalCost();
    }

    populateOrderData(order) {
        this.clearOrderData();

        order.items.forEach((item) => {
            this.orderData[item.name] = {
                quantity: item.quantity,
                price: item.price,
                totalCost: item.quantity * item.price,
            };

            const li = this.createOrderItem(item.name, item.quantity, item.price);
            this.orderList.appendChild(li);
        });

        this.checkScrollability();
        this.updateTotalCost();
    }
}

class OrderPaginationManager {
    constructor(totalCostElementSelector, orderListSelector) {
        this.orderManager = new OrderManager(totalCostElementSelector, orderListSelector);
        this.orders = JSON.parse(localStorage.getItem('orders')) || [];
        this.currentOrderIndex = -1;
        this.initPagination();
        this.initSaveButton();
        this.initDeleteOrder();
        this.orderManager.init();
    }

    collectOrderData() {
        const items = Object.entries(this.orderManager.orderData).map(([name, data]) => ({
            name,
            quantity: data.quantity,
            price: data.price,
        }));

        const totalCost = Object.values(this.orderManager.orderData).reduce((sum, item) => sum + item.totalCost, 0);

        return {
            items,
            totalCost,
        };
    }

    saveOrder() {
        const { items, totalCost } = this.collectOrderData();

        const maxId = this.orders.reduce((max, order) => Math.max(max, order.id), 0);
        const orderId = maxId + 1;

        if (this.currentOrderIndex === -1 || this.currentOrderIndex >= this.orders.length) {
            const newOrder = {
                id: orderId,
                items,
                totalCost,
            };

            this.orders.push(newOrder);
            this.currentOrderIndex = this.orders.length - 1;
        } else {
            this.orders[this.currentOrderIndex] = {
                id: this.orders[this.currentOrderIndex].id,
                items,
                totalCost,
            };
        }

        localStorage.setItem('orders', JSON.stringify(this.orders));
        this.updateOrderHeader();
        alert('Заказ успешно сохранен!');
    }

    loadOrder(index) {
        if (index >= 0 && index < this.orders.length) {
            this.currentOrderIndex = index;
            const order = this.orders[index];
            this.orderManager.populateOrderData(order);
            this.updateOrderHeader();
        } else {
            this.orderManager.clearOrderData();
            this.currentOrderIndex = -1;
            this.updateOrderHeader();
        }
    }

    updateOrderHeader() {
        const orderNumberElement = document.querySelector('.order__cur');
        if (orderNumberElement) {
            orderNumberElement.textContent = `Заказ №${this.orders[this.currentOrderIndex]?.id || ''}`;
        }
    }

    initPagination() {
        const prevButton = document.querySelector('.order__prev');
        const nextButton = document.querySelector('.order__next');

        if (prevButton) {
            prevButton.addEventListener('click', () => {
                if (this.currentOrderIndex > 0) {
                    this.loadOrder(this.currentOrderIndex - 1);
                } else {
                    alert('Это первый заказ.');
                }
            });
        }

        if (nextButton) {
            nextButton.addEventListener('click', () => {
                if (this.currentOrderIndex < this.orders.length - 1) {
                    this.loadOrder(this.currentOrderIndex + 1);
                } else {
                    this.orderManager.clearOrderData();
                    this.currentOrderIndex = this.orders.length;
                    this.updateOrderHeader();
                }
            });
        }
    }

    deleteCurrentOrder() {
        if (this.currentOrderIndex === -1 || this.currentOrderIndex >= this.orders.length) {
            alert('Нет выбранного заказа для удаления.');
            return;
        }

        const confirmDelete = confirm('Вы уверены, что хотите удалить этот заказ?');
        if (confirmDelete) {
            this.orders.splice(this.currentOrderIndex, 1);
            localStorage.setItem('orders', JSON.stringify(this.orders));

            if (this.orders.length === 0) {
                this.currentOrderIndex = -1;
                this.orderManager.clearOrderData();
                this.updateOrderHeader();
            } else if (this.currentOrderIndex >= this.orders.length) {
                this.currentOrderIndex = this.orders.length - 1;
                this.loadOrder(this.currentOrderIndex);
            } else {
                this.loadOrder(this.currentOrderIndex);
            }

            alert('Заказ успешно удален!');
        }
    }

    initSaveButton() {
        const saveButton = document.querySelector('.footer__save');
        if (saveButton) {
            saveButton.addEventListener('click', () => this.saveOrder());
        }
    }

    initDeleteOrder() {
        const currentOrderButton = document.querySelector('.order__cur');
        if (currentOrderButton) {
            currentOrderButton.addEventListener('click', () => this.deleteCurrentOrder());
        }
    }
}

const orderPaginationManager = new OrderPaginationManager('#total-cost', '.order__list');
