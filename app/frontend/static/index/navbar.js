
document.addEventListener("DOMContentLoaded", function () {
    const searchButton = document.getElementById("search-button");
    const searchInput = document.getElementById("search-input");
    const guestsButton = document.getElementById("guests-button");
    const notificationsButton = document.getElementById("notifications-button");
    const navbarGroup = document.querySelector('.navbar-group')

    searchButton.addEventListener("click", function () {
        guestsButton.parentElement.remove();
        notificationsButton.parentElement.remove();
        navbarGroup.style.gridTemplateColumns = '3fr';

        searchInput.style.display = "block";
        searchInput.style.width = "100%";
        searchInput.focus();

        searchButton.parentElement.classList.add("active");
    });

    searchInput.addEventListener("blur", function () {
        navbarGroup.style.gridTemplateColumns = '1fr 1fr 1fr';
        navbarGroup.appendChild(guestsButton.parentElement);
        navbarGroup.appendChild(notificationsButton.parentElement);
        navbarGroup.appendChild(searchButton.parentElement);

        searchButton.parentElement.classList.remove("active");
 
        searchInput.style.display = "none";
        searchInput.value = "";
    });
});
