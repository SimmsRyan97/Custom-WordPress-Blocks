document.addEventListener('DOMContentLoaded', () => {
	const sliderRoot = document.querySelector('.timeline-slider[data-slider="true"] .wp-block-group__inner-container');
	if (!sliderRoot) return;

	const slides = Array.from(sliderRoot.querySelectorAll('.slide'));
	if (slides.length === 0) return;

	const SLIDES_PER_GROUP = 3;
	const totalGroups = Math.ceil(slides.length / SLIDES_PER_GROUP);

	// Remove slides before rebuilding DOM
	slides.forEach(slide => slide.remove());

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

		const contentContainer = document.createElement('div');
		contentContainer.className = 'content';

		const usedSlideIds = new Set();

		groupSlides.forEach((slide, index) => {
			// Ensure unique slideId per group
			let baseId = slide.getAttribute('data-slide-id') || `slide-${groupIndex}-${index}`;
			let slideId = baseId;
			let counter = 1;
			while (usedSlideIds.has(slideId)) {
				slideId = `${baseId}-${counter}`;
				counter++;
			}
			usedSlideIds.add(slideId);

			const slideTitle = slide.getAttribute('data-title') || `Slide ${groupIndex * SLIDES_PER_GROUP + index + 1}`;

			slide.setAttribute('data-slide-id', slideId);
			slide.setAttribute('data-title', slideTitle);

			const tabBtn = document.createElement('button');
			tabBtn.type = 'button';
			tabBtn.className = 'tab-button';
			tabBtn.textContent = slideTitle;
			tabBtn.dataset.target = slideId;

			if (index === 0) {
				tabBtn.classList.add('active');
				slide.classList.add('active');
				slide.style.display = '';
			} else {
				slide.classList.remove('active');
			}

			tabBtn.addEventListener('click', () => {
				tabsContainer.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
				tabBtn.classList.add('active');

				groupSlides.forEach(s => {
					if (s.getAttribute('data-slide-id') === slideId) {
						s.classList.add('active');
					} else {
						s.classList.remove('active');
					}
				});
			});

			tabsContainer.appendChild(tabBtn);
			contentContainer.appendChild(slide);
		});

		slideWrap.appendChild(tabsContainer);
		slideWrap.appendChild(contentContainer);
		groups.push(slideWrap);
	}

	if (slides.length > SLIDES_PER_GROUP) {
		// Navigation arrows
		const navWrapper = document.createElement('div');
		navWrapper.className = 'nav-arrows';

		const prevBtn = document.createElement('button');
		prevBtn.className = 'prev';
		prevBtn.textContent = '←';
		prevBtn.disabled = true;

		const nextBtn = document.createElement('button');
		nextBtn.className = 'next';
		nextBtn.textContent = '→';

		navWrapper.appendChild(prevBtn);
		navWrapper.appendChild(nextBtn);
		sliderRoot.appendChild(navWrapper);

		let currentGroup = 0;

		function showGroup(index) {
			const currentWrap = groups[index];

			// Remove all existing wraps
			sliderRoot.querySelectorAll('.slide-wrap').forEach(sw => sw.remove());

			// Prepare new group
			currentWrap.classList.remove('active');
			sliderRoot.insertBefore(currentWrap, navWrapper);

			// Trigger fade-in
			queueMicrotask(() => {
				currentWrap.classList.add('active');
			});

			prevBtn.disabled = index === 0;
			nextBtn.disabled = index === groups.length - 1;
		}

		prevBtn.addEventListener('click', () => {
			if (currentGroup > 0) {
				currentGroup--;
				showGroup(currentGroup);
			}
		});

		nextBtn.addEventListener('click', () => {
			if (currentGroup < groups.length - 1) {
				currentGroup++;
				showGroup(currentGroup);
			}
		});

		showGroup(0);
	} else {
		// Just show the single group, no arrows
		sliderRoot.appendChild(groups[0]);
	}
});