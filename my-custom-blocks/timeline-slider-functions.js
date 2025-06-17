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
    navWrapper.className = 'nav-arrows group-nav';

    const prevBtn = document.createElement('button');
    prevBtn.className = 'prev';
    prevBtn.textContent = '←';

    const nextBtn = document.createElement('button')
    nextBtn.className = 'next';
    nextBtn.textContent = '→';

    const timelineWrapper = document.createElement('div');
    timelineWrapper.className = 'timeline-line-wrapper';

    const timelineBackground = document.createElement('hr');
    timelineBackground.className = 'slider-timeline';

    const timeline = document.createElement('hr');
    timeline.className = 'slider-timeline-anim';

    slideWrap.appendChild(tabsContainer);
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

      const prevBtn = group.querySelector('.nav-arrows .prev');
      const nextBtn = group.querySelector('.nav-arrows .next');
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
    const timelineAnim = tabsContainer.closest('.slide-wrap')?.querySelector('.slider-timeline-anim');

    if (activeTab && timelineAnim) {
      let totalWidth = 0;

      for (const tab of tabs) {
        totalWidth += tab.offsetWidth;
        if (tab === activeTab) {
          // Subtract half of the active tab width for the "halfway" effect
          totalWidth -= tab.offsetWidth / 2;
          break;
        }
      }

      timelineAnim.style.left = '0';
      timelineAnim.style.width = `${totalWidth}px`;
    }
  }

  showGroup(0);

  function updateSlideHeights() {
    const sliderRoot = document.querySelector('.wp-block-rs-timeline-slider');
    if (!sliderRoot) return;

    const slides = sliderRoot.querySelectorAll('.wp-block-rs-timeline-slider-child');
    if (!slides.length) return;

    let maxContentHeight = 0;

    // Create a temporary off-screen container
    const tempContainer = document.createElement('div');
    tempContainer.style.position = 'absolute';
    tempContainer.style.visibility = 'hidden';
    tempContainer.style.zIndex = '-1';
    tempContainer.style.width = sliderRoot.offsetWidth + 'px';
    tempContainer.style.top = '0';
    tempContainer.style.left = '0';
    tempContainer.style.pointerEvents = 'none';
    document.body.appendChild(tempContainer);

    // Measure each slide's content height
    slides.forEach((slide) => {
      const clone = slide.cloneNode(true);
      clone.style.display = 'block';
      clone.style.position = 'static';
      clone.style.height = 'auto';
      clone.style.minHeight = '0';
      clone.style.maxHeight = 'none';
      clone.style.opacity = '1';

      tempContainer.appendChild(clone);
      const height = clone.offsetHeight;
      if (height > maxContentHeight) {
        maxContentHeight = height;
      }
      clone.remove();
    });

    // Measure ONE tabs height
    const tabExample = sliderRoot.querySelector('.tabs');
    const tabHeight = tabExample ? tabExample.offsetHeight : 0;

    // Measure ONE arrow group height
    const arrowExample = sliderRoot.querySelector('.group-nav');
    const arrowHeight = arrowExample ? arrowExample.offsetHeight : 0;

    const totalHeight = maxContentHeight + tabHeight + arrowHeight;

    // Apply min-height
    document.querySelectorAll('.slider-content-container').forEach(el => {
      el.style.minHeight = `${totalHeight}px`;
    });

    tempContainer.remove();
  }

  updateSlideHeights();
  window.addEventListener('resize', () => {
    updateSlideHeights();
    const activeTabs = document.querySelector('.slide-wrap.active .tabs');
    if (activeTabs) updateTimelineLine(activeTabs);
  });
});