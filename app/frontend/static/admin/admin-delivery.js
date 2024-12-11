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

const openButton = document.querySelector('.nav__button--delivery')
const modal = document.querySelector('.delivery__modal')
const closeButton = document.querySelector('.delivery__close-button')
const modalOverlay = document.querySelector('.delivery__modal-overlay')


openButton.addEventListener('click', () => {
    modal.classList.add('modal--open')
    modalOverlay.classList.add('modal__overlay--open')
    
})

closeButton.addEventListener('click', () => {
    modal.classList.remove('modal--open')
    modalOverlay.classList.remove('modal__overlay--open')
})

modalOverlay.addEventListener('click', function() {
    modal.classList.remove('modal--open');
    modalOverlay.classList.remove('modal__overlay--open');
});
