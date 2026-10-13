document.addEventListener("DOMContentLoaded", function () {
    const contactForm = document.querySelector(".contact-form");
    if (!contactForm) {
        return;
    }
    const nameInput = document.getElementById("contact-name");
    const emailInput = document.getElementById("contact-email");
    const subjectInput = document.getElementById("contact-subject");
    const orderInput = document.getElementById("order-number");
    const messageInput = document.getElementById("contact-message");
    const submitButton = contactForm.querySelector('button[type="submit"]');
    const SERVICE_ID = "service_5gt4wdn";
    const TEMPLATE_ID = "template_06mqosl";
    const PUBLIC_KEY = "NJD47aRNpb8TQjqnm";
    contactForm.setAttribute("novalidate", "");
    const formStatus = document.createElement("div");
    formStatus.className = "form-status";
    formStatus.setAttribute("role", "status");
    formStatus.setAttribute("aria-live", "polite");
    formStatus.style.marginTop = "15px";
    contactForm.appendChild(formStatus);
    const inputs = [nameInput, emailInput, subjectInput, orderInput, messageInput];
    inputs.forEach(function (input) {
        const error = document.createElement("small");
        error.className = "field-error";
        error.id = input.id + "-error";
        error.style.display = "block";
        error.style.color = "#b42318";
        error.style.fontSize = "13px";
        error.style.marginTop = "5px";
        input.insertAdjacentElement("afterend", error);
        input.setAttribute("aria-describedby", error.id);
    });
    function showError(input, message) {
        const error = document.getElementById(input.id + "-error");
        error.textContent = message;
        input.setAttribute("aria-invalid", "true");
        input.classList.add("invalid");
        input.classList.remove("valid");
    }
    function showValid(input) {
        const error = document.getElementById(input.id + "-error");
        error.textContent = "";
        input.setAttribute("aria-invalid", "false");
        input.classList.remove("invalid");
        input.classList.add("valid");
    }

    function clearStatus() {
        formStatus.textContent = "";
    }
    
    function showStatus(message, type) {
        formStatus.textContent = message;
        formStatus.style.color = type === "success" ? "#26734d" : "#b42318";
    }
    
    function validateName() {
        const name = nameInput.value.trim();
        if (!name) {
            showError(nameInput, "Please enter your name.");
            return false;
        }
        if (name.length < 2 || name.length > 80) {
            showError(nameInput, "Your name must contain 2 to 80 characters.");
            return false;
        }
    
        const namePattern = /^[\p{L}\p{M}]+(?:[ '\u2019.-][\p{L}\p{M}]+)*$/u;
        if (!namePattern.test(name)) {
            showError(nameInput, "Use letters, spaces, apostrophes, periods or hyphens only.");
            return false;
        }
        showValid(nameInput);
        return true;
    }
    function validateEmail() {
        const email = emailInput.value.trim();
        if (!email) {showError(emailInput, "Please enter your email address.");
            return false;
        }
        if (email.length > 254) {
            showError(emailInput, "Your email address is too long.");
            return false;
        }
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
        if (!emailPattern.test(email)) {
            showError(emailInput, "Enter a valid email, such as you@example.com.");
            return false;
        }
        showValid(emailInput);
        return true;
    }
    
    function validateSubject() {
        if (!subjectInput.value) {
            showError(subjectInput, "Please select a reason for your message.");
            return false;
        }
        showValid(subjectInput);
        return true;
    }

    
    function validateOrderNumber() {
        const orderNumber = orderInput.value.trim();
        if (!orderNumber) {
            showValid(orderInput);
            return true;
        }
        if (orderNumber.length > 40) {
            showError(orderInput, "The order number cannot exceed 40 characters.");
            return false;
        }
        const orderPattern = /^[A-Za-z0-9][A-Za-z0-9-]*$/;
        if (!orderPattern.test(orderNumber)) {
            showError(orderInput, "Use letters, numbers and hyphens only.");
            return false;
        }
        showValid(orderInput);
        return true;
    }
    
    function validateMessage() {
        const message = messageInput.value.trim();
        if (!message) {
            showError(messageInput, "Please write your message.");
            return false;
        }
        if (message.length < 10) {
            showError(messageInput, "Your message must contain at least 10 characters."
            );
            return false;
        }
        if (message.length > 3000) {
            showError(messageInput, "Your message cannot exceed 3000 characters.");
            return false;
        }
        showValid(messageInput);
        return true;
    }
    
    function validateForm() {
        const nameValid = validateName();
        const emailValid = validateEmail();
        const subjectValid = validateSubject();
        const orderValid = validateOrderNumber();
        const messageValid = validateMessage();
        return (nameValid && emailValid && subjectValid && orderValid && messageValid);
    }
    
    nameInput.addEventListener("blur", validateName);
    emailInput.addEventListener("blur", validateEmail);
    subjectInput.addEventListener("change", validateSubject);
    orderInput.addEventListener("blur", validateOrderNumber);
    messageInput.addEventListener("blur", validateMessage);
    
    nameInput.addEventListener("input", function () {
        clearStatus();
        if (nameInput.getAttribute("aria-invalid") === "true") {
            validateName();
        }
    });
    emailInput.addEventListener("input", function () {
        clearStatus();
        if (emailInput.getAttribute("aria-invalid") === "true") {
            validateEmail();
        }
    });
    subjectInput.addEventListener("change", function () {
        clearStatus();
        validateSubject();
    });
    orderInput.addEventListener("input", function () {
        clearStatus();
        if (orderInput.getAttribute("aria-invalid") === "true") {
            validateOrderNumber();
        }
    });
    messageInput.addEventListener("input", function () {
        clearStatus();
        if (messageInput.getAttribute("aria-invalid") === "true") {
            validateMessage();
        }
    });

    contactForm.addEventListener("submit", async function (event) {
        event.preventDefault();
        clearStatus();
        if (!validateForm()) {
            showStatus("Please correct the errors before sending your message.","error");
            const firstInvalid = contactForm.querySelector('[aria-invalid="true"]');
            if (firstInvalid) {
                firstInvalid.focus();
            }
            return;
        }
        if (typeof emailjs === "undefined" || !SERVICE_ID || !TEMPLATE_ID || !PUBLIC_KEY) {
            showStatus("EmailJS is not configured. Check your service, template and public key.", "error");
            return;
        }
        if (typeof emailjs !== "undefined") {
            emailjs.init({
                publicKey: PUBLIC_KEY
            });
        }
        
        const originalButtonHTML = submitButton.innerHTML;
        submitButton.disabled = true;
        submitButton.textContent = "Sending...";
        try {
            const templateParams = { from_name: nameInput.value.trim(),
                reply_to: emailInput.value.trim(),
                email: emailInput.value.trim(),
                reason: subjectInput.options[subjectInput.selectedIndex].text,
                subject: "Shamama Contact: " + subjectInput.options[ subjectInput.selectedIndex].text,
                order_number: orderInput.value.trim() || "Not provided",
                message: messageInput.value.trim()
            };
    
            const response = await emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams);
            if (response.status !== 200) {
                throw new Error("EmailJS could not send the message.");
            }
            showStatus("Thank you! Your message has been sent successfully.", "success");
            contactForm.reset();
            inputs.forEach(function (input) {
                input.classList.remove("valid", "invalid");
                input.removeAttribute("aria-invalid");
                const error = document.getElementById(input.id + "-error");
                error.textContent = "";
            });
        } catch (error) {
            console.error("Contact form error:", error);
            showStatus("Sorry, your message could not be sent. Please try again.", "error");
        } finally {
            submitButton.disabled = false;
            submitButton.innerHTML = originalButtonHTML;
        }
    });
});