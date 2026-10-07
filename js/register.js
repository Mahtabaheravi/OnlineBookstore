document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("registerForm");
    const fullNameInput = document.getElementById("fullName");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const confirmPasswordInput = document.getElementById("confirmPassword");
    const termsInput = document.getElementById("terms");
    const nameError = document.getElementById("nameError");
    const emailError = document.getElementById("emailError");
    const passwordError = document.getElementById("passwordError");
    const confirmError = document.getElementById("confirmError");
    const strengthText = document.getElementById("strengthText");
    const strengthBar = document.getElementById("strengthBar");
    const formMessage = document.getElementById("formMessage");

    fullNameInput.addEventListener("input", function () {
        const name = fullNameInput.value.trim();
        if (name === "") {
            nameError.textContent = "Please enter your full name";
            fullNameInput.classList.remove("valid");
        }
        else if (name.length < 3) {
            nameError.textContent = "Name must be at least 3 characters";
            fullNameInput.classList.remove("valid");
        }
        else {
            nameError.textContent = "";
            fullNameInput.classList.add("valid");
        }
    });
    emailInput.addEventListener("input", function () {
        const email = emailInput.value.trim();
        if (email === "") {
            emailError.textContent = "Please enter your email";
            emailInput.classList.remove("valid");
        }
        else if(!email.includes("@") || !email.includes(".")){
            emailError.textContent = "Please enter a valid email";
            emailInput.classList.remove("valid");
        }
        else {
            emailError.textContent = "";
            emailInput.classList.add("valid");
        }
    });

    passwordInput.addEventListener("input", function (){
        const password = passwordInput.value;
        const hasNumber = /[0-9]/.test(password);
        const hasLetter = /[a-zA-Z]/.test(password);
        const hasUppercase = /[A-Z]/.test(password);
        const hasLowercase = /[a-z]/.test(password);
        const hasSymbol = /[^a-zA-Z0-9]/.test(password);
        if (password.length === 0) {
            strengthBar.style.width = "0%";
            strengthText.textContent = "—";
            strengthBar.className = "";
            strengthText.className = "";
            passwordError.textContent = "";
            checkPasswordMatch();
            return;
        }
        if (password.length < 8) {
            strengthBar.style.width = "25%";
            strengthText.textContent = "Weak";
            strengthBar.className = "weak";
            strengthText.className = "weak";
            passwordError.textContent = "Password must be at least 8 characters";
        }
        else if(password.length >= 8 && hasLetter && hasNumber && !(hasLowercase && hasUppercase && hasSymbol)) {
            strengthBar.style.width = "65%";
            strengthText.textContent = "Medium";
            strengthBar.className = "medium";
            strengthText.className = "medium";
            passwordError.textContent = "Add uppercase, lowercase and symbol for a strong password";
        }
        else if(password.length >= 8 && hasLowercase && hasUppercase && hasNumber && hasSymbol){
            strengthBar.style.width = "100%";
            strengthText.textContent = "Strong";
            strengthBar.className = "strong";
            strengthText.className = "strong";
            passwordError.textContent = "";
        }
        else {
            strengthBar.style.width = "45%";
            strengthText.textContent = "Good";
            strengthBar.className = "medium";
            strengthText.className = "medium";
            passwordError.textContent = "";
        }
        checkPasswordMatch();
    });
    confirmPasswordInput.addEventListener( "input", checkPasswordMatch);
    function checkPasswordMatch() {
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;
        if (confirmPassword === "") {
            confirmError.textContent = "";
            confirmPasswordInput.classList.remove("valid", "invalid");
            return;
        }
        if (password === confirmPassword) {
            confirmError.textContent = "✓ Passwords match";
            confirmPasswordInput.classList.remove("invalid");
            confirmPasswordInput.classList.add("valid");
        }
        else {
            confirmError.textContent = "Passwords do not match";
            confirmPasswordInput.classList.remove("valid");
            confirmPasswordInput.classList.add("invalid");
        }
    }
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
                button.setAttribute( "aria-label", "Hide password");
            }
            else {
                targetInput.type = "password";
                icon.classList.remove("fa-eye-slash");
                icon.classList.add("fa-eye");
                button.setAttribute("aria-label", "Show password");
            }
        });
    });
    form.addEventListener("submit", function (event) {
        event.preventDefault();
        const name = fullNameInput.value.trim();
        const email = emailInput.value.trim().toLowerCase();
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;
        const strongPassword = password.length >= 8 && /[A-Z]/.test(password) && /[a-z]/.test(password) && /[0-9]/.test(password) && /[^a-zA-Z0-9]/.test(password);
        formMessage.textContent = "";
        formMessage.className = "form-message";

        if (name === "") {
            nameError.textContent ="Please enter your full name";
            fullNameInput.focus();
            return;
        }
        if (name.length < 3) {
            nameError.textContent = "Name must be at least 3 characters";
            fullNameInput.focus();
            return;
        }
        if(email === "" || !email.includes("@") || !email.includes(".")){
            emailError.textContent = "Please enter a valid email";
            emailInput.focus();
            return;
        }
        if (!strongPassword) {
            passwordError.textContent = "Please create a strong password";
            passwordInput.focus();
            return;
        }
        if (password !== confirmPassword) {
            confirmError.textContent ="Passwords do not match";
            confirmPasswordInput.focus();
            return;
        }
        if (!termsInput.checked){
            formMessage.textContent = "Please agree to the terms and conditions";
            formMessage.classList.add("error");
            return;
        }
        const existingUser = JSON.parse(localStorage.getItem("shamamaUser"));
        if (existingUser && existingUser.email.toLowerCase() === email) {
            formMessage.textContent = "This account already exists";
            formMessage.classList.add("error");
            emailError.textContent = "This email is already registered.";
            emailInput.focus();
            return;
        }
        const user = {
            fullName: name,
            email: email,
            password: password
        };
        localStorage.setItem("shamamaUser", JSON.stringify(user));

        formMessage.textContent = "✓ Registration successful!";
        formMessage.classList.add("success");

        form.reset();
        strengthBar.style.width = "0%";
        strengthText.textContent = "—";
        strengthBar.className = "";
        strengthText.className = "";
        fullNameInput.classList.remove("valid");
        emailInput.classList.remove("valid");
        passwordInput.classList.remove("valid");
        confirmPasswordInput.classList.remove("valid");
        nameError.textContent = "";
        emailError.textContent = "";
        passwordError.textContent = "";
        confirmError.textContent = "";

    });
});

