const CART_KEY = "shamamaCart";
const BOOKS_URL = "data/books.json";
const ORDERS_KEY = "shamamaOrders";
const COUPON_CODE = "SHAMAMA10";
const COUPON_RATE = 0.10;
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);
const checkoutForm = $("#checkoutForm");
const cartItemsContainer = $("#cartItems");
const cardPaymentForm = $("#cardPaymentForm");
const cardName = $("#cardName");
const cardNumber = $("#cardNumber");
const cardExpiry = $("#cardExpiry");
const cardCvv = $("#cardCvv");
const payNowBtn = $("#payNowBtn");
const cardPaymentMessage = $("#cardPaymentMessage");
const placeOrderBtn = $("#placeOrderBtn");
let cart = [];
let books = [];
let couponApplied = false;
let paymentCompleted = false;
let checkoutInitialized = false;

function getMoney(amount) {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD"
    }).format(amount);
}

function getCart() {
    try {
        const storedCart = JSON.parse(
            localStorage.getItem(CART_KEY) || "[]"
        );

        return Array.isArray(storedCart) ? storedCart : [];
    } catch (error) {
        console.error("Could not read the cart:", error);
        return [];
    }
}

function saveCart() {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function getOrders() {
    try {
        const orders = JSON.parse(localStorage.getItem(ORDERS_KEY) || "[]");
        return Array.isArray(orders) ? orders : [];
    } catch (error) {
        console.error("Could not read saved orders:", error);
        return [];
    }
}
function getBookId(book) {
    return String(book.id ?? book.bookId ?? "");
}
function getBookTitle(book) {
    return book.title || book.name || "Untitled Book";
}
function getBookPrice(book) {
    const price = Number(book.price ?? book.salePrice ?? book.discountPrice);
    return Number.isFinite(price) && price >= 0 ? price : 0;
}
function getBookImage(book) {
    return book.image || book.cover || book.imageUrl || book.img || "";
}
function getBookAuthor(book) {
    return book.author || "Unknown Author";
}
function getQuantity(item) {
    const quantity = Number(item.quantity ?? item.qty ?? 1);
    return Number.isInteger(quantity) && quantity > 0 ? quantity : 1;
}
function findBook(item) {
    const itemId = getBookId(item);
    const matchingBook = books.find((book) => getBookId(book) === itemId);
    if (!matchingBook) {
        return item;
    }
    return {
        ...matchingBook,
        ...item
    };
}

function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, (character) => {
        const characters = {"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"};
        return characters[character];
    });
}

