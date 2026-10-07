document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("loginForm");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const rememberMe = document.getElementById("rememberMe");
    const emailError = document.getElementById("emailError");
    const passwordError = document.getElementById("passwordError");
    const formMessage = document.getElementById("formMessage");

    emailInput.addEventListener("input", function () {
        const email = emailInput.value.trim();
        if (email === "") {
            emailError.textContent ="Please enter your email.";
            emailInput.classList.remove("valid");
        }
        else if (!email.includes("@") || !email.includes(".")) {
            emailError.textContent = "Please enter a valid email";
            emailInput.classList.remove("valid");
        }
        else {
            emailError.textContent = "";
            emailInput.classList.add("valid");
        }
    });
    passwordInput.addEventListener("input", function () {
        const password = passwordInput.value;
        if (password === "") {
            passwordError.textContent = "Please enter your password.";
            passwordInput.classList.remove("valid");
        }
        else {
            passwordError.textContent = "";
            passwordInput.classList.add("valid");
        }
    });
    const showPasswordButtons = document.querySelectorAll(".show-password");
    showPasswordButtons.forEach(function (button) {
        button.addEventListener("click", function () {
            const targetId = button.dataset.target;
            const targetInput = document.getElementById(targetId);
            const icon = button.querySelector("i");
            if (targetInput.type === "password") {
                targetInput.type = "text";
                icon.classList.remove("fa-eye");
                icon.classList.add("fa-eye-slash");
                button.setAttribute("aria-label", "Hide password");
            }
            else {
                targetInput.type = "password";
                icon.classList.remove("fa-eye-slash");
                icon.classList.add("fa-eye");
                button.setAttribute( "aria-label", "Show password");
            }
        });
    });
    const rememberedEmail = localStorage.getItem("shamamaRememberedEmail");
    if (rememberedEmail) {
        emailInput.value = rememberedEmail;
        rememberMe.checked = true;
    }
    form.addEventListener("submit", function (event) {
        event.preventDefault();
        const email = emailInput.value.trim().toLowerCase();
        const password = passwordInput.value;
        emailError.textContent = "";
        passwordError.textContent = "";
        formMessage.textContent = "";
        formMessage.className = "form-message";
        if (email === "") {
            emailError.textContent = "Please enter your email";
            emailInput.focus();
            return;
        }
        if (!email.includes("@") || !email.includes(".")) {
            emailError.textContent = "Please enter a valid email";
            emailInput.focus();
            return;
        }
        if (password === "") {
            passwordError.textContent = "Please enter your password";
            passwordInput.focus();
            return;
        }
        const savedUser = JSON.parse(localStorage.getItem("shamamaUser"));
        if (!savedUser) {
            formMessage.textContent = "No account found. Please create an account first";
            formMessage.classList.add("error");
            return;
        }
        if (savedUser.email.toLowerCase() !== email) {
            emailError.textContent = "No account found with this email";
            emailInput.focus();
            return;
        }
        if (savedUser.password !== password) {
            passwordError.textContent = "Incorrect password";
            passwordInput.focus();
            return;
        }
        if (rememberMe.checked) {
            localStorage.setItem("shamamaRememberedEmail", email);
        }
        else {
            localStorage.removeItem("shamamaRememberedEmail");
        }
        formMessage.textContent = "✓ Login successful!";
        formMessage.classList.add("success");
        sessionStorage.setItem("shamamaLoggedIn", "true");

        sessionStorage.setItem("shamamaCurrentUser", JSON.stringify(savedUser));

        setTimeout(function () { window.location.href = "index.html";}, 1000);
    });
});