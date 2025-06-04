document.addEventListener('DOMContentLoaded', () => {
  const sliderRoot = document.querySelector('.timeline-slider[data-slider="true"]');
  if (!sliderRoot) return;

  // Get all slides inside slider
  const slides = Array.from(sliderRoot.querySelectorAll('.slide'));

  if (slides.length === 0) return;

  // Build tabs container and slides container
  const tabsContainer = document.createElement('div');
  tabsContainer.className = 'tabs';

  const slidesContainer = document.createElement('div');
  slidesContainer.className = 'slides-container';

  // Move all slides into slides container
  slides.forEach((slide) => {
    slidesContainer.appendChild(slide);
  });

  // Append tabs container and slides container to slider root
  sliderRoot.appendChild(tabsContainer);
  sliderRoot.appendChild(slidesContainer);

  // Create tabs buttons with slide titles and IDs
  slides.forEach((slide, i) => {
    const slideId = slide.getAttribute('data-slide-id');
    const slideTitle = slide.getAttribute('data-title') || `Slide ${i + 1}`;

    const tabBtn = document.createElement('button');
    tabBtn.type = 'button';
    tabBtn.className = 'tab-button';
    tabBtn.textContent = slideTitle;
    tabBtn.dataset.target = slideId;
    if (i === 0) tabBtn.classList.add('active');

    tabsContainer.appendChild(tabBtn);

    // Hide all slides except first
    if (i === 0) {
      slide.classList.add('active');
    } else {
      slide.classList.remove('active');
      slide.style.display = 'none';
    }

    // On tab click show corresponding slide
    tabBtn.addEventListener('click', () => {
      // Set active tab
      tabsContainer.querySelectorAll('.tab-button').forEach((btn) => btn.classList.remove('active'));
      tabBtn.classList.add('active');

      // Show matching slide
      slides.forEach((s) => {
        if (s.getAttribute('data-slide-id') === slideId) {
          s.style.display = '';
          s.classList.add('active');
        } else {
          s.style.display = 'none';
          s.classList.remove('active');
        }
      });
    });
  });

  // Show 3 tabs max and add arrow navigation if needed
  const maxVisibleTabs = 3;
  const totalTabs = slides.length;

  if (totalTabs > maxVisibleTabs) {
    let startIndex = 0;

    // Wrap tabs container and add nav arrows
    const tabsWrapper = document.createElement('div');
    tabsWrapper.className = 'tabs-wrapper';
    sliderRoot.insertBefore(tabsWrapper, tabsContainer);
    tabsWrapper.appendChild(tabsContainer);

    const prevArrow = document.createElement('button');
    prevArrow.type = 'button';
    prevArrow.textContent = '←';
    prevArrow.className = 'tabs-nav prev';
    prevArrow.disabled = true;

    const nextArrow = document.createElement('button');
    nextArrow.type = 'button';
    nextArrow.textContent = '→';
    nextArrow.className = 'tabs-nav next';

    tabsWrapper.insertBefore(prevArrow, tabsContainer);
    tabsWrapper.appendChild(nextArrow);

    // Function to update visible tabs
    function updateTabs() {
      const tabs = Array.from(tabsContainer.children);
      tabs.forEach((tab, i) => {
        tab.style.display = i >= startIndex && i < startIndex + maxVisibleTabs ? '' : 'none';
      });

      prevArrow.disabled = startIndex === 0;
      nextArrow.disabled = startIndex + maxVisibleTabs >= totalTabs;
    }

    prevArrow.addEventListener('click', () => {
      if (startIndex > 0) {
        startIndex--;
        updateTabs();
      }
    });

    nextArrow.addEventListener('click', () => {
      if (startIndex + maxVisibleTabs < totalTabs) {
        startIndex++;
        updateTabs();
      }
    });

    updateTabs();
  }
});