async function initializeCheckout() {
    if (checkoutInitialized) {
        return;
    }
    checkoutInitialized = true;
    try {
        const response = await fetch(BOOKS_URL);
        if (!response.ok) {
            throw new Error(`Could not load books: ${response.status}`);
        }
        const data = await response.json();
        books = Array.isArray(data) ? data : [];
    } catch (error) {
        console.warn("Book data could not be loaded. Using saved cart details.", error);
    }
    cart = getCart();
    renderCart();
    updateTotals();
    updateSelectedOptions();
    setupEventListeners();
}
function getCartDetails() {
    return cart.map(findBook);
}
function renderCart() {
    const items = getCartDetails();
    const itemCount = items.reduce((total, item) => total + getQuantity(item),0);
    $("#itemCount").textContent = `${itemCount} ${itemCount === 1 ? "item" : "items"}`;
    if (items.length === 0) {
        cartItemsContainer.innerHTML = `
            <div class="empty-cart">
                <i class="fa-solid fa-book-open"></i>
                <p>Your cart is empty.</p>
                <a href="shop.html">Browse Books</a>
            </div>
        `;
        placeOrderBtn.disabled = true;
        return;
    }
    placeOrderBtn.disabled = false;
    cartItemsContainer.innerHTML = items.map((item) => {
        const title = escapeHTML(getBookTitle(item));
        const author = escapeHTML(getBookAuthor(item));
        const image = escapeHTML(getBookImage(item));
        const quantity = getQuantity(item);
        const price = getBookPrice(item);
        const total = price * quantity;
        const imageHTML = image
            ? `
                <img src="${image}" alt="${title}" class="item-cover" loading="lazy">
            `
            : `
                <span class="item-cover item-cover-placeholder" aria-hidden="true">
                    <i class="fa-solid fa-book"></i>
                </span>
            `;
        return `
            <article class="order-item">
              ${imageHTML}
                <div class="item-information">
                    <h3 class="item-title">${title}</h3>
                    <p class="item-author">${author}</p>
                    <p class="item-quantity">
                        Qty: ${quantity} × ${getMoney(price)}
                    </p>
                </div>
                <strong class="item-price">
                    ${getMoney(total)}
                </strong>
            </article>
        `;
    }).join("");

    cartItemsContainer.querySelectorAll(".item-cover").forEach((image) => {
        if (image.tagName !== "IMG") {
            return;
        }
        image.addEventListener("error", () => {
            const placeholder = document.createElement("span");
            placeholder.className = "item-cover item-cover-placeholder";
            placeholder.setAttribute("aria-hidden", "true");
            placeholder.innerHTML = '<i class="fa-solid fa-book"></i>';
            image.replaceWith(placeholder);
        }, { once: true });
    });
}
function getSubtotal() {
    return getCartDetails().reduce((total, item) => {
        return total + getBookPrice(item) * getQuantity(item);
    }, 0);
}
function getShippingCost() {
    const selectedShipping = $('input[name="shipping"]:checked');
    if (!selectedShipping) {
        return 0;
    }
    const price = Number(selectedShipping.dataset.price);
    return Number.isFinite(price) && price >= 0 ? price : 0;
}
function getDiscount() {
    return couponApplied ? getSubtotal() * COUPON_RATE : 0;
}
function getTotal() {
    return Math.max( 0, getSubtotal() - getDiscount() + getShippingCost());
}
function updateTotals() {
    const subtotal = getSubtotal();
    const discount = getDiscount();
    const shipping = getShippingCost();
    const total = getTotal();
    $("#subtotal").textContent = getMoney(subtotal);
    $("#shippingCost").textContent = getMoney(shipping);
    $("#discount").textContent = `-${getMoney(discount)}`;
    $("#total").textContent = getMoney(total);
    $("#discountRow").hidden = !couponApplied;
}
function updateSelectedOptions() {
    $$(".option-card").forEach((card) => {
         const radio = card.querySelector('input[name="shipping"]');
        card.classList.toggle("selected", Boolean(radio?.checked));
    });
    $$(".payment-card").forEach((card) => {
        const radio = card.querySelector('input[name="payment"]');
        card.classList.toggle("selected", Boolean(radio?.checked));
    });
    const payment = $('input[name="payment"]:checked')?.value;
    const usingCard = payment === "card";
    cardPaymentForm.hidden = !usingCard;
    placeOrderBtn.hidden = usingCard;
    if (!usingCard) {
        paymentCompleted = false;
        clearCardFields();
        cardPaymentMessage.textContent = "";
        cardPaymentMessage.className = "card-payment-message";
        payNowBtn.disabled = false;
        payNowBtn.innerHTML = `
            <span>Pay Now</span>
            <i class="fa-solid fa-lock"></i>
        `;
    } else if (!paymentCompleted) {
        cardPaymentMessage.textContent = "";
        cardPaymentMessage.className = "card-payment-message";
        payNowBtn.disabled = false;
        payNowBtn.innerHTML = `
            <span>Pay Now</span>
            <i class="fa-solid fa-lock"></i>
        `;
    }
}
function clearCardFields() {
    [cardName, cardNumber, cardExpiry, cardCvv].forEach((input) => {
        input.value = "";
        clearCardError(input);
    });
}

function applyCoupon() {
    const couponInput = $("#couponCode");
    const couponMessage = $("#couponMessage");
    const enteredCode = couponInput.value.trim().toUpperCase();
    couponMessage.className = "coupon-message";
    if (enteredCode === COUPON_CODE && getSubtotal() > 0) {
        couponApplied = true;
        couponMessage.textContent = "Coupon applied! You saved 10% on your books.";
        couponMessage.classList.add("success");
    } else {
        couponApplied = false;
        couponMessage.textContent = enteredCode === COUPON_CODE
            ? "Add books to your cart before applying this coupon."
            : "Invalid coupon code. Please try again.";
        couponMessage.classList.add("error");
    }
    updateTotals();
}
function showCardError(input, message) {
    input.classList.add("invalid");
    input.setAttribute("aria-invalid", "true");
    const group = input.closest(".form-group");
    if (group) {
        group.classList.add("invalid");
        const errorMessage = group.querySelector(".error-message");
        if (errorMessage) {
            errorMessage.textContent = message;
        }
    }
}
function clearCardError(input) {
    input.classList.remove("invalid");
    input.removeAttribute("aria-invalid");
    const group = input.closest(".form-group");
    if (group) {
        group.classList.remove("invalid");
        const errorMessage = group.querySelector(".error-message");
        if (errorMessage) {
            errorMessage.textContent = "";
        }
    }
}

