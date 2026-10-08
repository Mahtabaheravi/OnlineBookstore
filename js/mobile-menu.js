document.addEventListener("DOMContentLoaded", function () {
    const menuToggle = document.getElementById("menuToggle");
    const mobileMenu = document.getElementById("mobileMenu");
    const mobileLinks = document.querySelectorAll(".mobile-navigation a");

    if (!menuToggle || !mobileMenu) {
        return;
    }

    menuToggle.addEventListener("click", function () {
        mobileMenu.classList.toggle("open");
        menuToggle.classList.toggle("active");
    });

    mobileLinks.forEach(function (link) {
        link.addEventListener("click", function () {
            mobileMenu.classList.remove("open");
            menuToggle.classList.remove("active");
        });
    });

    document.addEventListener("click", function (event) {
        if (!mobileMenu.contains(event.target) && !menuToggle.contains(event.target)) {
            mobileMenu.classList.remove("open");
            menuToggle.classList.remove("active");
        }
    });
    window.addEventListener("resize", function () {
        if (window.innerWidth > 900) {
            mobileMenu.classList.remove("open");
            menuToggle.classList.remove("active");
        }
    });
});




document.addEventListener("DOMContentLoaded", function () {
    const accountButton = document.querySelector(".account-btn");
    const accountDropdown = document.querySelector(".account-dropdown");
    if (!accountButton || !accountDropdown) {
        return;
    }
    accountButton.addEventListener("click", function (event) {
        event.stopPropagation();
        accountDropdown.classList.toggle("open");
    });

    document.addEventListener("click", function () {
        accountDropdown.classList.remove("open");
    });

});