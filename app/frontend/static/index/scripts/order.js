class OrderManager {
    constructor(totalCostElementSelector, orderListSelector) {
        this.orderData = {};
        this.totalCostElement = document.querySelector(totalCostElementSelector);
        this.footerPaymentAmountElement = document.querySelector('.footer__payment-amount');
        this.calculatorTotalCostElement = document.querySelector('.calculator__total-cost');
        this.orderList = document.querySelector(orderListSelector);
        this.isEditing = false;
        this.editButton = document.querySelector('.header__edit');
        this.discount = 0;
        this.checkScrollability();
        this.discountButtonsContainer = document.querySelector('.discount-code__buttons');
    }

    updateTotalCost() {
        const subtotal = Object.values(this.orderData).reduce((sum, item) => sum + item.totalCost, 0);
        const discountAmount = (subtotal * this.discount) / 100;
        const totalCost = subtotal - discountAmount;

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
            <p class="order__item-price">${quantity * price} ₽</p>
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
            const isPaginationButton = event.target.closest('.order__prev, .order__next');
            if (isPaginationButton) {
                return;
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
        this.discount = 0;
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

    applyDiscount(discountPercent) {
        this.discount = discountPercent;
        this.updateTotalCost();
    }
}

class OrderPaginationManager {
    constructor(totalCostElementSelector, orderListSelector) {
        this.orderManager = new OrderManager(totalCostElementSelector, orderListSelector);
        this.orders = [];
        this.currentOrderIndex = -1;
        this.initPagination();
        this.initSaveButton();
        this.initDeleteOrder();
        this.orderManager.init();
        this.loadOrdersFromServer();
    }

    async loadOrdersFromServer() {
        try {
            const response = await fetch('/api/orders');
            if (!response.ok) {
                throw new Error(`Ошибка при загрузке заказов: ${response.status}`);
            }
            const orders = await response.json();
            this.orders = orders;
            
            if (this.orders.length > 0) {
                this.loadOrder(this.orders.length - 1);
            } else {
                this.orderManager.clearOrderData();
                this.currentOrderIndex = -1;
                this.updateOrderHeader();
            }
        } catch (error) {
            console.error('Ошибка при загрузке заказов:', error);
        }
    }

    async getProductIdByName(productName) {
        try {
            const response = await fetch('/api/products');
            if (!response.ok) {
                throw new Error(`Ошибка при загрузке продуктов: ${response.status}`);
            }
            const products = await response.json();
            const product = products.find(p => p.name === productName);
            return product ? product.id : null;
        } catch (error) {
            console.error('Ошибка при поиске продукта:', error);
            return null;
        }
    }

    collectOrderData() {
        const items = Object.entries(this.orderManager.orderData).map(([name, data]) => ({
            name,
            quantity: data.quantity,
            price: data.price,
        }));

        const subtotal = Object.values(this.orderManager.orderData).reduce((sum, item) => sum + item.totalCost, 0);
        const discountAmount = (subtotal * this.orderManager.discount) / 100;
        const totalCost = subtotal - discountAmount;

        return {
            items,
            totalCost,
            discount: this.orderManager.discount,
        };
    }

    async saveOrder() {
        const { items, totalCost, discount } = this.collectOrderData();

        const orderItems = await Promise.all(items.map(async (item) => {
            const productId = await this.getProductIdByName(item.name);
            return {
                product_id: productId,
                quantity: item.quantity,
                price: item.price,
            };
        }));

        const orderData = {
            total_cost: totalCost,
            discount: discount,
            items: orderItems,
        };

        try {
            const isEditing = this.currentOrderIndex !== -1 && 
                            this.orders.length > 0 && 
                            this.orders[this.currentOrderIndex]?.id;
            
            const orderId = isEditing ? this.orders[this.currentOrderIndex].id : null;
            
            const response = await fetch(isEditing ? `/api/orders/${orderId}` : '/api/orders', {
                method: isEditing ? 'PUT' : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(orderData),
            });

            if (!response.ok) {
                throw new Error(`Ошибка при сохранении заказа: ${response.status}`);
            }

            const savedOrder = await response.json();
            alert('Заказ успешно сохранен!');
            
            await this.loadOrdersFromServer();
            
            const savedOrderIndex = this.orders.findIndex(order => order.id === savedOrder.id);
            
            if (savedOrderIndex !== -1) {
                this.loadOrder(savedOrderIndex);
            } else {
                this.orderManager.clearOrderData();
                this.currentOrderIndex = -1;
                this.updateOrderHeader();
            }
        } catch (error) {
            console.error('Ошибка при сохранении заказа:', error);
            alert('Ошибка при сохранении заказа: ' + error.message);
        }
    }

    loadOrder(index) {
        if (index >= 0 && index < this.orders.length) {
            this.currentOrderIndex = index;
            const order = this.orders[index];
            
            const formattedOrder = {
                items: order.items.map(item => ({
                    name: item.product_name,
                    quantity: item.quantity,
                    price: item.price,
                })),
            };
            
            this.orderManager.populateOrderData(formattedOrder);
            this.orderManager.discount = order.discount || 0;
            this.orderManager.updateTotalCost();
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

    async deleteCurrentOrder() {
        if (this.currentOrderIndex === -1 || this.currentOrderIndex >= this.orders.length) {
            alert('Нет выбранного заказа для удаления.');
            return;
        }

        const confirmDelete = confirm('Вы уверены, что хотите удалить этот заказ?');
        if (confirmDelete) {
            const orderId = this.orders[this.currentOrderIndex].id;
            
            try {
                const response = await fetch(`/api/orders/${orderId}`, {
                    method: 'DELETE',
                });

                if (!response.ok) {
                    throw new Error(`Ошибка при удалении заказа: ${response.status}`);
                }

                await this.loadOrdersFromServer();
                
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
            } catch (error) {
                console.error('Ошибка при удалении заказа:', error);
                alert('Ошибка при удалении заказа: ' + error.message);
            }
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

window.orderPaginationManager = orderPaginationManager;
