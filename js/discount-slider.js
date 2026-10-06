document.addEventListener("DOMContentLoaded", function () {
    const viewport = document.querySelector(".discount-viewport");
    const track = document.querySelector(".discount-track");
    const cards = document.querySelectorAll(".discount-card");
    const prevButton = document.querySelector(".prev-btn");
    const nextButton = document.querySelector(".next-btn");
    const indicators = document.querySelectorAll(".indicators");
    if (!viewport || !track || cards.length === 0) {
        return;
    }
    let currentIndex = 0;
    function updateSlider() {
        const cardWidth = cards[0].offsetWidth;
        const gap = 15;
        const visibleCards = Math.floor((viewport.clientWidth + gap) / (cardWidth + gap));
        const maxIndex = Math.max(0, cards.length - visibleCards);
        if (currentIndex > maxIndex) {
            currentIndex = 0;
        }
        const moveAmount = currentIndex * (cardWidth + gap);
        track.style.transform = `translateX(-${moveAmount}px)`;
        indicators.forEach(function (indicator) {
            indicator.classList.remove("active");
        });
        if (indicators[currentIndex]) {
            indicators[currentIndex].classList.add("active");
        }
    }
    nextButton.addEventListener("click", function () {
        const cardWidth = cards[0].offsetWidth;
        const gap = 15;
        const visibleCards = Math.floor((viewport.clientWidth + gap) / (cardWidth + gap));
        const maxIndex = Math.max(0, cards.length - visibleCards);
        if (currentIndex < maxIndex) {
            currentIndex++;
        } else {
            currentIndex = 0;
        }
        updateSlider();
    });
    prevButton.addEventListener("click", function () {
        const cardWidth = cards[0].offsetWidth;
        const gap = 15;
        const visibleCards = Math.floor((viewport.clientWidth + gap) / (cardWidth + gap));
        const maxIndex = Math.max(0, cards.length - visibleCards);
        if (currentIndex > 0) {
            currentIndex--;
        } else {
            currentIndex = maxIndex;
        }
        updateSlider();
    });
    window.addEventListener("resize", function () {
        updateSlider();
    });
    updateSlider();
});