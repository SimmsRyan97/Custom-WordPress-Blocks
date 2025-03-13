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

// Ensure animation runs only after the DOM is fully loaded
document.addEventListener('DOMContentLoaded', animateBars);