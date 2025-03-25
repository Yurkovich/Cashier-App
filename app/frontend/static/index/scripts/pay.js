
document.addEventListener('DOMContentLoaded', () => {
    const modal = document.querySelector('.modal');
    const openButton = document.querySelector('.footer__payment');
    const cashButton = document.querySelector('.modal__cash');
    const calculator = document.querySelector('.calculator');
    const modalButtons = document.querySelector('.modal__buttons');

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
        calculator.classList.remove('calculator--show');
        modalButtons.style.display = '';

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

    cashButton.addEventListener('click', () => {
        calculator.classList.add('calculator--show');
        modalButtons.style.display = 'none';
    });

    openButton.addEventListener('click', openModal);
});
