document.addEventListener('DOMContentLoaded', () => {
  const sliderRoot = document.querySelector('.wp-block-rs-timeline-slider');
  if (!sliderRoot) return;

  const slides = Array.from(sliderRoot.querySelectorAll('.slide'));
  if (slides.length === 0) return;

  const SLIDES_PER_GROUP = 3;
  const totalGroups = Math.ceil(slides.length / SLIDES_PER_GROUP);
  const sliderWrapper = sliderRoot.querySelector('.timeline-slider-wrapper');
  if (!sliderWrapper) return;

  slides.forEach(slide => slide.remove());

  let contentContainer = sliderRoot.querySelector('.slider-content-container');
  if (!contentContainer) {
    contentContainer = document.createElement('div');
    contentContainer.className = 'slider-content-container';
    sliderWrapper.appendChild(contentContainer);
  }
  contentContainer.innerHTML = '';

  const groups = [];

  for (let groupIndex = 0; groupIndex < totalGroups; groupIndex++) {
    const groupSlides = slides.slice(
      groupIndex * SLIDES_PER_GROUP,
      (groupIndex + 1) * SLIDES_PER_GROUP
    );

    const slideWrap = document.createElement('div');
    slideWrap.className = 'slide-wrap';

    const tabsContainer = document.createElement('div');
    tabsContainer.className = 'tabs';

    const contentTabsContainer = document.createElement('div');
    contentTabsContainer.className = 'content';

    const usedSlideIds = new Set();

    groupSlides.forEach((slide, index) => {
      let baseId = slide.getAttribute('data-slide-id') || `slide-${groupIndex}-${index}`;
      let slideId = baseId;
      let counter = 1;
      while (usedSlideIds.has(slideId)) {
        slideId = `${baseId}-${counter++}`;
      }
      usedSlideIds.add(slideId);

      const slideTitle = slide.getAttribute('data-title') || `Slide ${groupIndex * SLIDES_PER_GROUP + index + 1}`;
      slide.setAttribute('data-slide-id', slideId);
      slide.setAttribute('data-title', slideTitle);
      slide.classList.add('fade-slide');
      slide.dataset.active = index === 0 ? 'true' : 'false';
      if (index === 0) slide.classList.add('active');

      const tabBtn = document.createElement('button');
      tabBtn.type = 'button';
      tabBtn.className = 'tab-button';
      tabBtn.textContent = slideTitle;
      tabBtn.dataset.target = slideId;

      if (index === 0) tabBtn.classList.add('active');

      tabBtn.addEventListener('click', () => {
        tabsContainer.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
        tabBtn.classList.add('active');

        groupSlides.forEach(s => {
          const isTarget = s.getAttribute('data-slide-id') === slideId;
          s.classList.toggle('active', isTarget);
          s.dataset.active = isTarget ? 'true' : 'false';
        });
      });

      tabsContainer.appendChild(tabBtn);
      contentTabsContainer.appendChild(slide);
    });

    slideWrap.appendChild(tabsContainer);
    slideWrap.appendChild(contentTabsContainer);
    groups.push(slideWrap);
  }

  let navWrapper, prevBtn, nextBtn;
  if (slides.length > SLIDES_PER_GROUP) {
    navWrapper = document.createElement('div');
    navWrapper.className = 'nav-arrows';

    prevBtn = document.createElement('button');
    prevBtn.className = 'prev';
    prevBtn.textContent = '←';
    prevBtn.disabled = true;

    nextBtn = document.createElement('button');
    nextBtn.className = 'next';
    nextBtn.textContent = '→';

    navWrapper.appendChild(prevBtn);
    navWrapper.appendChild(nextBtn);
  }

  groups.forEach(group => {
    contentContainer.appendChild(group);
  });

  if (navWrapper) {
    contentContainer.appendChild(navWrapper);
  }

  document.querySelectorAll('.timeline-slider-wrapper .tabs').forEach(tabs => {
    const count = tabs.querySelectorAll('button').length;
    tabs.classList.add(`tab-count-${count}`);
  });

  let currentGroup = 0;

  function showGroup(index) {
    groups.forEach((group, i) => {
      group.classList.toggle('active', i === index);
    });

    currentGroup = index;
    if (prevBtn && nextBtn) {
      prevBtn.disabled = index === 0;
      nextBtn.disabled = index === groups.length - 1;
    }
  }

  if (prevBtn && nextBtn) {
    prevBtn.addEventListener('click', () => {
      if (currentGroup > 0) showGroup(--currentGroup);
    });

    nextBtn.addEventListener('click', () => {
      if (currentGroup < groups.length - 1) showGroup(++currentGroup);
    });
  }

  function updateSlideHeights() {
    const sliderRoot = document.querySelector('.wp-block-rs-timeline-slider');
    if (!sliderRoot) return;

    // Create temp container for offscreen measurement
    const tempContainer = document.createElement('div');
    tempContainer.style.position = 'absolute';
    tempContainer.style.visibility = 'hidden';
    tempContainer.style.zIndex = '-1';
    tempContainer.style.width = sliderRoot.offsetWidth + 'px'; // match width
    tempContainer.style.top = '0';
    tempContainer.style.left = '0';
    document.body.appendChild(tempContainer);

    // Clone the entire timeline-slider-wrapper (contains tabs, slides, arrows)
    const sliderWrapper = sliderRoot.querySelector('.timeline-slider-wrapper');
    if (!sliderWrapper) {
      tempContainer.remove();
      return;
    }

    const clone = sliderWrapper.cloneNode(true);
    clone.style.position = 'static'; // so it expands naturally
    clone.style.opacity = '1';
    clone.style.visibility = 'visible';
    clone.style.pointerEvents = 'none';
    clone.style.height = 'auto'; // remove any fixed height
    clone.style.minHeight = '0';
    clone.style.maxHeight = 'none';

    tempContainer.appendChild(clone);

    // Measure total height of clone
    const totalHeight = clone.offsetHeight;

    // Apply min-height to all absolute elements
    document.querySelectorAll('.wp-block-rs-timeline-slider, .slider-content-container, .slider-content-container .slide-wrap, .slider-content-container .content').forEach(el => {
      el.style.minHeight = `${totalHeight}px`;
    });

    // Clean up
    tempContainer.remove();
  }

  updateSlideHeights();
  window.addEventListener('resize', updateSlideHeights);

  showGroup(0);
});