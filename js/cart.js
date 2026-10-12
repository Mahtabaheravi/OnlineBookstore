const CART_KEY = "shamamaCart";
const BOOKS_URL = "data/books.json";
function getCart() {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
}

function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    updateCartCount();
}

async function getBooks() {
    const response = await fetch(BOOKS_URL);
    if (!response.ok) {
        throw new Error("Could not load books.json");
    }
    return await response.json();
}

function updateCartCount() {
    const cart = getCart();
    const totalItems = cart.reduce((total, item) => {
        return total + item.quantity;
    }, 0);
    document.querySelectorAll(".cart-count").forEach(count => {
        count.textContent = totalItems;
    });
}

async function addToCart(bookId) {
    try {
        const books = await getBooks();
        const book = books.find(item => item.id === Number(bookId));
        if (!book) {
            console.error("Book not found:", bookId);
            return;
        }
        const cart = getCart();
        const existingBook = cart.find(item => item.id === book.id);
        if (existingBook) {
            existingBook.quantity += 1;
        } else {
            cart.push({id: book.id, quantity: 1});
        }
        saveCart(cart);
    } catch (error) {
        console.error("Error adding book:", error);
    }
}
function removeFromCart(bookId) {
    const cart = getCart().filter(item => {
        return item.id !== Number(bookId);
    });
    saveCart(cart);
    renderCart();
}
function changeQuantity(bookId, amount) {
    const cart = getCart();
    const book = cart.find(item => item.id === Number(bookId));
    if (!book) return;
    book.quantity += amount;
    if (book.quantity <= 0) {
        removeFromCart(bookId);
        return;
    }
    saveCart(cart);
    renderCart();
}
async function renderCart() {
    const cartContainer = document.getElementById("cartItems");
    const totalElement = document.getElementById("cartTotal");
    const subtotalElement = document.getElementById("cartSubtotal");
    if (!cartContainer) return;
    try {
        const books = await getBooks();
        const cart = getCart();
        cartContainer.innerHTML = "";
        if (cart.length === 0) {
            cartContainer.innerHTML = `
                <div class="empty-cart">
                    <i class="fa-solid fa-basket-shopping"></i>
                    <h2>Your cart is empty</h2>
                    <p>Discover a book and add it to your cart.</p>
                    <a href="shop.html">Explore Books</a>
                </div>
            `;
            if (subtotalElement) subtotalElement.textContent = "$0.00";
            if (totalElement) totalElement.textContent = "$0.00";
            return;
        }
        let subtotal = 0;
        cart.forEach(cartItem => {
            const book = books.find(item => item.id === cartItem.id);
            if (!book) return;
            const itemTotal = book.price * cartItem.quantity;
            subtotal += itemTotal;
            const item = document.createElement("article");
            item.className = "cart-item";
            item.innerHTML = `
                <img
                    class="cart-item-image"
                    src="${book.image}"
                    alt="${book.title}"
                >
                <div class="cart-item-info">
                    <h3>${book.title}</h3>
                    <p>${book.author}</p>
                    <span>$${book.price.toFixed(2)}</span>
                </div>
                <div class="cart-item-quantity">
                    <button type="button" data-action="decrease" data-id="${book.id}" aria-label="Decrease quantity">−</button>
                    <span>${cartItem.quantity}</span>
                    <button type="button" data-action="increase" data-id="${book.id}" aria-label="Increase quantity">+</button>
                </div>
                <div class="cart-item-total">
                    <strong>$${itemTotal.toFixed(2)}</strong>
                    <button type="button" class="remove-cart-item" data-action="remove" data-id="${book.id}">Remove</button>
                </div>
            `;
            cartContainer.appendChild(item);
        });
        if (subtotalElement) {
            subtotalElement.textContent = `$${subtotal.toFixed(2)}`;
        }
        if (totalElement) {
            totalElement.textContent = `$${subtotal.toFixed(2)}`;
        }
    } catch (error) {
        console.error("Error rendering cart:", error);
        cartContainer.textContent = "Could not load your cart. Please try again.";
    }
}


document.addEventListener("click", event => {
    const button = event.target.closest(
        ".cart-btns, .cart-btn, .bd-btn-cart"
    );

    if (!button) return;
    const card = button.closest(".shop-card, .book-row");
    const bookId = button.dataset.id || card?.dataset.id;
    if (bookId !== undefined) {
        addToCart(bookId);
    } else {
        console.error("Book ID is missing.");
    }
});




document.addEventListener("click", event => {
    const button = event.target.closest("[data-action]");
    if (!button) return;
    const bookId = button.dataset.id;
    const action = button.dataset.action;
    if (action === "increase") {
        changeQuantity(bookId, 1);
    }
    if (action === "decrease") {
        changeQuantity(bookId, -1);
    }
    if (action === "remove") {
        removeFromCart(bookId);
    }
});

window.addEventListener("storage", event => {
    if (event.key === CART_KEY) {
        updateCartCount();
        if (document.getElementById("cartItems")) {
            renderCart();
        }
    }
});

updateCartCount();
if (document.getElementById("cartItems")) {
    renderCart();
}