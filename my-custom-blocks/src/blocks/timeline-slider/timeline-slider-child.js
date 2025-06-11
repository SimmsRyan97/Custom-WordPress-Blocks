import { __ } from "@wordpress/i18n";
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
import './style.scss';

registerBlockType('rs/timeline-slider-child', {
    title: 'Time Slide',
    icon: 'slides',
    category: 'layout',
    parent: ['rs/timeline-slider'],
    attributes: {
        title: {
            type: 'string',
            default: '',
        },
        slideId: {
            type: 'string',
        },
        slideIndex: {
            type: 'number',
        },
        // Add any new attributes you might want for styling or state here
        // e.g. borderColor, backgroundColor, typography etc.
    },
    edit({ attributes, setAttributes, clientId }) {
        const blockProps = useBlockProps({});

        const [slideId, setSlideId] = useState('');

        useEffect(() => {
            if (clientId && !attributes.slideId) {
                // Generate unique slideId based on clientId
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
                    <PanelBody title={__("Slide Settings")}>
                        <TextControl
                            label={__("Slide Title")}
                            value={attributes.title}
                            onChange={(title) => setAttributes({ title })}
                        />
                        {/* Additional controls for styling can go here */}
                    </PanelBody>
                </InspectorControls>
                <div
                    {...blockProps}
                    data-slide-id={slideId}
                    className={`slide-editor slide-${attributes.slideIndex || 0}`}
                    // Add role or aria-labels if needed for accessibility
                    role="group"
                    aria-label={attributes.title || `Slide ${attributes.slideIndex || 0}`}
                >
                    <InnerBlocks />
                </div>
            </>
        );
    },
    save({ attributes }) {
        // Save includes the slide index and ID for frontend usage
        return (
            <div
                className={`slide slide-${attributes.slideIndex || 0}`}
                data-slide-id={attributes.slideId}
                data-title={attributes.title}
            >
                <InnerBlocks.Content />
            </div>
        );
    },
});