"use strict";
const bookGrid = document.querySelector(".book-grid");
const filterButtons = document.querySelectorAll(".filter-button");
const sortSelect = document.querySelector("#sortSelect");
const pagination = document.querySelector("#pagination");
const ROMANCE_BOOKS_URL = "data/books.json";
const BOOKS_PER_PAGE = 4;
const cards = Array.from(
    bookGrid.querySelectorAll(".book-card")
);
let bookData = [];
let currentFilter = "all";
let currentSort = "featured";
let currentPage = 1;

async function loadBookData() {
    try {
        const response = await fetch(ROMANCE_BOOKS_URL);
        if (!response.ok) {
            throw new Error("Could not load books.json");
        }
        bookData = await response.json();
        filterAndSortBooks();
    } catch (error) {
        console.error("Error loading books:", error);
        bookGrid.innerHTML =
            '<p class="empty-message">Unable to load books. Please check books.json and run the page using Live Server.</p>';
        pagination.style.display = "none";
    }
}

function getBookData(card) {
    const id = Number(card.dataset.id);
    return bookData.find(book => book.id === id);
}
function matchesFilter(book) {
    if (!book || !Array.isArray(book.category)) {
        return false;
    }
    if (currentFilter === "all") {
        return book.category.includes("romance");
    }
    if (currentFilter === "classic") {
        return book.category.includes("romance") &&
               book.category.includes("classic");
    }
    if (currentFilter === "contemporary") {
        return book.category.includes("romance") &&
               book.category.includes("contemporary");
    }
    if (currentFilter === "young-adult") {
        return book.category.includes("romance") &&
               book.category.includes("young-adult");
    }
    return false;
}
function sortBooks(books) {
    return books.sort((a, b) => {
        switch (currentSort) {
            case "newest":
                return new Date(b.book.date) -
                       new Date(a.book.date);
            case "price-low":
                return a.book.price - b.book.price;
            case "price-high":
                return b.book.price - a.book.price;
            case "rating":
                return b.book.rating - a.book.rating;
            default:
                return a.book.featured - b.book.featured;
        }
    });
}

function filterAndSortBooks() {
    const matchingCards = cards
        .map(card => ({
            card: card,
            book: getBookData(card)
        }))
        .filter(item => matchesFilter(item.book));
    sortBooks(matchingCards);
    const totalPages = Math.ceil(
        matchingCards.length / BOOKS_PER_PAGE
    );
    if (currentPage > totalPages) {
        currentPage = Math.max(1, totalPages);
    }

    
    cards.forEach(card => {
        card.style.display = "none";
    });

    const startIndex = (currentPage - 1) * BOOKS_PER_PAGE;
    const pageCards = matchingCards.slice(startIndex, startIndex + BOOKS_PER_PAGE);
    pageCards.forEach(item => {
        bookGrid.appendChild(item.card);
        item.card.style.display = "";
    });
    showEmptyMessage(matchingCards.length === 0);
    renderPagination(totalPages);
}

function showEmptyMessage(isEmpty) {
    let message = bookGrid.querySelector(".empty-message");
    if (isEmpty && !message) {
        message = document.createElement("p");
        message.className = "empty-message";
        message.textContent = "No books found in this category.";
        bookGrid.appendChild(message);
    }
    if (!isEmpty && message) {
        message.remove();
    }
}
function renderPagination(totalPages) {
    pagination.innerHTML = "";
    if (totalPages <= 1) {
        pagination.style.display = "none";
        return;
    }
    pagination.style.display = "flex";
    const previousButton = document.createElement("button");
    previousButton.className = "page-arrow";
    previousButton.type = "button";
    previousButton.dataset.page = "prev";
    previousButton.disabled = currentPage === 1;
    previousButton.setAttribute("aria-label", "Previous page");
    previousButton.innerHTML = '<i class="fa-solid fa-angle-left"></i>';
    pagination.appendChild(previousButton);

    
    for (let page = 1; page <= totalPages; page++) {
        const pageButton = document.createElement("button");
        pageButton.className = "page-number";
        pageButton.type = "button";
        pageButton.textContent = page;
        pageButton.dataset.page = page;
        if (page === currentPage) {
            pageButton.classList.add("active");
            pageButton.setAttribute("aria-current", "page");
        }
        pagination.appendChild(pageButton);
    }

    const nextButton = document.createElement("button");
    nextButton.className = "page-arrow";
    nextButton.type = "button";
    nextButton.dataset.page = "next";
    nextButton.disabled = currentPage === totalPages;
    nextButton.setAttribute("aria-label", "Next page");
    nextButton.innerHTML = '<i class="fa-solid fa-angle-right"></i>';
    pagination.appendChild(nextButton);
}

filterButtons.forEach(button => {
    button.addEventListener("click", () => {
        filterButtons.forEach(item => {
            item.classList.remove("active");
        });
        button.classList.add("active");
        currentFilter = button.dataset.filter;
        currentPage = 1;
        filterAndSortBooks();
    });
});

sortSelect.addEventListener("change", () => {
    currentSort = sortSelect.value;
    currentPage = 1;
    filterAndSortBooks();
});
pagination.addEventListener("click", event => {
    const button = event.target.closest("button[data-page]");
    if (!button || button.disabled) {
        return;
    }
    const pageValue = button.dataset.page;
    if (pageValue === "prev") {
        currentPage--;
    } else if (pageValue === "next") {
        currentPage++;
    } else {
        currentPage = Number(pageValue);
    }
    filterAndSortBooks();
});
loadBookData();