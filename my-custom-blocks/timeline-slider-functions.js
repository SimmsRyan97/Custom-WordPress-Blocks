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

        updateTimelineLine(tabsContainer);
      });

      tabsContainer.appendChild(tabBtn);
      contentTabsContainer.appendChild(slide);
    });

    const navWrapper = document.createElement('div');
    navWrapper.className = 'group-nav';

    const prevBtn = document.createElement('button');
    prevBtn.className = 'arrow prev';
    prevBtn.textContent = '←';

    const nextBtn = document.createElement('button')
    nextBtn.className = 'arrow next';
    nextBtn.textContent = '→';

    const timelineWrapper = document.createElement('div');
    timelineWrapper.className = 'timeline-line-wrapper';

    const timelineBackground = document.createElement('hr');
    timelineBackground.className = 'slider-timeline';

    const timeline = document.createElement('hr');
    timeline.className = 'slider-timeline-anim';

    navWrapper.appendChild(tabsContainer);
    navWrapper.appendChild(prevBtn);
    navWrapper.appendChild(timelineWrapper);
    navWrapper.appendChild(nextBtn);

    timelineWrapper.appendChild(timelineBackground);
    timelineWrapper.appendChild(timeline);

    if (totalGroups > 1) {
      prevBtn.addEventListener('click', () => {
        if (currentGroup > 0) {
          showGroup(currentGroup - 1);
        }
      });

      nextBtn.addEventListener('click', () => {
        if (currentGroup < totalGroups - 1) {
          showGroup(currentGroup + 1);
        }
      });
    } else {
      prevBtn.style.display = 'none';
      nextBtn.style.display = 'none';
    }

    slideWrap.appendChild(navWrapper);
    slideWrap.appendChild(contentTabsContainer);
    groups.push(slideWrap);
  }

  groups.forEach(group => {
    contentContainer.appendChild(group);
  });

  document.querySelectorAll('.timeline-slider-wrapper .tabs').forEach(tabs => {
    const count = tabs.querySelectorAll('button').length;
    tabs.classList.add(`tab-count-${count}`);
  });

  let currentGroup = 0;

  function showGroup(index) {
    groups.forEach((group, i) => {
      group.classList.toggle('active', i === index);

      const prevBtn = group.querySelector('.arrow.prev');
      const nextBtn = group.querySelector('.arrow.next');
      if (prevBtn && nextBtn) {
        prevBtn.disabled = index === 0;
        nextBtn.disabled = index === totalGroups - 1;
      }
    });
    currentGroup = index;
    const activeTabs = groups[index].querySelector('.tabs');
    if (activeTabs) updateTimelineLine(activeTabs);
  }

  function updateTimelineLine(tabsContainer) {
    const tabs = Array.from(tabsContainer.querySelectorAll('.tab-button'));
    const activeTab = tabsContainer.querySelector('.tab-button.active');
    
    // Get the closest '.slide-wrap' parent
    const slideWrap = tabsContainer.closest('.slide-wrap');
    
    // Find sibling '.nav-arrows.group-nav' inside the slideWrap
    const navArrows = slideWrap.querySelector('.group-nav');
    
    // Then find the timeline wrapper inside navArrows
    const timelineWrapper = navArrows?.querySelector('.timeline-line-wrapper');
    
    // Then the animated timeline line inside the wrapper
    const timelineAnim = timelineWrapper?.querySelector('.slider-timeline-anim');

    if (activeTab && timelineAnim && timelineWrapper) {
      let totalWidth = 0;

      for (const tab of tabs) {
        totalWidth += tab.offsetWidth;
        if (tab === activeTab) {
          totalWidth -= tab.offsetWidth / 2;
          break;
        }
      }

      const containerWidth = timelineWrapper.offsetWidth;
      const clampedWidth = Math.min(totalWidth, containerWidth);

      timelineAnim.style.left = '0';
      timelineAnim.style.width = `${clampedWidth}px`;
    }
  }

  showGroup(0);

  function updateSlideHeights() {
    const sliderRoot = document.querySelector('.wp-block-rs-timeline-slider');
    if (!sliderRoot) return;

    const slides = sliderRoot.querySelectorAll('.wp-block-rs-timeline-slider-child');
    if (!slides.length) return;

    const sliderWrapper = sliderRoot.querySelector('.timeline-slider-wrapper');
    const measuredWidth = sliderWrapper?.offsetWidth || 1290;

    let maxSlideHeight = 0;

    const tempContainer = document.createElement('div');
    Object.assign(tempContainer.style, {
      position: 'absolute',
      visibility: 'hidden',
      zIndex: '-1',
      top: '0',
      left: '0',
      width: `${measuredWidth}px`,
      pointerEvents: 'none',
    });
    document.body.appendChild(tempContainer);

    slides.forEach(slide => {
      const clone = slide.cloneNode(true);
      Object.assign(clone.style, {
        display: 'block',
        position: 'static',
        height: 'auto',
        minHeight: '0',
        maxHeight: 'none',
        opacity: '1',
        margin: '0',
        padding: '0',
        border: 'none',
        boxSizing: 'border-box',
        width: '100%',
        maxWidth: '100%',
      });
      tempContainer.appendChild(clone);
      const height = clone.offsetHeight;
      if (height > maxSlideHeight) maxSlideHeight = height;
      clone.remove();
    });

    tempContainer.remove();

    const exampleGroup = sliderRoot.querySelector('.slide-wrap');
    if (!exampleGroup) return;

    const navHeight = exampleGroup.querySelector('.group-nav')?.offsetHeight || 0;

    const totalHeight = maxSlideHeight + navHeight;

    document.querySelectorAll('.slider-content-container').forEach(el => {
      el.style.minHeight = `${totalHeight}px`;
    });
  }

  updateSlideHeights();
  window.addEventListener('resize', () => {
    updateSlideHeights();
    const activeTabs = document.querySelector('.slide-wrap.active .tabs');
    if (activeTabs) updateTimelineLine(activeTabs);
  });
});