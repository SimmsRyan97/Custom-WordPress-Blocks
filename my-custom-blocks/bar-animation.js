function animateBars() {
    const bars = document.querySelectorAll('.animating-bar');

    if (bars.length > 0) {
        bars.forEach(bar => {
            const finalWidth = bar.getAttribute('data-final-width');
            if (finalWidth) {
                bar.style.transition = 'width 2s ease-in-out';
                bar.style.width = finalWidth + '%';
            }
        });
    }
}

// Ensure animation runs only after the DOM is fully loaded (only needed once for initial load)
document.addEventListener('DOMContentLoaded', animateBars);

// Call animateBars after attributes are updated or DOM is re-rendered
const updateBarsAfterRender = () => {
    // Ensure animation runs after attribute updates
    animateBars();
};