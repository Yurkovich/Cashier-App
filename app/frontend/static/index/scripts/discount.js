
const modal = document.querySelector('.discount-code__modal');
const openButton = document.querySelector('.footer__discount');

function openModal(event) {
    event.preventDefault();
    modal.classList.add('modal--show');
    document.body.classList.add('body--opened-modal');

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
        this.discountCodeBody = document.querySelector(".discount-code__body");
        this.init();
    }

    init() {
        if (this.discountCodeBody) {
            this.loadDiscountCodes();
        } else {
            console.error("Контейнер .discount-code__body не найден");
        }
    }

    async loadDiscountCodes() {
        try {
            const response = await fetch("/api/discount_special");
            if (!response.ok) {
                throw new Error(`Ошибка: ${response.status}`);
            }
            const discountCodes = await response.json();
            this.renderDiscountButtons(discountCodes);
        } catch (error) {
            console.error("Ошибка при загрузке скидок:", error);
        }
    }

    renderDiscountButtons(discountCodes) {
        this.discountCodeBody.innerHTML = "";

        if (!Array.isArray(discountCodes) || discountCodes.length === 0) {
            this.discountCodeBody.innerHTML = "<p>Скидки отсутствуют</p>";
            return;
        }

        discountCodes.forEach(discount => {
            const button = document.createElement("button");
            button.className = "discount-code__button";

            const name = document.createElement("p");
            name.className = "discount-code__name";
            name.textContent = discount.name || "Без названия";

            const percent = document.createElement("p");
            percent.className = "discount-code__percent";
            percent.textContent = `${discount.percent}%`;

            button.appendChild(name);
            button.appendChild(percent);

            this.discountCodeBody.appendChild(button);
        });
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const discountCodeManager = new DiscountCodeManager();
});