function isValidCardNumber(number) {
    const digits = number.replace(/\D/g, "");
    if (!/^\d{13,19}$/.test(digits)) {
        return false;
    }
    let sum = 0;
    let doubleDigit = false;
    for (let i = digits.length - 1; i >= 0; i--) {
        let digit = Number(digits[i]);
        if (doubleDigit) {
            digit *= 2;
            if (digit > 9) {
                digit -= 9;
            }
        }
        sum += digit;
        doubleDigit = !doubleDigit;
    }
    return sum % 10 === 0;
}

function validateCardDetails() {
    let valid = true;
    [cardName, cardNumber, cardExpiry, cardCvv].forEach(clearCardError);
    if (cardName.value.trim().length < 2) {
        showCardError(cardName, "Enter the name on the card.");
        valid = false;
    }
    const number = cardNumber.value.replace(/\D/g, "");
    if (!isValidCardNumber(number)) {
        showCardError(cardNumber, "Enter a valid card number format.");
        valid = false;
    }
    const expiryMatch = cardExpiry.value.match(/^(\d{2})\/(\d{2})$/);
    if (!expiryMatch) {
        showCardError(cardExpiry, "Enter expiry as MM/YY.");
        valid = false;
    } else {
        const month = Number(expiryMatch[1]);
        const year = 2000 + Number(expiryMatch[2]);
        const now = new Date();
        const currentMonth = now.getMonth() + 1;
        const currentYear = now.getFullYear();
        if (
            month < 1 || month > 12 || year < currentYear ||
            (year === currentYear && month < currentMonth)
        ) {
            showCardError(
                cardExpiry, "This expiry date is invalid or expired."
            );
            valid = false;
        }
    }
    if (!/^\d{3,4}$/.test(cardCvv.value)) {
        showCardError(cardCvv, "Enter a 3- or 4-digit security code.");
        valid = false;
    }
    return valid;
}

