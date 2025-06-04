import { registerBlockType } from '@wordpress/blocks';
import {
  InnerBlocks,
  InspectorControls,
  useBlockProps,
  useClientId,
} from '@wordpress/block-editor';
import { PanelBody, TextControl } from '@wordpress/components';
import { useEffect, useState } from '@wordpress/element';
import './editor.scss';

registerBlockType('my-custom-blocks/slide', {
  title: 'Time Slide',
  icon: 'slides',
  category: 'layout',
  parent: ['my-custom-blocks/timeline-slider'], // restrict to only inside timeline-slider
  attributes: {
    title: {
      type: 'string',
      default: '',
    },
  },
  edit({ attributes, setAttributes, clientId }) {
    const blockProps = useBlockProps();
    const [slideId, setSlideId] = useState('');

    useEffect(() => {
    if (clientId) {
        setSlideId('slide-' + clientId.slice(0, 8));
    }
    }, [clientId]);

    return (
      <>
        <InspectorControls>
          <PanelBody title="Slide Settings">
            <TextControl
              label="Slide Title"
              value={attributes.title}
              onChange={(title) => setAttributes({ title })}
            />
          </PanelBody>
        </InspectorControls>
        <div {...blockProps} data-slide-id={slideId} className="slide-editor">
          <InnerBlocks />
        </div>
      </>
    );
  },
  save({ attributes, clientId }) {
    const slideId = clientId ? 'slide-' + clientId.slice(0, 8) : '';
    return (
      <div className="slide" data-slide-id={slideId}>
        <InnerBlocks.Content />
      </div>
    );
  },
});