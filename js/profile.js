"use strict"
const PROFILE_STORAGE_KEY = "shamamaProfile";
const PROFILE_ORDERS_KEY = "shamamaOrders";
const PROFILE_CART_KEY = "shamamaCart";
const PROFILE_WISHLIST_KEY = "shamamaWishlist";
const PROFILE_NOTIFICATIONS_KEY = "shamamaEmailNotifications";
const $ = (selector) => document.querySelector(selector);
let currentUser = null;

function readStorage(key, fallback = null) {
    try {
        const value = localStorage.getItem(key);
        if (value === null) {
            return fallback;
        }
        return JSON.parse(value);
    } catch (error) {
        console.error("Could not read storage:", key, error);
        return fallback;
    }
}
function writeStorage(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch (error) {
        console.error("Could not save storage:", key, error);
        return false;
    }
}
function getStoredUser(key) {
    for (const storage of [sessionStorage, localStorage]) {
        try {
            const value = storage.getItem(key);
            if (!value) {
                continue;
            }
            const user = JSON.parse(value);
            if (user && typeof user === "object" && user.email) {
                return user;
            }
        } catch (error) {
            console.warn("Could not read user:", key, error);
        }
    }
    return null;
}
function getCurrentUser() {
    const possibleKeys = [
        "shamamaCurrentUser",
        "aw_current_user",
        "currentUser",
        "loggedInUser",
        "shamamaUser"
    ];
    for (const key of possibleKeys) {
        const user = getStoredUser(key);
        if (user) {
            return user;
        }
    }
    return null;
}
function getUserName(user = currentUser) {
    return (
        user?.fullName ||
        user?.name ||
        user?.username ||
        "Reader"
    );
}
function getUserEmail(user = currentUser) {
    return String(user?.email || "").trim().toLowerCase();
}
function isLoggedIn() {
    return Boolean(getUserEmail());
}
function getProfileStorageKey() {
    const email = getUserEmail();
    if (!email) {
        return PROFILE_STORAGE_KEY;
    }
    return `${PROFILE_STORAGE_KEY}_${email}`;
}

