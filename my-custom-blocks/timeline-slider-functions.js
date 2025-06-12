document.addEventListener('DOMContentLoaded', () => {
  const sliderRoot = document.querySelector('.timeline-slider[data-slider="true"]');
  if (!sliderRoot) return;

  const slides = Array.from(sliderRoot.querySelectorAll('.slide'));
  if (slides.length === 0) return;

  const SLIDES_PER_GROUP = 3;
  const totalGroups = Math.ceil(slides.length / SLIDES_PER_GROUP);

  // Get max height among all slides
  function getMaxHeight(slides) {
    let maxHeight = 0;
    slides.forEach(slide => {
      const origDisplay = slide.style.display;
      const origPos = slide.style.position;

      slide.style.display = 'block';
      slide.style.position = 'relative';

      const h = slide.offsetHeight;
      if (h > maxHeight) maxHeight = h;

      slide.style.display = origDisplay;
      slide.style.position = origPos;
    });
    return maxHeight;
  }

  const maxHeight = getMaxHeight(slides);

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
    slideWrap.style.position = 'absolute';
    slideWrap.style.top = 0;
    slideWrap.style.left = 0;
    slideWrap.style.width = '100%';

    const tabsContainer = document.createElement('div');
    tabsContainer.className = 'tabs';

    const contentTabsContainer = document.createElement('div');
    contentTabsContainer.className = 'content';
    contentTabsContainer.style.minHeight = maxHeight + 'px';
    contentTabsContainer.style.position = 'relative';

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
      slide.style.position = 'absolute';
      slide.style.top = 0;
      slide.style.left = 0;
      slide.style.width = '100%';
      slide.style.transition = 'opacity 0.4s ease';
      slide.style.opacity = index === 0 ? '1' : '0';
      slide.dataset.active = index === 0 ? 'true' : 'false';

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
          if (s.getAttribute('data-slide-id') === slideId) {
            s.style.opacity = '1';
            s.dataset.active = 'true';
          } else {
            s.style.opacity = '0';
            s.dataset.active = 'false';
          }
        });
      });

      tabsContainer.appendChild(tabBtn);
      contentTabsContainer.appendChild(slide);
    });

    slideWrap.appendChild(tabsContainer);
    slideWrap.appendChild(contentTabsContainer);
    groups.push(slideWrap);
  }

  // Nav arrows
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

  // Append groups
  groups.forEach(group => {
    group.style.opacity = '0';
    group.style.pointerEvents = 'none';
    group.style.transition = 'opacity 0.4s ease';
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
      if (i === index) {
        group.classList.add('active');
        group.style.opacity = '1';
        group.style.pointerEvents = 'auto';
      } else {
        group.classList.remove('active');
        group.style.opacity = '0';
        group.style.pointerEvents = 'none';
      }
    });

    currentGroup = index;
    if (prevBtn && nextBtn) {
      prevBtn.disabled = index === 0;
      nextBtn.disabled = index === groups.length - 1;
    }
  }

  if (prevBtn && nextBtn) {
    prevBtn.addEventListener('click', () => {
      if (currentGroup > 0) {
        showGroup(--currentGroup);
      }
    });

    nextBtn.addEventListener('click', () => {
      if (currentGroup < groups.length - 1) {
        showGroup(++currentGroup);
      }
    });
  }

  showGroup(0);
});