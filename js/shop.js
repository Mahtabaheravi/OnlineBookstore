document.addEventListener("DOMContentLoaded", function () {
    const booksGrid = document.getElementById("booksGrid");
    const searchInput = document.getElementById("bookSearch");
    const categoryFilter = document.getElementById("categoryFilter");
    const authorFilter = document.getElementById("authorFilter");
    const priceFilter = document.getElementById("priceFilter");
    const sortFilter = document.getElementById("sortFilter");
    const emptyState = document.getElementById("emptyState");
    const pagination = document.querySelector(".pagination");
    const collectionCount = document.querySelector(".collection-count");
    const collection = document.getElementById("collection");

    if (!booksGrid || !searchInput ||
        !categoryFilter || !authorFilter ||
        !priceFilter || !sortFilter ||
         !emptyState || !pagination ||
        !collectionCount
    ) {
        console.error("Some shop HTML elements are missing.");
        return;
    }
    const BOOKS_PER_PAGE = 3;
    const originalCards = Array.from( booksGrid.querySelectorAll(".book-row"));
    let allBooks = [];
    let filteredBooks = [];
    let currentPage = 1;
    function normalizeCategories(categories) {
        if (Array.isArray(categories)) {
            return categories.flatMap(category => String(category).toLowerCase().split(/\s+/))
                .filter(Boolean);
        }
        return String(categories || "")
            .toLowerCase()
            .split(/\s+/)
            .filter(Boolean);
    }
    function getHTMLBook(card, index) {
        const titleElement = card.querySelector("h3");
        const authorElement = card.querySelector(".book-author");
        const descriptionElement = card.querySelector(".book-description");
        const imageElement = card.querySelector(".book-visual img");
        const priceElement = card.querySelector(".book-price");
        const title = card.dataset.title || (titleElement ? titleElement.textContent.trim() : "");
        const authorName = authorElement ? authorElement.textContent.trim(): "";
        const price = Number(card.dataset.price);
        const rating = Number(card.dataset.rating);
        const id = card.dataset.id || "";
        return {
            id: String(id),
            title: title,
            author: authorName,
            authorSlug: card.dataset.author || "", categories: normalizeCategories(card.dataset.category),
            price: Number.isFinite(price) ? price : Number((priceElement?.textContent || "").replace(/[^\d.]/g, "")) || 0,
            rating: Number.isFinite(rating) ? rating : 0,
            description: descriptionElement ? descriptionElement.textContent.trim() : "",
            image: imageElement ? imageElement.getAttribute("src") : "",
            element: card,
            originalIndex: index,
            date: card.dataset.date || "",
            featured: Number(card.dataset.featured),
            isHTML: true
        };
    }

    function createBookCard(book) {
        const card = document.createElement("article");
        card.className = "book-row";
        card.dataset.id = String(book.id);
        card.dataset.title = book.title;
        card.dataset.author = book.authorSlug;
        card.dataset.category = book.categories.join(" ");
        card.dataset.price = String(book.price);
        card.dataset.rating = String(book.rating);
        if (book.date) {
            card.dataset.date = book.date;
        }
        const visual = document.createElement("div");
        visual.className = "book-visual";
        const bookLink = document.createElement("a");
        bookLink.href = "book-detail.html?id=" + encodeURIComponent(book.id);
        bookLink.className = "book-object";
        const frame = document.createElement("div");
        frame.className = "gold-book-frame";
        const shine = document.createElement("span");
        shine.className = "frame-shine";
        const image = document.createElement("img");
        image.src = book.image;
        image.alt = book.title;
        image.loading = "lazy";
        frame.append(shine, image);
        bookLink.appendChild(frame);
        const favoriteButton = document.createElement("button");
        favoriteButton.type = "button";
        favoriteButton.className = "wishlist-btn favorite-btn";
        favoriteButton.dataset.id = String(book.id);
        favoriteButton.setAttribute("aria-label", "Add " + book.title + " to wishlist");
        const heartIcon = document.createElement("i");
        heartIcon.className = "fa-regular fa-heart";
        favoriteButton.appendChild(heartIcon);
        visual.append(bookLink, favoriteButton);
        const details = document.createElement("div");
        details.className = "book-details";
        const categoryLabel = document.createElement("span");
        categoryLabel.className = "book-category";
        categoryLabel.textContent = book.categories[0]
            ? book.categories[0].toUpperCase() : "BOOK";
        const title = document.createElement("h3");
        title.textContent = book.title;
        const author = document.createElement("p");
        author.className = "book-author";
        author.textContent = book.author;
        const description = document.createElement("p");
        description.className = "book-description";
        description.textContent = book.description || "";
        const meta = document.createElement("div");
        meta.className = "book-meta";
        const rating = document.createElement("div");
        rating.className = "rating";
        const stars = document.createElement("span");
        stars.className = "stars";
        const fullStars = Math.max(0, Math.min(5, Math.round(book.rating)));
        stars.textContent = "★".repeat(fullStars) + "☆".repeat(5 - fullStars);
        const ratingNumber = document.createElement("span");
        ratingNumber.textContent = book.rating.toFixed(1);
        rating.append(stars, ratingNumber);
        const divider = document.createElement("span");
        divider.className = "detail-divider";
        const price = document.createElement("strong");
        price.className = "book-price";
        price.textContent = "$" + book.price.toFixed(2);
        const cartButton = document.createElement("button");
        cartButton.type = "button";
        cartButton.className = "cart-btns";
        cartButton.dataset.id = String(book.id);
        const cartIcon = document.createElement("i");
        cartIcon.className = "fa-solid fa-cart-shopping";
        const cartText = document.createElement("span");
        cartText.textContent = "Add to cart";
        cartButton.append(cartIcon, cartText);
        meta.append(rating, divider, price, cartButton);

        details.append(categoryLabel, title, author, description, meta);
        card.append(visual, details);
        return card;
    }



    function prepareJSONBook(book, index) {
        const categories = normalizeCategories(book.category || book.categories);
        const price = Number(book.price);
        const rating = Number(book.rating);
        const author = String(book.author || "");
        const authorSlug = book.authorSlug ||
            ({
                "franz kafka": "kafka",
                "j.r.r. tolkien": "tolkien",
                "antoine de saint-exupery": "saint-exupery",
                "antoine de saint-exupéry": "saint-exupery",
                "fyodor dostoevsky": "dostoevsky",
                "jane austen": "austen",
                "william somerset maugham": "maugham",
                "somerset maugham": "maugham"
            }[author.toLowerCase()] ||
            author.toLowerCase()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/^-|-$/g, ""));

        return {
            id: String(book.id),
            title: String(book.title || ""),
            author: author,
            authorSlug: authorSlug,
            categories: categories,
            price: Number.isFinite(price) ? price : 0,
            rating: Number.isFinite(rating) ? rating : 0,
            description: String(book.description || ""),
            image: String(book.image || ""),
            originalIndex: originalCards.length + index,
            date: book.date || "",
            featured: Number(book.featured),
            isHTML: false
        };
    }




    async function loadBooks() {
        allBooks = originalCards.map(getHTMLBook);
        try {
            const response = await fetch("data/books.json");
            if (!response.ok) {
                throw new Error("Could not load data/books.json");
            }
            const jsonData = await response.json();
            const jsonBooks = Array.isArray(jsonData)
                ? jsonData
                : jsonData.books;
            if (!Array.isArray(jsonBooks)) {
                throw new Error("The JSON file must contain an array of books.");
            }
    
            const existingIDs = new Set(
                allBooks.map(book => book.id)
            );
            jsonBooks.forEach(function (item, index) {
                const book = prepareJSONBook(item, index);
                if (!book.id || existingIDs.has(book.id)) {
                    return;
                }
                if (!book.title || !book.image) {
                    console.warn("Book is missing a title or image:", item);
                    return;
                }
                book.element = createBookCard(book);
                booksGrid.appendChild(book.element);
                allBooks.push(book);
                existingIDs.add(book.id);
            });
        } catch (error) {
            console.error("Error loading additional books:", error);
        }
        renderBooks();
    }

    


    function matchesFilters(book) {
        const searchTerm = searchInput.value.trim().toLowerCase();
        const selectedCategory = categoryFilter.value;
        const selectedAuthor = authorFilter.value;
        const selectedPrice = priceFilter.value;
        const searchableText = [
            book.title,
            book.author,
            book.authorSlug,
            book.description,
            ...book.categories
        ].join(" ").toLowerCase();
        const matchesSearch = !searchTerm || searchableText.includes(searchTerm);
        const matchesCategory = selectedCategory === "all" || book.categories.includes(selectedCategory);
        const matchesAuthor = selectedAuthor === "all" || book.authorSlug === selectedAuthor;
        let matchesPrice = true;
        switch (selectedPrice) {
            case "under15": matchesPrice = book.price < 15;
                break;
            case "15-25":
                matchesPrice = book.price >= 15 && book.price <= 25;
                break;
            case "25-40":
                matchesPrice = book.price > 25 && book.price <= 40;
                break;
            case "over40":
                matchesPrice = book.price > 40;
                break;
        }
        return (
            matchesSearch &&
            matchesCategory &&
            matchesAuthor &&
            matchesPrice
        );
    }

    



    function sortBooks(bookList) {
        const result = [...bookList];
        switch (sortFilter.value) {
            case "newest":
                result.sort(function (a, b) {
                    if (a.date && b.date) {
                        return b.date.localeCompare(a.date);
                    }
                    if (a.date) return -1;
                    if (b.date) return 1;
                    return Number(b.id) - Number(a.id);
                });
                break;
            case "price-low":
                result.sort((a, b) => a.price - b.price);
                break;
            case "price-high":
                result.sort((a, b) => b.price - a.price);
                break;
            case "rating":
                result.sort((a, b) => b.rating - a.rating);
                break;
            case "featured":
            default:
                result.sort(function (a, b) {
                    const aFeatured = Number.isFinite(a.featured) ? a.featured : a.originalIndex;
                    const bFeatured = Number.isFinite(b.featured) ? b.featured : b.originalIndex;
                    return aFeatured - bFeatured;
                });
        }
        return result;
    }
    function scrollToCollection() {
        if (collection) {
            collection.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        }
    }

    
    function renderPagination(totalPages) {
        pagination.innerHTML = "";
        if (totalPages <= 1) {
            pagination.hidden = true;
            return;
        }
        pagination.hidden = false;
        function addButton(label, className, page, disabled = false) {
            const button = document.createElement("button");
            button.type = "button";
            button.className = className;
            button.textContent = label;
            button.disabled = disabled;
            if (page === currentPage) {
                button.classList.add("active");
                button.setAttribute("aria-current", "page");
            }
            button.addEventListener("click", function () {
                currentPage = page;
                renderBooks();
                scrollToCollection();
            });
            pagination.appendChild(button);
        }
        addButton(
            "←",
            "page-arrow",
            Math.max(1, currentPage - 1),
            currentPage === 1
        );
        let pages = [];
        if (totalPages <= 5) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            pages.push(1);
            if (currentPage > 3) {
                pages.push("...");
            }
            for (
                let i = Math.max(2, currentPage - 1);
                i <= Math.min(totalPages - 1, currentPage + 1);
                i++
            ) {
                pages.push(i);
            }

            if (currentPage < totalPages - 2) {
                pages.push("...");
            }
            pages.push(totalPages);
        }
        pages.forEach(function (page) {
            if (page === "...") {
                const dots = document.createElement("span");
                dots.textContent = "...";
                pagination.appendChild(dots);
                return;
            }
            addButton(
                String(page).padStart(2, "0"),
                "page",
                page
            );
        });
        addButton(
            "→",
            "page-arrow",
            Math.min(totalPages, currentPage + 1),
            currentPage === totalPages
        );
    }

    



    function renderBooks() {
        filteredBooks = sortBooks(allBooks.filter(matchesFilters));
        const totalBooks = filteredBooks.length;
        const totalPages = Math.ceil(totalBooks / BOOKS_PER_PAGE);
        if (totalPages === 0) {
            currentPage = 1;
        } else if (currentPage > totalPages) {
            currentPage = totalPages;
        }
        const startIndex = (currentPage - 1) * BOOKS_PER_PAGE;
        const endIndex = Math.min( startIndex + BOOKS_PER_PAGE, totalBooks);
        const visibleBooks = filteredBooks.slice(startIndex, endIndex);
        const visibleElements = new Set( visibleBooks.map(book => book.element));
        allBooks.forEach(function (book) {
            book.element.hidden = !visibleElements.has(book.element);
        });

        
        visibleBooks.forEach(function (book) {
            booksGrid.appendChild(book.element);
        });
        emptyState.hidden = totalBooks !== 0;
        if (totalBooks === 0) {
            collectionCount.textContent = "Showing 0 books";
        } else {
            collectionCount.textContent = "Showing " + (startIndex + 1) + "–" + endIndex + " of " + totalBooks + " books";
        }
        renderPagination(totalPages);
    }

    function handleFilterChange() {
        currentPage = 1;
        renderBooks();
    }
    searchInput.addEventListener("input", handleFilterChange);
    categoryFilter.addEventListener("change", handleFilterChange);
    authorFilter.addEventListener("change", handleFilterChange);
    priceFilter.addEventListener("change", handleFilterChange);
    sortFilter.addEventListener("change", handleFilterChange);
    loadBooks();
});
