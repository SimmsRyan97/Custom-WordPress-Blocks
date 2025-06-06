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
    SelectControl,
    TextControl,
} from '@wordpress/components';
import {
    plus,
    angleDown,
} from '@wordpress/icons';
import { dispatch } from '@wordpress/data';
import { useEffect } from '@wordpress/element';

import './editor.scss';
import './style.scss';

// Prefix for CSS variables
const VAR_PREFIX = '--rs-slider-';

const buildStyleVars = (attributes) => ({
    [`${VAR_PREFIX}background`]: attributes.background || undefined,
    [`${VAR_PREFIX}tab-background`]: attributes.tabBackground || undefined,
    [`${VAR_PREFIX}tab-background-hover`]: attributes.tabBackgroundHover || undefined,
    [`${VAR_PREFIX}arrow-background`]: attributes.arrowBackground || undefined,
    [`${VAR_PREFIX}arrow-background-hover`]: attributes.arrowBackgroundHover || undefined,
    [`${VAR_PREFIX}arrow-text`]: attributes.arrowText || undefined,
    [`${VAR_PREFIX}arrow-text-hover`]: attributes.arrowTextHover || undefined,
    [`${VAR_PREFIX}tab-font-family`]: attributes.tabFontFamily === 'heading'
        ? 'var(--global-heading-font-family)'
        : 'var(--global-body-font-family)',
    [`${VAR_PREFIX}tab-border-color`]: attributes.tabBorderColor || undefined,
    [`${VAR_PREFIX}tab-border-width`]: attributes.tabBorderWidth || undefined,
    [`${VAR_PREFIX}tab-border-radius`]: attributes.tabBorderRadius || undefined,
    [`${VAR_PREFIX}tab-font-size`]: fontSizeMap[attributes.tabFontSize] || undefined,
});

const fontSizeMap = {
    sm: 'clamp(0.75rem, 0.8vw, 0.9rem)',
    md: 'clamp(0.875rem, 1vw, 1rem)',
    lg: 'clamp(1rem, 1.2vw, 1.25rem)',
    xl: 'clamp(1.25rem, 1.5vw, 1.5rem)',
    '2xl': 'clamp(1.5rem, 1.75vw, 1.75rem)',
    '3xl': 'clamp(1.75rem, 2vw, 2rem)',
};

const ALLOWED_BLOCKS = ['rs/timeline-slider-child'];

