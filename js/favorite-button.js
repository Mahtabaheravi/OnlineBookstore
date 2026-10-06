const favoriteButtons = document.querySelectorAll(".favorite-btn");
const wishlistCount = document.querySelector(".nav-count");

favoriteButtons.forEach(function(button){
    button.addEventListener("click", function(event){
    event.preventDefault();
    const heart = button.querySelector("i");
    if (heart.classList.contains("fa-solid")){
        heart.classList.remove("fa-solid");
        heart.classList.add("fa-regular");
        let count = Number(wishlistCount.textContent);
        count--;
        wishlistCount.textContent = count
    }else{
        heart.classList.remove("fa-regular");
        heart.classList.add("fa-solid");
        let count = Number(wishlistCount.textContent);
        count++;
        wishlistCount.textContent = count;
    }
    });
});