function getSavedProfile() {
    return readStorage(getProfileStorageKey(), {});
}
function getCustomerName() {
    const savedProfile = getSavedProfile();
    return (
        savedProfile.fullName ||
        getUserName() ||
        "Reader"
    );
}
function loadProfile() {
    currentUser = getCurrentUser();
    if (!currentUser) {
        showLoginMessage();
        return;
    }
    const savedProfile = getSavedProfile();
    const fullNameInput = $("#fullName");
    const phoneInput = $("#phone");
    const countryInput = $("#country");
    const addressInput = $("#address");
    const cityInput = $("#city");
    const postalCodeInput = $("#postalCode");
    if (fullNameInput) {
        fullNameInput.value =
            savedProfile.fullName || getUserName();
    }
    if (phoneInput) {
        phoneInput.value = savedProfile.phone || "";
    }
    if (countryInput) {
        countryInput.value = savedProfile.country || "";
    }
    if (addressInput) {
        addressInput.value = savedProfile.address || "";
    }
    if (cityInput) {
        cityInput.value = savedProfile.city || "";
    }
    if (postalCodeInput) {
        postalCodeInput.value = savedProfile.postalCode || "";
    }
    updateWelcome();
    loadStatistics();
    loadOrders();
    loadNotificationPreference();
}
function showLoginMessage() {
    const message = "Please log in to view your profile.";
    if (typeof Swal !== "undefined") {
        Swal.fire({
            icon: "warning",
            title: "Login Required",
            text: message,
            confirmButtonText: "Go to Login"
        }).then(() => {
            window.location.href = "login.html";
        });
    } else {
        alert(message);
        window.location.href = "login.html";
    }
}
function updateWelcome() {
    const nameInput = $("#fullName");
    const emailInput = $("#profileEmail");
    const savedProfile = getSavedProfile();
    const name = nameInput?.value.trim() || savedProfile.fullName || getUserName();
    const email = emailInput?.value.trim() || getUserEmail();
    const welcomeName = $("#welcomeName");
    const welcomeEmail = $("#welcomeEmail");
    const avatar = $("#welcomeAvatar");
    if (welcomeName) {
        welcomeName.textContent = name;
    }
    if (welcomeEmail) {
        welcomeEmail.textContent = email || "Your personal reading space";
    }
    if (avatar) {
        avatar.textContent =
            name.charAt(0).toUpperCase() || "R";
    }
}
function getCustomerOrders() {
    const allOrders = readStorage(PROFILE_ORDERS_KEY, []);
    const email = getUserEmail();
    if (!Array.isArray(allOrders) || !email) {
        return [];
    }
    return allOrders.filter((order) => {
        const orderEmail = order?.customer?.email || order?.customerEmail ||
            order?.userEmail || order?.email || "";
        return String(orderEmail).trim().toLowerCase() === email;
    });
}
function getOrderItems(order) {
    return Array.isArray(order?.items) ? order.items : [];
}
function formatPrice(price) {
    const amount = Number(price) || 0;
    return `$${amount.toFixed(2)}`;
}
function formatDate(dateValue) {
    if (!dateValue) {
        return "Date unavailable";
    }
    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) {
        return "Date unavailable";
    }
    return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric"
    });
}
function loadOrders() {
    const container = $("#ordersContainer");
    if (!container) {
        return;
    }
    const orders = getCustomerOrders();
    if (orders.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <p>You have not placed any orders yet.</p>
                <a href="shop.html">Explore Books</a>
            </div>
        `;
        return;
    }
    container.innerHTML = orders
        .slice()
        .reverse()
        .map((order) => {
            const orderNumber = order.orderNumber || "Order";
            const createdAt = order.createdAt || order.date;
            const items = getOrderItems(order);
            const total = Number(order.total) || items.reduce((sum, item) => {
                    return sum +
                        (Number(item.price) || 0) *
                        (Number(item.quantity) || 1);
                }, 0);
            const status = order.status || order.paymentStatus || "Processing";
            const itemCount = items.reduce((sum, item) => {
                return sum + (Number(item.quantity) || 1);
            }, 0);
            return `
                <article class="order-card">
                    <div class="order-header">
                        <div>
                            <h3>${escapeHTML(orderNumber)}</h3>
                            <p>${formatDate(createdAt)}</p>
                        </div>
                        <span class="order-status">
                            ${escapeHTML(status)}
                        </span>
                    </div>
                    <div class="order-details">
                        <p>
                            <strong>Books:</strong>
                            ${itemCount}
                        </p>
                        <p>
                            <strong>Total:</strong>
                            ${formatPrice(total)}
                        </p>
                    </div>
                    <div class="order-items">
                        ${items.map((item) => `
                            <div class="order-item">
                                <span>
                                    ${escapeHTML(item.title || "Book")}
                                    × ${Number(item.quantity) || 1}
                                </span>
                                <span>
                                    ${formatPrice(
                                        (Number(item.price) || 0) *
                                        (Number(item.quantity) || 1)
                                    )}
                                </span>
                            </div>
                        `).join("")}
                    </div>
                </article>
            `;
        })
        .join("");
}
function getCartItems() {
    const cart = readStorage(PROFILE_CART_KEY, []);
    return Array.isArray(cart) ? cart : [];
}
function getWishlistItems() {
    const wishlist = readStorage(PROFILE_WISHLIST_KEY, []);
    return Array.isArray(wishlist) ? wishlist : [];
}
function getCartCount() {
    return getCartItems().reduce((total, item) => {
        return total + Math.max(0, Number(item.quantity) || 1);
    }, 0);
}
function getWishlistCount() {
    return getWishlistItems().length;
}
function loadStatistics() {
    const orders = getCustomerOrders();
    const cartCount = getCartCount();
    const wishlistCount = getWishlistCount();
    const totalOrders = $("#totalOrders");
    const totalCart = $("#totalCart");
    const totalWishlist = $("#totalWishlist");
    if (totalOrders) {
        totalOrders.textContent = orders.length;
    }
    if (totalCart) {
        totalCart.textContent = cartCount;
    }
    if (totalWishlist) {
        totalWishlist.textContent = wishlistCount;
    }
}

function saveProfile(event) {
    if (event) {
        event.preventDefault();
    }
    if (!currentUser) {
        currentUser = getCurrentUser();
    }
    if (!currentUser) {
        showLoginMessage();
        return;
    }
    const fullNameInput = $("#fullName");
    const profile = { fullName: fullNameInput?.value.trim() || getUserName(),
        phone: $("#phone")?.value.trim() || "",
        country: $("#country")?.value.trim() || "",
        address: $("#address")?.value.trim() || "",
        city: $("#city")?.value.trim() || "",
        postalCode: $("#postalCode")?.value.trim() || ""
    };
    if (profile.fullName.length < 3) {
        showMessage(
            "error", "Invalid Name",
            "Your name must contain at least 3 characters."
        );
        return;
    }
    const saved = writeStorage( getProfileStorageKey(), profile);
    if (!saved) {
        showMessage( "error", "Save Failed",
            "Your profile could not be saved."
        );
        return;
    }
    updateWelcome();
    showMessage( "success",
        "Profile Updated",
        "Your profile information has been saved."
    );
}
function loadNotificationPreference() {
    const checkbox = $("#emailNotifications");
    if (!checkbox) {
        return;
    }
    const savedValue = readStorage( PROFILE_NOTIFICATIONS_KEY, false);
    checkbox.checked = savedValue === true;
}
function saveNotificationPreference() {
    const checkbox = $("#emailNotifications");
    if (!checkbox) {
        return;
    }
    writeStorage( PROFILE_NOTIFICATIONS_KEY, checkbox.checked);
}
function logout() {
    const confirmLogout = () => {
        const keysToRemove = [ "shamamaCurrentUser", "aw_current_user",
            "currentUser", "loggedInUser", "shamamaUser"];
        for (const key of keysToRemove) {
            localStorage.removeItem(key);
            sessionStorage.removeItem(key);
        }
        window.location.href = "login.html";
    };
    if (typeof Swal !== "undefined") {
        Swal.fire({
            title: "Log out?",
            text: "Are you sure you want to log out?",
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Log Out",
            cancelButtonText: "Cancel"
        }).then((result) => {
            if (result.isConfirmed) {
                confirmLogout();
            }
        });
    } else if (confirm("Are you sure you want to log out?")) {
        confirmLogout();
    }
}
function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, (character) => {
        const entities = { "&": "&amp;", "<": "&lt;", ">": "&gt;",  '"': "&quot;", "'": "&#39;"};
        return entities[character];
    });
}


function showMessage(icon, title, text) {
    if (typeof Swal !== "undefined") {
        Swal.fire({
            icon,
            title,
            text,
            confirmButtonColor: "#b4935b"
        });
    } else {
        alert(`${title}\n${text}`);
    }
}

document.addEventListener("DOMContentLoaded", function () {
    loadProfile();
    const profileForm = $("#profileForm");
    if (profileForm) {
        profileForm.addEventListener("submit", saveProfile);
    }
    const cancelButton = $("#cancelChanges");
    if (cancelButton) {
        cancelButton.addEventListener("click", function () {
            loadProfile();
        });
    }
    const notificationCheckbox = $("#emailNotifications");
    if (notificationCheckbox) {
        notificationCheckbox.addEventListener("change",
            saveNotificationPreference
        );
    }
    const logoutButtons = [ "#logoutBtn", "#sidebarLogout", "#settingsLogout"];
    logoutButtons.forEach(function (selector) {
        const button = $(selector);
        if (button) {
            button.addEventListener("click", function (event) {
                event.preventDefault();
                logout();
            });
        }
    });
    const passwordButton = $("#passwordBtn");
    if (passwordButton) {
        passwordButton.addEventListener("click", function () {
            showMessage( "info", "Password Settings",
                "Password changing is not available yet."
            );
        });
    }
    const nameInput = $("#fullName");

    if (nameInput) {
        nameInput.addEventListener("input", updateWelcome);
    }
    window.addEventListener("storage", function (event) {
        if (
            event.key === PROFILE_ORDERS_KEY ||
            event.key === PROFILE_CART_KEY ||
            event.key === PROFILE_WISHLIST_KEY
        ) {
            loadStatistics();
            loadOrders();
        }
    });
});