const ColorPickerCircle = ({ value, onChange, label }) => (
    <div>
        <label style={{ display: 'block', marginBottom: '0.5em', fontSize: '0.85rem' }}>{label}</label>
        <DropdownMenu
            icon={null}
            label={label}
            toggleProps={{
                style: {
                    backgroundColor: value || 'repeating-conic-gradient(#ccc 0% 25%, transparent 0% 50%) 50% / 10px 10px',
                    borderRadius: '50%',
                    width: '30px',
                    height: '30px',
                    border: '1px solid #ccc',
                    cursor: 'pointer',
                },
                'aria-label': `${label} Colour Picker`,
            }}
            popoverProps={{ placement: 'bottom-start', offset: [0, 4] }}
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
        background: { type: 'string', default: '' },
        tabBackground: { type: 'string', default: '' },
        tabBackgroundHover: { type: 'string', default: '' },
        tabFontFamily: { type: 'string', default: 'body' },
        tabFontSize: { type: 'string', default: 'md' },
        tabBorderColor: { type: 'string', default: '' },
        tabBorderWidth: { type: 'string', default: '' },
        tabBorderRadius: { type: 'string', default: '' },
        arrowBackground: { type: 'string', default: '' },
        arrowBackgroundHover: { type: 'string', default: '' },
        arrowText: { type: 'string', default: '' },
        arrowTextHover: { type: 'string', default: '' },
        blockId: { type: 'string' },
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
            if (!attributes.blockId) {
                setAttributes({ blockId: `slider-${clientId}` });
            }
        }, []);

        useEffect(() => {
            if (!attributes.blockId) return;

            const styleId = `rs-timeline-slider-vars-${attributes.blockId}`;
            let styleTag = document.getElementById(styleId);

            const cssVars = Object.entries(buildStyleVars(attributes))
                .filter(([, value]) => value !== undefined)
                .map(([key, value]) => `${key}: ${value};`)
                .join('\n');

            const css = `.${attributes.blockId} {\n${cssVars}\n}`;

            if (!styleTag) {
                styleTag = document.createElement('style');
                styleTag.id = styleId;
                document.head.appendChild(styleTag);
            }

            styleTag.textContent = css;

            return () => {
                if (styleTag && document.getElementById(styleId)) {
                    styleTag.remove();
                }
            };
        }, [attributes]);

        const blockProps = useBlockProps({
            className: `timeline-slider-editor ${attributes.blockId}`,
            'data-slider': 'true',
        });

        return (
            <>
                <InspectorControls>
                    <PanelBody title={__('Styles')}>
                        <ColorPickerCircle
                            label={__('Block Background')}
                            value={attributes.background}
                            onChange={(value) => setAttributes({ background: value })}
                        />
                        <div style={{ marginTop: '1em' }}>
                            <label>{__('Tab Background')}</label>
                            <div style={{ display: 'flex', gap: '20px' }}>
                                <ColorPickerCircle
                                    label={__('Normal')}
                                    value={attributes.tabBackground}
                                    onChange={(value) => setAttributes({ tabBackground: value })}
                                />
                                <ColorPickerCircle
                                    label={__('Hover')}
                                    value={attributes.tabBackgroundHover}
                                    onChange={(value) => setAttributes({ tabBackgroundHover: value })}
                                />
                            </div>
                            <ColorPickerCircle
                                label={__('Tab Border Colour')}
                                value={attributes.tabBorderColor}
                                onChange={(value) => setAttributes({ tabBorderColor: value })}
                            />
                            <TextControl
                                label={__('Border Width')}
                                value={attributes.tabBorderWidth}
                                onChange={(value) => setAttributes({ tabBorderWidth: value })}
                            />
                            <TextControl
                                label={__('Border Radius')}
                                value={attributes.tabBorderRadius}
                                onChange={(value) => setAttributes({ tabBorderRadius: value })}
                            />
                        </div>
                        <div style={{ marginTop: '1em' }}>
                            <label>{__('Arrow Background')}</label>
                            <div style={{ display: 'flex', gap: '20px' }}>
                                <ColorPickerCircle
                                    label={__('Normal')}
                                    value={attributes.arrowBackground}
                                    onChange={(value) => setAttributes({ arrowBackground: value })}
                                />
                                <ColorPickerCircle
                                    label={__('Hover')}
                                    value={attributes.arrowBackgroundHover}
                                    onChange={(value) => setAttributes({ arrowBackgroundHover: value })}
                                />
                            </div>
                        </div>
                        <div style={{ marginTop: '1em' }}>
                            <label>{__('Arrow Text')}</label>
                            <div style={{ display: 'flex', gap: '20px' }}>
                                <ColorPickerCircle
                                    label={__('Normal')}
                                    value={attributes.arrowText}
                                    onChange={(value) => setAttributes({ arrowText: value })}
                                />
                                <ColorPickerCircle
                                    label={__('Hover')}
                                    value={attributes.arrowTextHover}
                                    onChange={(value) => setAttributes({ arrowTextHover: value })}
                                />
                            </div>
                        </div>
                    </PanelBody>
                    <PanelBody title={__('Typography')}>
                        <SelectControl
                            label={__('Tab Font Family')}
                            value={attributes.tabFontFamily}
                            options={[
                                { label: 'Body Font', value: 'body' },
                                { label: 'Heading Font', value: 'heading' },
                            ]}
                            onChange={(value) => setAttributes({ tabFontFamily: value })}
                        />
                        <SelectControl
                            label={__('Tab Font Size')}
                            value={attributes.tabFontSize}
                            options={[
                                { label: 'Small', value: 'sm' },
                                { label: 'Medium', value: 'md' },
                                { label: 'Large', value: 'lg' },
                                { label: 'XL', value: 'xl' },
                                { label: '2XL', value: '2xl' },
                                { label: '3XL', value: '3xl' },
                            ]}
                            onChange={(value) => setAttributes({ tabFontSize: value })}
                        />
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
                            popoverProps={{ placement: 'bottom-start', offset: [0, 4] }}
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
                                        onChange={(value) => setAttributes({ innerContentWidth: value })}
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
        const { innerContentWidth, blockId } = attributes;

        const blockProps = useBlockProps.save({
            className: `timeline-slider ${blockId}`,
            'data-slider': 'true',
        });

        const cssVars = Object.entries(buildStyleVars(attributes))
            .filter(([, val]) => val !== undefined && val !== '')
            .map(([key, val]) => `${key}: ${val};`)
            .join('\n');

        const styleTag = (
            <style
                dangerouslySetInnerHTML={{
                    __html: `.${blockId} {\n${cssVars}\n}`,
                }}
            />
        );

        return (
            <>
                {styleTag}
                <div {...blockProps}>
                    <div className={`wp-block-group__inner-container ${innerContentWidth ? 'kb-theme-content-width' : ''}`}>
                        <InnerBlocks.Content />
                    </div>
                </div>
            </>
        );
    },
});