const reviewForm = document.querySelector(".bd-review-form");
const reviewList = document.querySelector(".bd-reviews-list");
const starContainer = document.querySelector(".bd-star-input-icons");
const ratingMessage = document.querySelector(".bd-selected-rating");

const ratingInput = document.querySelector(".bd-rating-summary .bd-big-num");
const totalReviewsText = document.querySelector(".bd-rating-summary > span:last-child");
const ratingLink = document.querySelector(".bd-rating-link");
const ratingBars = document.querySelectorAll(".bd-bar");
let selectedRating = 0;


const stars = starContainer.querySelectorAll("[data-rating]");
function updateStars(rating) {
    stars.forEach((star) => {
        const starNumber = Number(star.dataset.rating);
        if (starNumber <= rating) {
            star.classList.remove("fa-regular");
            star.classList.add("fa-solid");
        } else {
            star.classList.remove("fa-solid");
            star.classList.add("fa-regular");
        }
    });
}
function selectRating(rating) {
    selectedRating = rating;
    updateStars(rating);
    ratingMessage.textContent = `${rating} out of 5 stars`;
}
stars.forEach((star) => {
    star.style.cursor = "pointer";
    star.addEventListener("click", () => {
        selectRating(Number(star.dataset.rating));
    });
    star.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            selectRating(Number(star.dataset.rating));
        }
    });
});
function createStars(rating, size = "sm") {
    const container = document.createElement("div");
    container.className = `bd-stars ${size}`;
    for (let i = 1; i <= 5; i++) {
        const star = document.createElement("i");
        if (i <= rating) {
            star.className = "fa-solid fa-star";
        } else {
            star.className = "fa-regular fa-star";
        }
        container.appendChild(star);
    }
    return container;
}

function createReview(name, rating, comment, helpful = 0) {
    const review = document.createElement("div");
    review.className = "bd-review";
    review.dataset.rating = rating;
    const avatar = document.createElement("div");
    avatar.className = "review-avatar";

    avatar.textContent = name.trim() .split(/\s+/) .slice(0, 2) .map((word) => word.charAt(0).toUpperCase()) .join("");
    const body = document.createElement("div");
    body.className = "bd-review-body";
    const top = document.createElement("div");
    top.className = "bd-review-top";
    const reviewerName = document.createElement("h4");
    reviewerName.textContent = name;
    const date = document.createElement("span");
    date.textContent = "Just now";
    top.append(reviewerName, date);
    const stars = createStars(rating);
    const text = document.createElement("p");
    text.textContent = comment;
    const helpfulButton = document.createElement("button");
    helpfulButton.type = "button";
    helpfulButton.className = "bd-helpful";
    helpfulButton.innerHTML = '<i class="fa-regular fa-thumbs-up"></i> ';
    const helpfulCount = document.createElement("span");
    helpfulCount.textContent = `Helpful (${helpful})`;
    helpfulButton.appendChild(helpfulCount);

    helpfulButton.dataset.helpful = helpful;
    body.append(top, stars, text, helpfulButton);
    review.append(avatar, body);
    return review;
}
reviewForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const nameInput = reviewForm.querySelector(
        'input[type="text"]'
    );
    const emailInput = reviewForm.querySelector(
        'input[type="email"]'
    );
    const commentInput = reviewForm.querySelector("textarea");
    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const comment = commentInput.value.trim();
    if (!name || !email || !comment) {
        alert("Please complete all fields before posting.");
        return;
    }
    if (!emailInput.validity.valid) {
        alert("Please enter a valid email address.");
        emailInput.focus();
        return;
    }
    if (selectedRating === 0) {
        alert("Please select a star rating first.");
        starContainer.querySelector("i").focus();
        return;
    }
    const newReview = createReview(name, selectedRating, comment);
    const loadMoreButton = reviewList.querySelector( ".bd-load-more");
    if (loadMoreButton) {
        reviewList.insertBefore(newReview, loadMoreButton);
    } else {
        reviewList.appendChild(newReview);
    }
    updateReviewStatistics();
    reviewForm.reset();
    selectedRating = 0;
    updateStars(0);
    ratingMessage.textContent = "Select a rating";
    newReview.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });
});

function updateReviewStatistics() {
    const reviews = Array.from(
        reviewList.querySelectorAll(".bd-review")
    );
    const total = reviews.length;
    if (total === 0) {
        return;
    }
    const ratings = reviews.map((review) => {
       
        if (review.dataset.rating) {
            return Number(review.dataset.rating);
        }
        
        const starIcons = review.querySelectorAll(".bd-stars i");
        let rating = 0;
        starIcons.forEach((star) => {
            if (
                star.classList.contains("fa-star") &&
                star.classList.contains("fa-solid")
            ) {
                rating += 1;
            } else if (
                star.classList.contains("fa-star-half-stroke")
            ) {
                rating += 0.5;
            }
        });
        return rating;
    });
    const totalRating = ratings.reduce((sum, rating) => sum + rating, 0);
    const average = totalRating / total;

    ratingInput.textContent = average.toFixed(1);
    totalReviewsText.textContent = `${total} total reviews`;
    if (ratingLink) {
        ratingLink.textContent = `${total.toLocaleString()} reviews`;
    }
    ratingBars.forEach((bar, index) => {
        const targetRating = 5 - index;
        const count = ratings.filter((rating) => Math.floor(rating) === targetRating).length;
        const percentage = Math.round((count / total) * 100);
        const fill = bar.querySelector(".bd-fill");
        const labels = bar.querySelectorAll("span");
        fill.style.width = `${percentage}%`;
        labels[1].textContent = `${percentage}%`;
    });
    const summaryStars = document.querySelector(".bd-rating-summary .bd-stars");
    if (summaryStars) {
        summaryStars.replaceWith(createStars(Math.round(average), "lg"));
    }
}

reviewList.addEventListener("click", (event) => {
    const button = event.target.closest(".bd-helpful");
    if (!button) {
        return;
    }
    const review = button.closest(".bd-review");
    if (!review) {
        return;
    }
    const reviewId = Array.from(
        reviewList.querySelectorAll(".bd-review")
    ).indexOf(review);
    const storageKey = `shamama-helpful-${reviewId}`;
    if (sessionStorage.getItem(storageKey)) {
        alert("You have already marked this review as helpful.");
        return;
    }
    const currentCount = Number(button.dataset.helpful || 0);
    const newCount = currentCount + 1;
    button.dataset.helpful = newCount;
    button.querySelector("span").textContent = `Helpful (${newCount})`;
    sessionStorage.setItem(storageKey, "true");
    button.disabled = true;
    button.style.opacity = "0.6";
});

updateReviewStatistics();