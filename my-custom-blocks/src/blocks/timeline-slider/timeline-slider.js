import { __ } from "@wordpress/i18n";
import { registerBlockType, createBlock } from '@wordpress/blocks';
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
    ColorIndicator,
} from '@wordpress/components';
import {
    plus,
    angleDown,
} from '@wordpress/icons';
import { dispatch } from '@wordpress/data';
import { useEffect } from '@wordpress/element';

import './editor.scss';
import './style.scss';

// Define your prefix here
const VAR_PREFIX = '--rs-slider-';

const buildStyleVars = (attributes) => ({
    [`${VAR_PREFIX}parent-background-color`]: attributes.parentBackgroundColor || undefined,
    [`${VAR_PREFIX}tab-background`]: attributes.tabBackgroundColor || undefined,
    [`${VAR_PREFIX}tab-background-hover`]: attributes.tabBackgroundHoverColor || undefined,
    [`${VAR_PREFIX}arrow-background`]: attributes.arrowBackgroundColor || undefined,
    [`${VAR_PREFIX}arrow-background-hover`]: attributes.arrowBackgroundHoverColor || undefined,
    [`${VAR_PREFIX}arrow-text`]: attributes.arrowTextColor || undefined,
    [`${VAR_PREFIX}arrow-text-hover`]: attributes.arrowTextHoverColor || undefined,
});

const ALLOWED_BLOCKS = ['rs/timeline-slider-child'];

const ColorPickerCircle = ({ value, onChange, label }) => (
    <div>
        <label style={{ display: 'block', marginBottom: '0.5em', fontSize: '0.85rem' }}>{label}</label>
        <DropdownMenu
            icon={null}
            label={label}
            toggleProps={{
                style: {
                    backgroundColor: value || '#000',
                    borderRadius: '50%',
                    width: '30px',
                    height: '30px',
                    border: '1px solid #ccc',
                    cursor: 'pointer',
                },
                'aria-label': `${label} Colour Picker`,
            }}
            popoverProps={{ placement: 'bottom-start' }}
        >
            {() => (
                <ColorPalette
                    value={value}
                    onChange={onChange}
                    disableCustomColors={false}
                />
            )}
        </DropdownMenu>
    </div>
);

registerBlockType('rs/timeline-slider', {
    title: 'Timeline Slider',
    icon: 'schedule',
    category: 'layout',
    attributes: {
        align: { type: 'string' },
        innerContentWidth: { type: 'boolean', default: false },
        parentBackgroundColor: { type: 'string', default: '' },
        tabBackgroundColor: { type: 'string', default: '' },
        tabBackgroundHoverColor: { type: 'string', default: '' },
        arrowBackgroundColor: { type: 'string', default: '' },
        arrowBackgroundHoverColor: { type: 'string', default: '' },
        arrowTextColor: { type: 'string', default: '' },
        arrowTextHoverColor: { type: 'string', default: '' },
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

        useEffect(() => {
            const styleId = 'rs-timeline-slider-root-vars';
            let styleTag = document.getElementById(styleId);

            const cssVars = Object.entries(buildStyleVars(attributes))
                .filter(([, value]) => value !== undefined)
                .map(([key, value]) => `${key}: ${value};`)
                .join('\n');

            const css = `.timeline-slider-editor {\n${cssVars}\n}`;

            if (!styleTag) {
                styleTag = document.createElement('style');
                styleTag.id = styleId;
                document.head.appendChild(styleTag);
            }

            styleTag.textContent = css;

            return () => {
                styleTag?.remove();
            };
        }, [attributes]);

        const blockProps = useBlockProps({
            className: 'timeline-slider-editor',
            'data-slider': 'true',
        });

        return (
            <>
                <InspectorControls>
                    <PanelBody title={__('Styles')}>
                        <div style={{ marginBottom: '1em' }}>
                            <label style={{ display: 'block', marginBottom: '0.5em' }}>
                                {__('Block Background')}
                            </label>
                            <ColorPickerCircle
                                value={attributes.parentBackgroundColor}
                                onChange={(value) => setAttributes({ parentBackgroundColor: value })}
                            />
                        </div>

                        <div style={{ marginBottom: '1em' }}>
                            <label style={{ display: 'block', marginBottom: '0.5em' }}>
                                {__('Tab Background')}
                            </label>
                            <div style={{ display: 'flex', gap: '20px' }}>
                                <ColorPickerCircle
                                    label={__('Normal')}
                                    value={attributes.tabBackgroundColor}
                                    onChange={(value) => setAttributes({ tabBackgroundColor: value })}
                                />
                                <ColorPickerCircle
                                    label={__('Hover')}
                                    value={attributes.tabBackgroundHoverColor}
                                    onChange={(value) => setAttributes({ tabBackgroundHoverColor: value })}
                                />
                            </div>
                        </div>

                        <div style={{ marginBottom: '1em' }}>
                            <label style={{ display: 'block', marginBottom: '0.5em' }}>
                                {__('Arrow Background')}
                            </label>
                            <div style={{ display: 'flex', gap: '20px' }}>
                                <ColorPickerCircle
                                    label={__('Normal')}
                                    value={attributes.arrowBackgroundColor}
                                    onChange={(value) => setAttributes({ arrowBackgroundColor: value })}
                                />
                                <ColorPickerCircle
                                    label={__('Hover')}
                                    value={attributes.arrowBackgroundHoverColor}
                                    onChange={(value) => setAttributes({ arrowBackgroundHoverColor: value })}
                                />
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5em' }}>
                                {__('Arrow Text')}
                            </label>
                            <div style={{ display: 'flex', gap: '20px' }}>
                                <ColorPickerCircle
                                    label={__('Normal')}
                                    value={attributes.arrowTextColor}
                                    onChange={(value) => setAttributes({ arrowTextColor: value })}
                                />
                                <ColorPickerCircle
                                    label={__('Hover')}
                                    value={attributes.arrowTextHoverColor}
                                    onChange={(value) => setAttributes({ arrowTextHoverColor: value })}
                                />
                            </div>
                        </div>
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
                    <div className="wp-block-group__inner-container">
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
            className: 'timeline-slider',
            'data-slider': 'true',
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