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

registerBlockType('rs/timeline-slider-child', {
    title: 'Time Slide',
    icon: 'slides',
    category: 'layout',
    parent: ['rs/timeline-slider'], // restrict to only inside timeline-slider
    attributes: {
        title: {
            type: 'string',
            default: '',
        },
            slideId: {
            type: 'string',
        },
    },
    edit({ attributes, setAttributes, clientId }) {
        const blockProps = useBlockProps();
        const [slideId, setSlideId] = useState('');

        useEffect(() => {
            if (clientId && !attributes.slideId) {
                const id = 'slide-' + clientId.slice(0, 8);
                setAttributes({ slideId: id });
                setSlideId(id);
            } else {
                setSlideId(attributes.slideId);
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
    save({ attributes }) {
        return (
            <div className="slide" data-slide-id={attributes.slideId} data-title={attributes.title}>
                <InnerBlocks.Content />
            </div>
        );
    },
});