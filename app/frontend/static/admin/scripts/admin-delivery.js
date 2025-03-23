import { warehouseManager } from './admin-warehouse.js'
import { categoryManager } from './admin-category.js';

document.addEventListener("DOMContentLoaded", () => {
    const lists = document.querySelectorAll(".control__list");

    lists.forEach(list => {
        const titleElement = list.querySelector(".control__item h3");
        const items = list.querySelectorAll(".control__item:not(:first-child)");

        if (titleElement) {
            titleElement.addEventListener("click", () => {
                items.forEach(item => {
                    if (item.classList.contains("visible")) {
                        setTimeout(() => {
                            item.style.display = "none"
                            item.classList.remove("visible");
                            item.style.height = "0";
                        }, 0);
                    } else {
                        item.style.display = "block";
                        item.style.height = item.scrollHeight + "px";
                        item.classList.add("visible");
                        setTimeout(() => item.style.height = "auto", 300);
                    }
                });
            });
        }
    });
});

const openButton = document.querySelector('.nav__button--delivery');
const modal = document.querySelector('.delivery__modal');
const closeButton = document.querySelector('.delivery__close-button');
const submitButton = document.getElementById('delivery__modal-submit');
const quantityInput = document.getElementById('delivery__modal-quantity');
const nameInput = document.getElementById('delivery__modal-name');
const categorySelect = document.getElementById('delivery__modal-category');
const priceInput = document.getElementById('delivery__modal-price');
const costInput = document.getElementById('delivery__modal-cost');

const barcodeInput = document.createElement('input');
barcodeInput.type = "text";
barcodeInput.placeholder = "Введите баркод";
barcodeInput.id = "delivery__modal-barcode";
modal.querySelector('.delivery__modal-inner').insertBefore(barcodeInput, quantityInput);

openButton.addEventListener('click', async () => {
    modal.classList.add('modal--open');
    categoryManager.refreshCategorySelects();
    resetForm();
});

closeButton.addEventListener('click', closeModal);
modal.addEventListener('click', (event) => {
    if (event.target === modal) closeModal();
});

async function checkBarcode() {
    const barcode = barcodeInput.value.trim();
    if (!barcode) return;

    try {
        const response = await fetch(`/api/warehouse/barcode/${barcode}`);
        const data = response.ok ? await response.json() : null;

        toggleInputs(!data);
        if (data) {
            nameInput.value = data.name || '';
            categorySelect.value = data.category_id || '';
            priceInput.value = data.retail_price || '';
            costInput.value = data.purchasing_price || '';
        } else {
            resetInputs();
        }
    } catch (error) {
        console.error("Ошибка запроса:", error);
    }
}

async function submitDelivery() {
    const payload = {
        barcode: barcodeInput.value.trim(),
        quantity: quantityInput.value.trim(),
    };

    if (!nameInput.hidden) payload.name = nameInput.value.trim();
    if (!categorySelect.hidden) payload.category_id = categorySelect.value.trim();
    if (!priceInput.hidden) payload.retail_price = priceInput.value.trim();
    if (!costInput.hidden) payload.purchasing_price = costInput.value.trim();

    const filteredPayload = Object.fromEntries(
        Object.entries(payload).filter(([_, v]) => v !== '')
    );

    try {
        const response = await fetch('/api/warehouse', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(filteredPayload)
        });

        if (!response.ok) throw new Error("Ошибка сервера");

        console.log("Товар успешно добавлен");
        warehouseManager.refreshWarehouseTable();
        resetInputs();
    } catch (error) {
        console.error("Ошибка сети:", error);
    }
}

function closeModal() {
    modal.classList.remove('modal--open');
    resetForm();
}

function resetForm() {
    barcodeInput.value = '';
    resetInputs();
}

function resetInputs() {
    barcodeInput = '';
    nameInput.value = '';
    quantityInput.value = '';
    categorySelect.value = 0;
    priceInput.value = '';
    costInput.value = '';
}

function toggleInputs(show) {
    nameInput.hidden = !show;
    categorySelect.hidden = !show;
    priceInput.hidden = !show;
    costInput.hidden = !show;
}

barcodeInput.addEventListener('input', checkBarcode);
submitButton.addEventListener('click', submitDelivery);