cardNumber.addEventListener("input", () => {
    const digits = cardNumber.value.replace(/\D/g, "").slice(0, 19);
    cardNumber.value = digits.replace(/(.{4})/g, "$1 ").trim();
    paymentCompleted = false;
    clearCardError(cardNumber);
});
cardExpiry.addEventListener("input", () => {
    const digits = cardExpiry.value.replace(/\D/g, "").slice(0, 4);
    cardExpiry.value = digits.length > 2
        ? `${digits.slice(0, 2)}/${digits.slice(2)}`
        : digits;
    paymentCompleted = false;
    clearCardError(cardExpiry);
});
cardCvv.addEventListener("input", () => {
    cardCvv.value = cardCvv.value
        .replace(/\D/g, "")
        .slice(0, 4);
    paymentCompleted = false;
    clearCardError(cardCvv);
});
cardName.addEventListener("input", () => {
    paymentCompleted = false;
    clearCardError(cardName);
});
function simulateCardPayment() {
    if (paymentCompleted) {
        return;
    }
    cardPaymentMessage.textContent = "";
    cardPaymentMessage.className = "card-payment-message";
    if (!validateCardDetails()) {
        cardPaymentForm.querySelector(".invalid")?.focus();
        return;
    }
    payNowBtn.disabled = true;
    payNowBtn.innerHTML = `
        <span>Processing Demo Payment...</span>
        <i class="fa-solid fa-spinner fa-spin"></i>
    `;
    
    paymentCompleted = true;
    clearCardFields();
    cardPaymentMessage.textContent = "Demo payment successful! No money was charged.";
    cardPaymentMessage.className = "card-payment-message success";
    payNowBtn.disabled = false;
    payNowBtn.innerHTML = `
        <span>Payment Complete</span>
        <i class="fa-solid fa-check"></i>
    `;
}
function showFieldError(input, message) {
    const group = input.closest(".form-group");
    if (!group) {
        return;
    }
    group.classList.add("invalid");
    input.setAttribute("aria-invalid", "true");
    const error = group.querySelector(".error-message");
    if (error) {
        error.textContent = message;
    }
}
function clearFieldError(input) {
    const group = input.closest(".form-group");
    if (!group) {
        return;
    }
    group.classList.remove("invalid");
    input.removeAttribute("aria-invalid");
    const error = group.querySelector(".error-message");
    if (error) {
        error.textContent = "";
    }
}
function validateForm() {
    let valid = true;
    const requiredFields = [{input: $("#fullName"), message: "Enter your full name."},
        {input: $("#email"), message: "Enter your email address."},
        {input: $("#phone"), message: "Enter your phone number."},
        {input: $("#address"), message: "Enter your delivery address."},
        {input: $("#city"), message: "Enter your city."}
    ];
    requiredFields.forEach(({ input, message }) => {
        clearFieldError(input);
        if (!input.value.trim()) {
            showFieldError(input, message);
            valid = false;
        }
    });
    const email = $("#email");
    const emailValue = email.value.trim();
    if (
        emailValue && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue)
    ) {
        showFieldError(email, "Enter a valid email address.");
        valid = false;
    }
    const phone = $("#phone");
    if (
        phone.value.trim() &&
        phone.value.replace(/\D/g, "").length < 7
    ) {
        showFieldError(phone, "Enter a valid phone number.");
        valid = false;
    }
    const terms = $("#agreeTerms");
    const termsError = $("#termsError");
    if (!terms.checked) {
        termsError.textContent = "Please confirm that your information is correct.";
        valid = false;
    } else {
        termsError.textContent = "";
    }
    if (cart.length === 0) {
        alert("Your cart is empty. Please add books before checking out.");
        valid = false;
    }
    const payment = $('input[name="payment"]:checked')?.value;
    if (payment === "card" && !paymentCompleted) {
        alert("Please complete card payment first.");
        valid = false;
    }
    const firstInvalidField = checkoutForm.querySelector(".form-group.invalid input, .form-group.invalid textarea");
    if (firstInvalidField) {
        firstInvalidField.focus();
    }
    return valid;
}
function placeOrder(event) {
    event.preventDefault();
    if (!validateForm()) {
        return;
    }
    const payment = $('input[name="payment"]:checked')?.value;
    const shipping = $('input[name="shipping"]:checked');
    const orderNumber = "SHM-" + Date.now().toString().slice(-8);
    
    const order = {orderNumber,
        customer: {
            fullName: $("#fullName").value.trim(),
            email: $("#email").value.trim(),
            phone: $("#phone").value.trim(),
            address: $("#address").value.trim(),
            city: $("#city").value.trim(),
            deliveryArea: $("#deliveryArea").value.trim(),
            deliveryNotes: $("#deliveryNotes").value.trim()
        },
        items: getCartDetails().map((item) => ({
            id: getBookId(item),
            title: getBookTitle(item),
            author: getBookAuthor(item),
            price: getBookPrice(item),
            quantity: getQuantity(item)
        })),
        shipping: shipping?.value || "standard",
        shippingCost: getShippingCost(),
        subtotal: getSubtotal(),
        discount: getDiscount(),
        total: getTotal(),
        coupon: couponApplied ? COUPON_CODE : null,
        paymentMethod: payment,
        paymentStatus: payment === "card" ? "success" : "pending-cash-on-delivery",
        createdAt: new Date().toISOString()
    };
    try {
        const orders = getOrders();
        orders.push(order);
        localStorage.setItem( ORDERS_KEY, JSON.stringify(orders));
        cart = [];
        saveCart();
    } catch (error) {
        console.error("Could not save the order:", error);
        alert(
            "The order could not be saved in this browser. " +
            "Please check your browser storage and try again."
        );
        return;
    }
    showConfirmation(order);
}
function showConfirmation(order) {
    checkoutForm.hidden = true;
    $(".checkout-heading").hidden = true;
    const confirmation = $("#orderConfirmation");
    confirmation.hidden = false;
    $("#orderNumber").textContent = order.orderNumber;
    $("#confirmationTotal").textContent = getMoney(order.total);
    if (order.paymentMethod === "card") {
        $("#confirmationMessage").textContent =
            "Your order has been saved in this browser. " +
            "The card payment was simulated; no real payment was processed.";
    } else {
        $("#confirmationMessage").textContent =
            "Your order has been saved in this browser. " +
            "Payment is marked as cash on delivery.";
    }
    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

function setupEventListeners() {
    $$(".option-card input[name='shipping']").forEach((radio) => {
        radio.addEventListener("change", () => {
            updateSelectedOptions();
            updateTotals();
        });
    });
    $$(".payment-card input[name='payment']").forEach((radio) => {
        radio.addEventListener("change", updateSelectedOptions);
    });
    $("#applyCoupon").addEventListener("click", applyCoupon);
    $("#couponCode").addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            event.preventDefault();
            applyCoupon();
        }
    });
    $("#couponCode").addEventListener("input", () => {
        if (couponApplied) {
            couponApplied = false;
            $("#couponMessage").textContent = "";
            $("#couponMessage").className = "coupon-message";
            updateTotals();
        }
    });
    payNowBtn.addEventListener("click", simulateCardPayment);
    checkoutForm.addEventListener("submit", placeOrder);
    $("#agreeTerms").addEventListener("change", () => {
        $("#termsError").textContent = "";
    });
    [$("#fullName"),
     $("#email"),
     $("#phone"),
     $("#address"),
     $("#city")
    ].forEach((input) => {
        input.addEventListener("input", () => {
            clearFieldError(input);
        });
    });
}
document.addEventListener("DOMContentLoaded", initializeCheckout);