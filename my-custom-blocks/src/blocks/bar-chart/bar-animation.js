export function animateBars() {
    const bars = document.querySelectorAll('.animating-bar'); // Select bars with this class
    bars.forEach(bar => {
        const finalWidth = bar.getAttribute('data-final-width'); // Retrieve final width from data attribute
        bar.style.transition = 'width 2s ease-in-out'; // Ensure transition effect
        bar.style.width = finalWidth + '%'; // Set the width to final width
    });
}