
document.addEventListener('DOMContentLoaded', () => {
    const modal = document.querySelector('.modal');
    const paymentButton = document.querySelector('.footer__payment');

    paymentButton.addEventListener('click', (event) => {
        event.preventDefault();
        modal.classList.add('modal--show');
    });

    document.addEventListener('click', (event) => {
        if (!modal.contains(event.target) && !paymentButton.contains(event.target)) {
            modal.classList.remove('modal--show');
        }
    });
});