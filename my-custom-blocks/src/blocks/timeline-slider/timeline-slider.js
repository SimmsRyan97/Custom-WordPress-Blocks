import { __ } from "@wordpress/i18n";
import { registerBlockType , createBlock } from '@wordpress/blocks';
import {
    useBlockProps,
    InnerBlocks,
    BlockControls,
    InspectorControls,
    useClientId,
} from '@wordpress/block-editor';
import {
    PanelBody,
    ToggleControl,
    ToolbarGroup,
    ToolbarButton,
    DropdownMenu,
} from '@wordpress/components';
import {
    more,
    arrowLeft,
    arrowRight,
    arrowUp,
    arrowDown,
} from '@wordpress/icons';
import { dispatch } from '@wordpress/data';

import './editor.scss';
import './style.scss';

const ALLOWED_BLOCKS = ['rs/timeline-slider-child'];

registerBlockType('rs/timeline-slider', {
    title: 'Timeline Slider',
    icon: 'schedule',
    category: 'layout',
    attributes: {
        align: {
            type: 'string',
        },
        verticalAlignment: {
            type: 'string',
        },
        innerContentWidth: {
            type: 'boolean',
            default: true,
        },
        parentBackgroundColor: {
            type: 'string',
            default: '',
        },
        arrowBackgroundColor: {
            type: 'string',
            default: '#000000',
        },
        arrowTextColor: {
            type: 'string',
            default: '#ffffff',
        },
    },
    supports: {
        align: ['wide', 'full', 'center'],
        anchor: true,
        spacing: {
            margin: true,
            padding: true,
        },
        __experimentalLayout: true,
        __experimentalVerticalAlignment: true,
    },
    edit({ attributes, setAttributes, clientId }) {
        const { innerContentWidth } = attributes;

        const blockProps = useBlockProps({
            className: `timeline-slider-editor ${innerContentWidth ? 'kb-theme-content-width' : ''}`,
            'data-slider': 'true',

            style: {
                backgroundColor: attributes.parentBackgroundColor || undefined,
                '--arrow-bg': attributes.arrowBackgroundColor,
                '--arrow-text': attributes.arrowTextColor,
            },
        });

        return (
            <>
                <InspectorControls>
                    <PanelBody title={__('Styles')}>
                        <p>{__('Block Background')}</p>
                        <input
                            type="color"
                            value={attributes.parentBackgroundColor}
                            onChange={(e) => setAttributes({ parentBackgroundColor: e.target.value })}
                        />
                        <p>{__('Arrow Background')}</p>
                        <input
                            type="color"
                            value={attributes.arrowBackgroundColor}
                            onChange={(e) => setAttributes({ arrowBackgroundColor: e.target.value })}
                        />
                        <p>{__('Arrow Text Colour')}</p>
                        <input
                            type="color"
                            value={attributes.arrowTextColor}
                            onChange={(e) => setAttributes({ arrowTextColor: e.target.value })}
                        />
                    </PanelBody>
                </InspectorControls>

                <BlockControls>
                    <ToolbarGroup>
                        <ToolbarButton
                            icon="plus"
                            label={__("Add Timeline Slide")}
                            onClick={() => {
                                const newBlock = createBlock('rs/timeline-slider-child');
                                setTimeout(() => {
                                    dispatch('core/block-editor').insertBlock(newBlock, undefined, clientId);
                                }, 0);
                            }}
                            aria-label="Add a timeline slide"
                        />
                        <DropdownMenu
                            icon={more}
                            label={__("Timeline Slider Options")}
                            popoverProps={{ placement: 'bottom-start' }}
                        >
                            {() => (
                                <div style={{ padding: '10px 12px', display: 'flex' }}>
                                    <ToggleControl
                                        label={__("Use Inner Content Width")}
                                        checked={innerContentWidth}
                                        onChange={(value) =>
                                            setAttributes({ innerContentWidth: value })
                                        }
                                    />
                                </div>
                            )}
                        </DropdownMenu>
                    </ToolbarGroup>
                </BlockControls>

                <div {...blockProps}>
                    <div className={`wp-block-group__inner-container ${innerContentWidth ? 'kb-theme-content-width' : ''}`}>
                        <InnerBlocks
                            allowedBlocks={ALLOWED_BLOCKS}
                            templateLock={false}
                            renderAppender={false}
                        />
                    </div>
                </div>
            </>
        );
    },
    save({ attributes }) {
        const { innerContentWidth } = attributes;

        const blockProps = useBlockProps.save({
            className: 'timeline-slider',
            'data-slider': 'true',
            style: {
                backgroundColor: attributes.parentBackgroundColor || undefined,
                '--arrow-bg': attributes.arrowBackgroundColor,
                '--arrow-text': attributes.arrowTextColor,
            },
        });

        return (
            <div {...blockProps}>
                <div className={`wp-block-group__inner-container ${innerContentWidth ? 'kb-theme-content-width' : ''}`}>
                    <InnerBlocks.Content />
                </div>
            </div>
        );
    },
});