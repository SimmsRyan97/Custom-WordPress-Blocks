import { __ } from "@wordpress/i18n";
import { registerBlockType , createBlock } from '@wordpress/blocks';
import {
    useBlockProps,
    InnerBlocks,
    BlockControls,
    InspectorControls,
    useClientId,
    ColorPalette,
} from '@wordpress/block-editor';
import {
    PanelBody,
    ToggleControl,
    ToolbarGroup,
    ToolbarButton,
    DropdownMenu,
} from '@wordpress/components';
import {
    plus,
    angleDown,
} from '@wordpress/icons';
import { dispatch } from '@wordpress/data';

import './editor.scss';
import './style.scss';

const buildStyleVars = (attributes) => ({
'--parent-background-color': attributes.parentBackgroundColor || undefined,
'--tab-background': attributes.tabBackgroundColor || undefined,
'--tab-background-hover': attributes.tabBackgroundHoverColor || undefined,
'--arrow-background': attributes.arrowBackgroundColor || undefined,
'--arrow-background-hover': attributes.arrowBackgroundHoverColor || undefined,
'--arrow-text': attributes.arrowTextColor || undefined,
'--arrow-text-hover': attributes.arrowTextHoverColor || undefined,
});

const ALLOWED_BLOCKS = ['rs/timeline-slider-child'];

registerBlockType('rs/timeline-slider', {
    title: 'Timeline Slider',
    icon: 'schedule',
    category: 'layout',
    attributes: {
        align: {
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
        tabBackgroundColor: {
            type: 'string',
            default: '#eeeeee',
        },
        tabBackgroundHoverColor: {
            type: 'string',
            default: '#dddddd',
        },
        arrowBackgroundColor: {
            type: 'string',
            default: '#000000',
        },
        arrowBackgroundHoverColor: {
            type: 'string',
            default: '#333333',
        },
        arrowTextColor: {
            type: 'string',
            default: '#ffffff',
        },
        arrowTextHoverColor: {
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
            className: `timeline-slider-editor ${colourClasses}`,
            'data-slider': 'true',
            style: buildStyleVars(attributes),
        });

        return (
            <>
                <InspectorControls>
                    <PanelBody title={__('Styles')}>
                        {[
                            {
                                label: __('Block Background'),
                                attribute: 'parentBackgroundColor',
                            },
                            {
                                label: __('Arrow Background'),
                                attribute: 'arrowBackgroundColor',
                            },
                            {
                                label: __('Arrow Hover Background'),
                                attribute: 'arrowBackgroundHoverColor',
                            },
                            {
                                label: __('Arrow Text Colour'),
                                attribute: 'arrowTextColor',
                            },
                            {
                                label: __('Arrow Hover Text Colour'),
                                attribute: 'arrowTextHoverColor',
                            },
                            {
                                label: __('Tab Background Colour'),
                                attribute: 'tabBackgroundColor',
                            },
                            {
                                label: __('Tab Hover Background Colour'),
                                attribute: 'tabBackgroundHoverColor',
                            },
                        ].map(({ label, attribute }) => (
                            <div key={attribute}>
                                <p>{label}</p>
                                <ColorPalette
                                    value={attributes[attribute]}
                                    onChange={(value) => setAttributes({ [attribute]: value })}
                                    disableCustomColors={false}
                                />
                            </div>
                        ))}
                    </PanelBody>
                </InspectorControls>

                <BlockControls>
                    <ToolbarGroup>
                        <ToolbarButton
                            icon={plus}
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
                            icon={angleDown}
                            label={__("Timeline Slider Options")}
                            popoverProps={{ placement: 'bottom-start' }}
                        >
                            {() => (
                                <div
                                    style={{
                                        padding: '10px',
                                        display: 'flex',
                                        minWidth: '205px',
                                    }}
                                >
                                    <ToggleControl
                                        __nextHasNoMarginBottom
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
                    <div className={'wp-block-group__inner-container'}>
                        <InnerBlocks
                            allowedBlocks={ALLOWED_BLOCKS}
                            template={[['rs/timeline-slider-child']]}
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
            className: `timeline-slider ${colourClasses}`,
            'data-slider': 'true',
            style: buildStyleVars(attributes),
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