export function sliderNavigation() {
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