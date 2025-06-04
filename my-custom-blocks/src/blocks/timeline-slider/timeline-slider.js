// File: src/blocks/timeline-slider/timeline-slider.js
import { registerBlockType } from '@wordpress/blocks';
import { InnerBlocks, useBlockProps } from '@wordpress/block-editor';
import { useState, useEffect } from '@wordpress/element';
import './editor.scss';

const MAX_SLIDES_PER_WRAP = 3;

// Template for an individual slide (InnerBlock)
const TEMPLATE = [
  [ 'core/group', { className: 'timeline-slide' }, [
    [ 'core/heading', { placeholder: 'Tab title...' } ],
    [ 'core/paragraph', { placeholder: 'Slide content...' } ],
  ] ],
];

registerBlockType('my-custom-blocks/timeline-slider', {
  title: 'Timeline Slider',
  icon: 'schedule',
  category: 'layout',
  edit() {
    const blockProps = useBlockProps();

    // Use InnerBlocks with allowed blocks being core/group with children

    return (
      <div {...blockProps} className="timeline-slider-editor">
        <InnerBlocks
          allowedBlocks={['core/group']}
          template={TEMPLATE}
          templateLock={false}
          orientation="horizontal"
          renderAppender={() => <InnerBlocks.ButtonBlockAppender />}
        />
        <p style={{marginTop: '1rem', fontStyle: 'italic'}}>
          Add slides. They will be grouped automatically into groups of 3.
        </p>
      </div>
    );
  },
  save() {
    // Save all inner blocks raw, but the front-end rendering will group into .slide-wrap

    return (
      <div>
        <InnerBlocks.Content />
      </div>
    );
  }
});