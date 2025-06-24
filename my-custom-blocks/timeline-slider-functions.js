document.addEventListener('DOMContentLoaded', () => {
  const sliderRoot = document.querySelector('.wp-block-rs-timeline-slider');
  if (!sliderRoot) return;

  let slides = Array.from(sliderRoot.querySelectorAll('.slide'));
  if (slides.length === 0) return;

  // Determine the number of slides per group based on screen width
  function getSlidesPerGroup() {
    return window.innerWidth < 425 ? 1 : 3;
  }

  let SLIDES_PER_GROUP = getSlidesPerGroup();
  let totalGroups = Math.ceil(slides.length / SLIDES_PER_GROUP);
  const sliderWrapper = sliderRoot.querySelector('.timeline-slider-wrapper');
  if (!sliderWrapper) return;

  let contentContainer = sliderRoot.querySelector('.slider-content-container');
  if (!contentContainer) {
    contentContainer = document.createElement('div');
    contentContainer.className = 'slider-content-container';
    sliderWrapper.appendChild(contentContainer);
  }

  // Main rendering function that (re)builds the slider layout
  function renderSlider() {
    slides = Array.from(sliderRoot.querySelectorAll('.slide'));
    SLIDES_PER_GROUP = getSlidesPerGroup();
    totalGroups = Math.ceil(slides.length / SLIDES_PER_GROUP);

    contentContainer.innerHTML = '';
    const groups = [];
    currentGroup = 0;
    currentTabIndex = 0;

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
        // Generate unique slide IDs
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
        slide.classList.remove('active');
        slide.dataset.active = 'false';

        if (index === 0) {
          slide.classList.add('active');
          slide.dataset.active = 'true';
        }

        const tabBtn = document.createElement('button');
        tabBtn.type = 'button';
        tabBtn.className = 'tab-button';
        tabBtn.textContent = slideTitle;
        tabBtn.dataset.target = slideId;

        tabBtn.classList.remove('active');
        if (index === 0) tabBtn.classList.add('active');

        // Handle tab click to activate corresponding slide
        tabBtn.addEventListener('click', () => {
          activateTab(index);
        });

        tabsContainer.appendChild(tabBtn);
        contentTabsContainer.appendChild(slide);
      });

      // Create navigation buttons and timeline elements
      const navWrapper = document.createElement('div');
      navWrapper.className = 'group-nav';

      const prevBtn = document.createElement('button');
      prevBtn.className = 'arrow prev';
      prevBtn.textContent = '←';

      const nextBtn = document.createElement('button');
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

      // Handle previous button logic
      prevBtn.addEventListener('click', () => {
        if (currentTabIndex > 0) {
          activateTab(currentTabIndex - 1);
        } else if (currentGroup > 0) {
          showGroup(currentGroup - 1);
          setTimeout(() => {
            const tabs = groups[currentGroup].querySelectorAll('.tab-button');
            if (tabs.length) tabs[tabs.length - 1].click();
          }, 0);
        }
      });

      // Handle next button logic
      nextBtn.addEventListener('click', () => {
        const tabs = groups[currentGroup].querySelectorAll('.tab-button');
        if (currentTabIndex < tabs.length - 1) {
          activateTab(currentTabIndex + 1);
        } else if (currentGroup < totalGroups - 1) {
          showGroup(currentGroup + 1);
          setTimeout(() => {
            const tabs = groups[currentGroup].querySelectorAll('.tab-button');
            if (tabs.length) tabs[0].click();
          }, 0);
        }
      });

      slideWrap.appendChild(navWrapper);
      slideWrap.appendChild(contentTabsContainer);
      groups.push(slideWrap);
    }

    groups.forEach(group => {
      contentContainer.appendChild(group);
    });

    // Add class based on tab count for styling
    document.querySelectorAll('.timeline-slider-wrapper .tabs').forEach(tabs => {
      const count = tabs.querySelectorAll('button').length;
      tabs.classList.add(`tab-count-${count}`);
    });

    // Display the selected group and highlight timeline
    function showGroup(index) {
      groups.forEach((group, i) => {
        group.classList.toggle('active', i === index);
      });
      currentGroup = index;
      currentTabIndex = 0;
      const activeTabs = groups[index].querySelector('.tabs');
      if (activeTabs) updateTimelineLine(activeTabs);
    }

    // Activate the tab at given index within current group
    function activateTab(index) {
      const group = groups[currentGroup];
      const tabs = group.querySelectorAll('.tab-button');
      const slides = group.querySelectorAll('.wp-block-rs-timeline-slider-child');

      if (tabs[index]) {
        tabs.forEach(btn => btn.classList.remove('active'));
        tabs[index].classList.add('active');

        slides.forEach((s, i) => {
          const isTarget = i === index;
          s.classList.toggle('active', isTarget);
          s.dataset.active = isTarget ? 'true' : 'false';
        });

        updateTimelineLine(group.querySelector('.tabs'));
        currentTabIndex = index;
      }
    }

    // Adjust the animated timeline indicator based on active tab
    function updateTimelineLine(tabsContainer) {
      const tabs = Array.from(tabsContainer.querySelectorAll('.tab-button'));
      const activeTab = tabsContainer.querySelector('.tab-button.active');

      const slideWrap = tabsContainer.closest('.slide-wrap');
      const navArrows = slideWrap.querySelector('.group-nav');
      const timelineWrapper = navArrows?.querySelector('.timeline-line-wrapper');
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

    currentGroup = 0;
    currentTabIndex = 0;

    showGroup(0);
    updateSlideHeights();
  }

  let currentGroup = 0;
  let currentTabIndex = 0;
  renderSlider();

  // Re-render slider if number of slides per group changes (e.g. on screen resize)
  window.addEventListener('resize', () => {
    const newSlidesPerGroup = getSlidesPerGroup();
    if (newSlidesPerGroup !== SLIDES_PER_GROUP) {
      renderSlider();
    }
    updateSlideHeights();
    const activeTabs = document.querySelector('.slide-wrap.active .tabs');
    if (activeTabs) updateTimelineLine(activeTabs);
  });

  // Recalculate and apply the height of the tallest slide + nav
  function updateSlideHeights() {
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
      pointerEvents: 'none'
    });
    document.body.appendChild(tempContainer);

    // Clone each slide to measure height independently
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
        maxWidth: '100%'
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
});