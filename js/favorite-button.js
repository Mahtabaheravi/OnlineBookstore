const WISHLIST_KEY = "shamamaWishlist";
const WISHLIST_BOOKS_URL = "data/books.json";

function getWishlist() {
    try {
        const wishlist = JSON.parse(localStorage.getItem(WISHLIST_KEY)) || [];
        return [...new Set(wishlist.map(Number).filter(Number.isFinite))];
    } catch (error) {
        return [];
    }
}

function saveWishlist(wishlist) {
    localStorage.setItem( WISHLIST_KEY, JSON.stringify(wishlist));
    updateWishlistCount();
    updateFavoriteButtons();
}

function updateWishlistCount() {
    const total = getWishlist().length;
    document.querySelectorAll(".wishlist-count").forEach(element => {
        element.textContent = total;
    });
}

function updateFavoriteButtons() {
    const wishlist = getWishlist();
    document.querySelectorAll(".favorite-btn").forEach(button => {
        const bookId = Number(button.dataset.id);
        const isFavorite = wishlist.includes(bookId);
        const heart = button.querySelector("i");
        button.classList.toggle("active", isFavorite);
        button.setAttribute("aria-label", isFavorite ? "Remove from wishlist" : "Add to wishlist");
        if (heart) {
            heart.classList.toggle("fa-solid", isFavorite);
            heart.classList.toggle("fa-regular", !isFavorite);
        }
    });
}

function toggleFavorite(bookId) {
    const id = Number(bookId);
    if (!Number.isFinite(id)) {
        console.error("Invalid book ID:", bookId);
        return;
    }
    const wishlist = getWishlist();
    const updatedWishlist = wishlist.includes(id)
        ? wishlist.filter(item => item !== id)
        : [...wishlist, id];
    saveWishlist(updatedWishlist);
    renderWishlist();
}

async function getWishlistBooks() {
    const response = await fetch(WISHLIST_BOOKS_URL);
    if (!response.ok) {
        throw new Error("Could not load books.json");
    }
    return await response.json();
}
async function renderWishlist() {
    const container = document.getElementById("wishlistItems");
    if (!container) return;
    try {
        const books = await getWishlistBooks();
        const wishlist = getWishlist();
        container.innerHTML = "";
        const savedBooks = books.filter(book => wishlist.includes(Number(book.id)));
        if (savedBooks.length === 0) {
            container.innerHTML = `
                <div class="empty-wishlist">
                    <i class="fa-regular fa-heart"></i>
                    <h2>Your Wishlist Is Empty</h2>
                    <p>Save your favorite books and find them here later.</p>
                    <a href="shop.html">Explore Books</a>
                </div>
            `;
            return;
        }
        savedBooks.forEach(book => {
            const item = document.createElement("article");
            item.className = "wishlist-item";
            const price = Number(book.price);
            const priceText = Number.isFinite(price)
                ? `$${price.toFixed(2)}`
                : "Price unavailable";
            item.innerHTML = `
                <img src="${book.image}" alt="${book.title}">
                <div class="wishlist-item-info">
                    <h3>${book.title}</h3>
                    <p>${book.author}</p>
                    <strong>${priceText}</strong>
                </div>
                <div class="wishlist-item-actions">
                    <button type="button" class="wishlist-remove" data-remove-id="${book.id}"> <i class="fa-solid fa-heart-crack"></i> Remove</button>
                    <button type="button" class="wishlist-add-cart" data-cart-id="${book.id}"> Add to Cart</button>
                </div>
            `;
            container.appendChild(item);
        });
    } catch (error) {
        console.error("Wishlist error:", error);
        container.textContent = "Could not load your wishlist. Check the JSON file path.";
    }
}

document.addEventListener("click", event => {
    const button = event.target.closest(".favorite-btn");
    if (!button) return;
    event.preventDefault();
    const bookId = button.dataset.id;
    if (bookId !== undefined) {
        toggleFavorite(bookId);
    }
});
document.addEventListener("click", event => {
    const button = event.target.closest("[data-remove-id]");
    if (!button) return;
    const id = Number(button.dataset.removeId);
    const wishlist = getWishlist().filter(bookId => bookId !== id);
    saveWishlist(wishlist);
    renderWishlist();
});

document.addEventListener("click", event => {
    const button = event.target.closest("[data-cart-id]");
    if (!button) return;
    const bookId = button.dataset.cartId;
    if (typeof addToCart === "function") {
        addToCart(bookId);
    } else {
        console.error("addToCart() is unavailable. Check that cart.js is loaded.");
    }
});

window.addEventListener("storage", event => {
    if (event.key === WISHLIST_KEY) {
        updateWishlistCount();
        updateFavoriteButtons();
        renderWishlist();
    }
});
updateWishlistCount();
updateFavoriteButtons();
renderWishlist();