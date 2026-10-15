"use strict";
document.addEventListener("DOMContentLoaded", function () {
    const accountLabel = document.getElementById("accountLabel");
    const accountMenu = document.getElementById("accountMenu");
    const logoutBtn = document.getElementById("logoutBtn");
    if (!accountLabel || !accountMenu) {
        console.error("Account label or menu was not found.");
        return;
    }
    let currentUser = null;
    try {
        currentUser = JSON.parse(
            sessionStorage.getItem("shamamaCurrentUser")
        );
    } catch (error) {
        currentUser = null;
    }
    const isLoggedIn = currentUser !== null;
    const isAdmin = isLoggedIn && Number(currentUser.role) === 1;
    accountLabel.textContent = isAdmin ? "Admin" : "Account";
    accountMenu.querySelectorAll("[data-guest-only]").forEach(function (item) {
        item.style.display = isLoggedIn ? "none" : "";
    });
    accountMenu.querySelectorAll("[data-customer-only]").forEach(function (item) {
        item.style.display = isLoggedIn && !isAdmin ? "" : "none";
    });
    accountMenu.querySelectorAll("[data-admin-only]").forEach(function (item) {
        item.style.display = isAdmin ? "" : "none";
    });
    accountMenu.querySelectorAll("[data-authenticated-only]").forEach(function (item) {
        item.style.display = isLoggedIn ? "" : "none";
    });
    if (logoutBtn) {
        logoutBtn.addEventListener("click", function (event) {
            event.preventDefault();
            sessionStorage.removeItem("shamamaCurrentUser");
            sessionStorage.removeItem("shamamaLoggedIn");
            window.location.href = "index.html";
        });
    }
});
