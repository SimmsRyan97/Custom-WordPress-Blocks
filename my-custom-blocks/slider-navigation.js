function sliderNavigation() {
    const markers = document.querySelectorAll(".marker");
    const entries = document.querySelector(".entries");

    markers.forEach((marker, index) => {
        marker.addEventListener("click", () => {
            entries.scrollTo({
                left: entries.clientWidth * index,
                behavior: "smooth",
            });

            markers.forEach((m) => m.classList.remove("active"));
            marker.classList.add("active");
        });
    });
}

// Ensure animation runs only after the DOM is fully loaded
document.addEventListener('DOMContentLoaded', sliderNavigation);