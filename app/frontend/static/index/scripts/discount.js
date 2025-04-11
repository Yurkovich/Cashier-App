const modal = document.querySelector('.discount-code__modal');
const openButton = document.querySelector('.footer__discount');

function openModal(event) {
    event.preventDefault();
    modal.classList.add('modal--show');
    document.body.classList.add('body--opened-modal');
    discountCodeManager.loadDiscountCodes();

    document.addEventListener('keydown', handleKeyDown);
    modal.addEventListener('click', handleClickOutside);
}

function closeModal() {
    modal.classList.remove('modal--show');
    document.body.classList.remove('body--opened-modal');
    document.removeEventListener('keydown', handleKeyDown);
    modal.removeEventListener('click', handleClickOutside);
}

function handleKeyDown(event) {
    if (event.key === 'Escape') {
        closeModal();
    }
}

function handleClickOutside(event) {
    const modalWindow = modal.querySelector('.discount-code__window');
    if (!modalWindow.contains(event.target)) {
        closeModal();
    }
}

openButton.addEventListener('click', openModal);


class DiscountCodeManager {
    constructor() {
        this.discountModal = document.querySelector('.discount-code__modal');
        this.discountButtonsContainer = document.querySelector('.discount-code__buttons');
        this.applyButton = document.querySelector('.discount-code__apply');
        this.removeButton = document.querySelector('.discount-code__remove');
        this.discountCodes = [];
        this.selectedDiscount = null;
        this.init();
    }

    async loadDiscountCodes() {
        try {
            const response = await fetch('/api/discount-specials');
            if (!response.ok) {
                throw new Error(`Ошибка при загрузке скидок: ${response.status}`);
            }
            this.discountCodes = await response.json();
            this.renderDiscountButtons();
        } catch (error) {
            console.error('Ошибка при загрузке скидок:', error);
        }
    }

    renderDiscountButtons() {
        if (!this.discountButtonsContainer) {
            console.error('Discount buttons container not found!');
            return;
        }

        this.discountButtonsContainer.innerHTML = '';
        
        if (this.discountCodes.length === 0) {
            return;
        }

        this.discountCodes.forEach(discount => {
            const button = document.createElement('button');
            button.className = 'discount-code__button';
            button.textContent = `${discount.name} (${discount.percent}%)`;
            button.dataset.discountId = discount.id;
            button.dataset.percent = discount.percent;

            button.addEventListener('click', () => {
                this.selectDiscount(discount);
            });

            this.discountButtonsContainer.appendChild(button);
        });
    }

    selectDiscount(discount) {
        this.selectedDiscount = discount;
        const buttons = this.discountButtonsContainer.querySelectorAll('.discount-code__button');
        buttons.forEach(button => {
            button.classList.remove('is-active');
            if (button.dataset.discountId === discount.id.toString()) {
                button.classList.add('is-active');
            }
        });
    }

    openModal() {
        if (this.discountModal) {
            this.discountModal.classList.add('is-active');
            this.loadDiscountCodes();
        }
    }

    closeModal() {
        if (this.discountModal) {
            this.discountModal.classList.remove('is-active');
            this.selectedDiscount = null;
            const buttons = this.discountButtonsContainer.querySelectorAll('.discount-code__button');
            buttons.forEach(button => button.classList.remove('is-active'));
        }
    }

    applyDiscount() {
        if (this.selectedDiscount && window.orderPaginationManager) {
            window.orderPaginationManager.orderManager.applyDiscount(this.selectedDiscount.percent);
            this.closeModal();
        }
    }

    removeDiscount() {
        if (window.orderPaginationManager) {
            window.orderPaginationManager.orderManager.applyDiscount(0);
        }
    }

    init() {
        if (this.applyButton) {
            this.applyButton.addEventListener('click', () => this.applyDiscount());
        }

        if (this.removeButton) {
            this.removeButton.addEventListener('click', () => this.removeDiscount());
        }

        document.addEventListener('click', (event) => {
            if (this.discountModal && 
                !this.discountModal.contains(event.target) && 
                !event.target.closest('.footer__discount')) {
                this.closeModal();
            }
        });
    }
}

const discountCodeManager = new DiscountCodeManager();
