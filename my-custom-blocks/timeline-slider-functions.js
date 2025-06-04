// File: timeline-slider-frontend.js

document.addEventListener('DOMContentLoaded', () => {
  const sliderRoot = document.querySelector('.wp-block-my-custom-blocks-timeline-slider');
  if (!sliderRoot) return;

  // Group every 3 child slides inside .slide-wrap
  const slides = Array.from(sliderRoot.children);

  if (slides.length === 0) return;

  // Remove existing children so we can rebuild grouped structure
  while (sliderRoot.firstChild) {
    sliderRoot.removeChild(sliderRoot.firstChild);
  }

  // Helper function to create tab buttons and content containers
  function createSlideWrap(groupSlides, groupIndex) {
    const slideWrap = document.createElement('div');
    slideWrap.className = 'slide-wrap';

    // Create tabs container
    const tabs = document.createElement('div');
    tabs.className = 'tabs';

    groupSlides.forEach((slide, i) => {
      // Create tab button
      const heading = slide.querySelector('h2, h3, h4, h5, h6') || slide.querySelector('h1') || slide.querySelector('h2') || { textContent: `Slide ${i + 1}` };
      const tabBtn = document.createElement('button');
      tabBtn.type = 'button';
      tabBtn.textContent = heading.textContent || `Slide ${i + 1}`;
      if (i === 0) tabBtn.classList.add('active');
      tabs.appendChild(tabBtn);

      // Wrap slide content
      slide.classList.add('slide-content');
      if (i === 0) slide.classList.add('active');
      slideWrap.appendChild(slide);

      // Tab click event
      tabBtn.addEventListener('click', () => {
        // Set active tab button
        tabs.querySelectorAll('button').forEach(btn => btn.classList.remove('active'));
        tabBtn.classList.add('active');

        // Show corresponding slide content
        groupSlides.forEach(s => s.classList.remove('active'));
        slide.classList.add('active');
      });
    });

    // Insert tabs before slides content
    slideWrap.insertBefore(tabs, slideWrap.firstChild);

    return slideWrap;
  }

  // Group slides into arrays of 3
  const groupedSlides = [];
  for (let i = 0; i < slides.length; i += 3) {
    groupedSlides.push(slides.slice(i, i + 3));
  }

  // Append all groups wrapped in .slide-wrap
  groupedSlides.forEach((group, idx) => {
    sliderRoot.appendChild(createSlideWrap(group, idx));
  });

  // Optional: Add navigation arrows to flick through groups of slide-wraps
  if (groupedSlides.length > 1) {
    let currentIndex = 0;

    const navArrows = document.createElement('div');
    navArrows.className = 'nav-arrows';

    const prevBtn = document.createElement('button');
    prevBtn.type = 'button';
    prevBtn.textContent = '←';
    prevBtn.disabled = true;

    const nextBtn = document.createElement('button');
    nextBtn.type = 'button';
    nextBtn.textContent = '→';

    navArrows.appendChild(prevBtn);
    navArrows.appendChild(nextBtn);

    sliderRoot.parentElement.insertBefore(navArrows, sliderRoot.nextSibling);

    function showGroup(index) {
      currentIndex = index;
      const allSlideWraps = sliderRoot.querySelectorAll('.slide-wrap');
      allSlideWraps.forEach((wrap, i) => {
        wrap.style.display = i === currentIndex ? 'block' : 'none';
      });

      prevBtn.disabled = currentIndex === 0;
      nextBtn.disabled = currentIndex === allSlideWraps.length - 1;
    }

    prevBtn.addEventListener('click', () => {
      if (currentIndex > 0) showGroup(currentIndex - 1);
    });

    nextBtn.addEventListener('click', () => {
      if (currentIndex < groupedSlides.length - 1) showGroup(currentIndex + 1);
    });

    // Initially show only first group
    showGroup(0);
  }
});