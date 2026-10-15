"use strict";
document.addEventListener("click", function (event) {
    const actionButton = event.target.closest("[data-requires-login]");
    if (!actionButton) {
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
    if (!currentUser) {
        event.preventDefault();
        event.stopImmediatePropagation();
        Swal.fire({
            icon: "warning",
            title: "Login Required!",
            text: "Please log in first to continue.",
            confirmButtonText: "Go to Login",
            confirmButtonColor: "#b4935b",
            background: "#F8F3EC",
            color: "#b4935b"
        }).then(function () {
            window.location.href = "login.html";
        });
    }
}, true);