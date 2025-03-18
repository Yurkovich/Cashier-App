class OrderManager {
    constructor(totalCostElementSelector, orderListSelector) {
        this.orderData = {};
        this.totalCostElement = document.querySelector(totalCostElementSelector);
        this.orderList = document.querySelector(orderListSelector);
        this.isEditing = false;
        this.editButton = document.querySelector('.header__edit');
        this.checkScrollability();
    }

    updateTotalCost() {
        const totalCost = Object.values(this.orderData).reduce((sum, item) => sum + item.totalCost, 0);
        this.totalCostElement.textContent = `${totalCost} ₽`;
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

        quantityElement.textContent = quantity;
        priceElement.textContent = `${totalCost} ₽`;
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
                    const productName = item.querySelector('.order__item-name').textContent.trim();
                    const threshold = 100;
                    const deltaX = currentX - startX;

                    if (Math.abs(deltaX) > threshold) {
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

                    this.checkScrollability();
                }

                this.updateTotalCost();
            }
        });

        this.editButton.addEventListener('click', () => this.toggleEditMode());
    }
}

const orderManager = new OrderManager('#total-cost', '.order__list');
orderManager.init();