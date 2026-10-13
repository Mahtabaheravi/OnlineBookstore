const searchForm = document.getElementById("searchForm");
const searchInput = document.getElementById("searchInput");
const clearSearch = document.getElementById("clearSearch");
const searchResults = document.getElementById("searchResults");
const searchMessage = document.getElementById("searchMessage");
const resultsTitle = document.getElementById("resultsTitle");
const resultsCount = document.getElementById("resultsCount");
let books = [];
function showMessage(title, description, icon) {
    searchMessage.innerHTML = "";
    const iconElement = document.createElement("i");
    iconElement.className = icon;
    const heading = document.createElement("h3");
    heading.textContent = title;
    const paragraph = document.createElement("p");
    paragraph.textContent = description;
    searchMessage.append(iconElement, heading, paragraph);
    searchMessage.style.display = "block";
}
function updateClearButton() {
    clearSearch.classList.toggle("visible", searchInput.value.length > 0);
}
function searchBooks(query) {
    const searchTerm = query.trim().toLowerCase();
    searchResults.innerHTML = "";
    if (!searchTerm) {
        resultsTitle.textContent = "Discover Books";
        resultsCount.textContent = "0 books";
        showMessage("What would you like to read?", "Enter a book title, author's name, or genre to get started.", "fa-solid fa-book-open");
        return;
    }
    const filteredBooks = books.filter(function (book) {
        const title = String(book.title || "").toLowerCase();
        const author = String(book.author || "").toLowerCase();
        const category = String(book.category || book.genre || "").toLowerCase();
        return title.includes(searchTerm) || author.includes(searchTerm) || category.includes(searchTerm);});
    resultsTitle.textContent = "Search Results";
    resultsCount.textContent = filteredBooks.length + ( filteredBooks.length === 1 ? " book" : " books");
    if (filteredBooks.length === 0) {
        showMessage("No books found", "Try another title, author, or genre.", "fa-solid fa-book-open");
        return;
    }
    searchMessage.style.display = "none";
    filteredBooks.forEach(function (book, index) {
        const card = document.createElement("article");
        card.className = "search-book-card";
        card.style.animationDelay = (index * 0.05) + "s";
        const cover = document.createElement("div");
        cover.className = "search-book-cover";
        const image = document.createElement("img");
        image.src = book.image || book.cover || book.imageUrl || book.coverImage || book.img || "pic/lastlogo.png";
        image.alt = book.title || "Book cover";
        image.loading = "lazy";
        image.onerror = function () {
            image.onerror = null;
            image.src = "pic/lastlogo.png";
            image.style.objectFit = "contain";
        };
        cover.appendChild(image);
        const info = document.createElement("div");
        info.className = "search-book-info";
        const title = document.createElement("h3");
        title.textContent = book.title || "Untitled Book";
        const author = document.createElement("p");
        author.textContent = book.author || "Unknown Author";
        info.append(title, author);
        const category = book.category || book.genre;
        if (category) {
            const categoryElement = document.createElement("span");
            categoryElement.className = "search-book-category";
            categoryElement.textContent = category;
            info.appendChild(categoryElement);
        }
        if (book.price !== undefined && book.price !== null) {
            const price = document.createElement("span");
            price.className = "search-book-price";
            price.textContent = typeof book.price === "number" ? "$" + book.price.toFixed(2) : String(book.price).startsWith("$") ? book.price : "$" + book.price;
            info.appendChild(price);
        }
        const link = document.createElement("a");
        link.className = "search-book-link";
        link.href = "book-detail.html?id=" + encodeURIComponent(book.id ?? book.title ?? "");
        link.textContent = "View Book";
        info.appendChild(link);
        card.append(cover, info);
        searchResults.appendChild(card);
    });
}
searchForm.addEventListener("submit", function (event) {
    event.preventDefault();
    searchBooks(searchInput.value);
});
searchInput.addEventListener("input", function () {
    updateClearButton();
    searchBooks(searchInput.value);
});
clearSearch.addEventListener("click", function () {
    searchInput.value = "";
    updateClearButton();
    searchBooks("");
    searchInput.focus();
});
async function loadBooks() {
    try {
        const response = await fetch("data/books.json");
        if (!response.ok) {
            throw new Error("Could not load books.");
        }
        const data = await response.json();
        if (!Array.isArray(data)) {
            throw new Error("The books data must be an array.");
        }
        books = data;
        const params = new URLSearchParams(window.location.search);
        const initialQuery = params.get("q") || "";
        searchInput.value = initialQuery;
        updateClearButton();
        if (initialQuery.trim()) {
            searchBooks(initialQuery);
        } else {
            searchBooks("");
        }
    } catch (error) {
        console.error("Search error:", error);
        resultsTitle.textContent = "Search Unavailable";
        resultsCount.textContent = "0 books";
        showMessage("We couldn't load the books", "Check that data/books.json exists and run the website using Live Server.", "fa-solid fa-triangle-exclamation");
    }
}
loadBooks();