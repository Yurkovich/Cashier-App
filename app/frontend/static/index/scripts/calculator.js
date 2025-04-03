
document.addEventListener('DOMContentLoaded', () => {
    const calculatorField = document.querySelector('.calculator__field input');
    const totalCostElement = document.querySelector('.calculator__total-cost');
    const changeElement = document.querySelector('.calculator__change');
    const buttons = document.querySelectorAll('.calculator button');
    let currentInput = '';

    function updateDisplay() {
        calculatorField.value = currentInput || '0';
        calculateChange();
    }

    function calculateChange() {
        const totalCostText = totalCostElement.textContent.trim();
        const totalCost = parseFloat(totalCostText.replace(/[^0-9.,]/g, '').replace(',', '.')) || 0;
        const clientPayment = parseFloat(calculatorField.value.replace(/[^0-9.,]/g, '').replace(',', '.')) || 0;

        if (!isNaN(totalCost) && !isNaN(clientPayment)) {
            const change = clientPayment - totalCost;
            changeElement.textContent = change >= 0 ? `${change.toFixed(2)} ₽` : 'Недостаточно средств';
        } else {
            changeElement.textContent = '0 ₽';
        }
    }

    buttons.forEach(button => {
        button.addEventListener('click', () => {
            const action = button.dataset.action;

            if (action === 'number') {
                currentInput += button.textContent.trim();
            } else if (action === 'clear') {
                currentInput = '';
            } else if (action === 'erase') {
                currentInput = currentInput.slice(0, -1);
            } else if (['add', 'subtract', 'multiply', 'divide'].includes(action)) {
                const operator = {
                    add: ' + ',
                    subtract: ' - ',
                    multiply: ' × ',
                    divide: ' ÷ '
                }[action];
                currentInput += operator;
            } else if (action === 'calculate') {
                try {
                    const result = evaluateExpression(currentInput);
                    currentInput = result.toString();
                } catch (error) {
                    alert('Ошибка в выражении');
                }
            } else if (action === 'pay') {
                closeModal();
            }

            updateDisplay();
        });
    });

    function evaluateExpression(expression) {
        const formattedExpression = expression
            .replace(/×/g, '*')
            .replace(/÷/g, '/');
        return eval(formattedExpression);
    }

    calculatorField.addEventListener('keydown', (event) => {
        const key = event.key;

        if (/^[0-9.,]$/.test(key) || ['Backspace', 'Delete', 'Enter'].includes(key)) {
            event.preventDefault();

            if (/^[0-9]$/.test(key)) {
                currentInput += key;
            } else if (key === '.' || key === ',') {
                if (!currentInput.includes('.')) {
                    currentInput += '.';
                }
            } else if (key === 'Backspace' || key === 'Delete') {
                currentInput = currentInput.slice(0, -1);
            } else if (key === 'Enter') {

            }

            updateDisplay();
        } else {
            event.preventDefault();
        }
    });

    const modal = document.querySelector('.modal');
    const openButton = document.querySelector('.footer__payment');
    const cashButton = document.querySelector('.modal__cash');

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
        currentInput = '';
        updateDisplay();

        document.removeEventListener('keydown', handleKeyDown);
        modal.removeEventListener('click', handleClickOutside);
    }

    function handleKeyDown(event) {
        if (event.key === 'Escape') {
            closeModal();
        }
    }

    function handleClickOutside(event) {
        const modalWindow = modal.querySelector('.modal__window');
        if (!modalWindow.contains(event.target)) {
            closeModal();
        }
    }

    openButton.addEventListener('click', openModal);

    updateDisplay();
});