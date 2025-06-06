import { __ } from "@wordpress/i18n";
import { registerBlockType, createBlock } from '@wordpress/blocks';
import {
    useBlockProps,
    InnerBlocks,
    BlockControls,
    InspectorControls,
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
import { useSelect, dispatch } from '@wordpress/data';
import { useEffect } from '@wordpress/element';

import './editor.scss';
import './style.scss';

// Prefix for CSS variables
const VAR_PREFIX = '--rs-slider-';
const ALLOWED_BLOCKS = ['rs/timeline-slider-child'];

const fontSizeMap = {
    sm: 'var(--global-kb-font-size-sm)',
    md: 'var(--global-kb-font-size-md)',
    lg: 'var(--global-kb-font-size-lg)',
    xl: 'var(--global-kb-font-size-xl)',
    '2xl': 'var(--global-kb-font-size-2xl)',
    '3xl': 'var(--global-kb-font-size-xxxl)',
};

// Checkerboard style for transparent colour fallback
const checkerboardStyle = {
    background: 'repeating-conic-gradient(#ccc 0% 25%, transparent 0% 50%) 50% / 10px 10px',
    borderRadius: '50%',
    width: '30px',
    height: '30px',
    border: '1px solid #ccc',
    cursor: 'pointer',
    display: 'inline-block',
};

// Colour circle with fallback & clear support
const ColorPickerCircle = ({ value, onChange, label }) => {
    // Clear colour handler
    const clearColor = () => onChange('');

    return (
        <div style={{ marginBottom: '1em' }}>
            <label style={{ display: 'block', marginBottom: '0.5em', fontSize: '0.85rem' }}>{label}</label>
            <DropdownMenu
                icon={null}
                label={label}
                toggleProps={{
                    style: {
                        backgroundColor: value || 'transparent',
                        ...(!value ? checkerboardStyle : {
                            borderRadius: '50%',
                            width: '30px',
                            height: '30px',
                            border: '1px solid #ccc',
                            cursor: 'pointer',
                        }),
                    },
                    'aria-label': `${label} Colour Picker`,
                    title: value ? `Current colour: ${value}. Click to change.` : 'No colour set. Click to pick colour.',
                }}
                popoverProps={{ placement: 'bottom-start', offset: [0, 4] }}
            >
                {() => (
                    <>
                        <ColorPalette
                            value={value}
                            onChange={onChange}
                            disableCustomColors={false}
                        />
                        {value && (
                            <div style={{ marginTop: '8px', textAlign: 'right' }}>
                                <button
                                    type="button"
                                    onClick={clearColor}
                                    style={{
                                        background: 'transparent',
                                        border: 'none',
                                        color: '#666',
                                        cursor: 'pointer',
                                        fontSize: '0.85rem',
                                        textDecoration: 'underline',
                                        padding: 0,
                                    }}
                                >
                                    Clear colour
                                </button>
                            </div>
                        )}
                    </>
                )}
            </DropdownMenu>
        </div>
    );
};

// Unit + value input control
const UnitInputControl = ({ label, value, unit, onChangeValue, onChangeUnit }) => (
    <div style={{ marginBottom: '1em' }}>
        <label style={{ fontWeight: '600', display: 'block', marginBottom: '0.25em' }}>{label}</label>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5em' }}>
            <TextControl
                value={value}
                onChange={onChangeValue}
                type="number"
                style={{ width: '70px' }}
                min="0"
            />
            <SelectControl
                value={unit}
                options={[
                    { label: 'px', value: 'px' },
                    { label: 'em', value: 'em' },
                    { label: 'rem', value: 'rem' },
                ]}
                onChange={onChangeUnit}
                style={{ width: '70px' }}
            />
        </div>
    </div>
);

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
    ...(attributes.useIndividualBorders
        ? {
            [`${VAR_PREFIX}tab-border-top-color`]: attributes.tabBorderTopColor || undefined,
            [`${VAR_PREFIX}tab-border-right-color`]: attributes.tabBorderRightColor || undefined,
            [`${VAR_PREFIX}tab-border-bottom-color`]: attributes.tabBorderBottomColor || undefined,
            [`${VAR_PREFIX}tab-border-left-color`]: attributes.tabBorderLeftColor || undefined,
        }
        : {
            [`${VAR_PREFIX}tab-border-color`]: attributes.tabBorderColor || undefined,
        }),
    [`${VAR_PREFIX}tab-border-radius`]: attributes.tabBorderRadius || undefined,
    [`${VAR_PREFIX}tab-font-size`]: fontSizeMap[attributes.tabFontSize] || undefined,
});

const formatValueWithUnit = (val, unit = 'px') => {
    if (val === undefined || val === '') return undefined;
    return `${val}${unit}`;
};

registerBlockType('rs/timeline-slider', {
    title: 'Timeline Slider',
    icon: 'schedule',
    category: 'layout',
    attributes: {
        activeSlideIndex: { type: 'number', default: 1 },
        align: { type: 'string' },
        innerContentWidth: { type: 'boolean', default: false },
        background: { type: 'string', default: '' },
        tabBackground: { type: 'string', default: '' },
        tabBackgroundHover: { type: 'string', default: '' },
        tabFontFamily: { type: 'string', default: 'heading' },
        tabFontSize: { type: 'string', default: 'md' },
        useIndividualBorders: { type: 'boolean', default: false },
        tabBorderTopWidth: { type: 'string', default: '' },
        tabBorderRightWidth: { type: 'string', default: '' },
        tabBorderBottomWidth: { type: 'string', default: '' },
        tabBorderLeftWidth: { type: 'string', default: '' },
        tabBorderTopWidthUnit: { type: 'string', default: 'px' },
        tabBorderRightWidthUnit: { type: 'string', default: 'px' },
        tabBorderBottomWidthUnit: { type: 'string', default: 'px' },
        tabBorderLeftWidthUnit: { type: 'string', default: 'px' },
        tabBorderTopColor: { type: 'string', default: '' },
        tabBorderRightColor: { type: 'string', default: '' },
        tabBorderBottomColor: { type: 'string', default: '' },
        tabBorderLeftColor: { type: 'string', default: '' },
        tabBorderColor: { type: 'string', default: '' },
        tabBorderWidth: { type: 'string', default: '' },
        tabBorderWidthUnit: { type: 'string', default: 'px' },
        tabBorderRadius: { type: 'string', default: '' },
        tabBorderRadiusUnit: { type: 'string', default: 'px' },
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
        const { activeSlideIndex } = attributes;

        const {
            innerContentWidth,
            useIndividualBorders,

            tabBorderTopWidth,
            tabBorderTopWidthUnit,
            tabBorderRightWidth,
            tabBorderRightWidthUnit,
            tabBorderBottomWidth,
            tabBorderBottomWidthUnit,
            tabBorderLeftWidth,
            tabBorderLeftWidthUnit,

            tabBorderTopColor,
            tabBorderRightColor,
            tabBorderBottomColor,
            tabBorderLeftColor,

            tabBorderWidth,
            tabBorderWidthUnit,
            tabBorderColor,

            tabBorderRadius,
            tabBorderRadiusUnit,
        } = attributes;

        useEffect(() => {
            if (!attributes.blockId) {
                setAttributes({ blockId: `slider-${clientId}` });
            }
        }, []);

        useEffect(() => {
            if (!attributes.blockId) return;

            const styleId = `rs-timeline-slider-vars-${attributes.blockId}`;
            let styleTag = document.getElementById(styleId);

            // Compose CSS variable values with units
            const getAllStyleVars = (attributes) => {
                const baseVars = buildStyleVars(attributes);
                const borderVars = attributes.useIndividualBorders
                    ? {
                            [`${VAR_PREFIX}tab-border-top-width`]: formatValueWithUnit(attributes.tabBorderTopWidth, attributes.tabBorderTopWidthUnit),
                            [`${VAR_PREFIX}tab-border-right-width`]: formatValueWithUnit(attributes.tabBorderRightWidth, attributes.tabBorderRightWidthUnit),
                            [`${VAR_PREFIX}tab-border-bottom-width`]: formatValueWithUnit(attributes.tabBorderBottomWidth, attributes.tabBorderBottomWidthUnit),
                            [`${VAR_PREFIX}tab-border-left-width`]: formatValueWithUnit(attributes.tabBorderLeftWidth, attributes.tabBorderLeftWidthUnit),
                        }
                    : {
                            [`${VAR_PREFIX}tab-border-width`]: formatValueWithUnit(attributes.tabBorderWidth, attributes.tabBorderWidthUnit),
                        };

                return {
                    ...baseVars,
                    ...borderVars,
                    [`${VAR_PREFIX}tab-border-radius`]: formatValueWithUnit(attributes.tabBorderRadius, attributes.tabBorderRadiusUnit),
                };
            };

            const cssVars = Object.entries(getAllStyleVars(attributes))
                .filter(([, val]) => val !== undefined && val !== '')
                .map(([key, val]) => `${key}: ${val};`)
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
        }, [
            attributes,
            tabBorderTopWidth, tabBorderTopWidthUnit,
            tabBorderRightWidth, tabBorderRightWidthUnit,
            tabBorderBottomWidth, tabBorderBottomWidthUnit,
            tabBorderLeftWidth, tabBorderLeftWidthUnit,
            tabBorderWidth, tabBorderWidthUnit,
            tabBorderRadius, tabBorderRadiusUnit,
        ]);

        // Get all inner blocks (child slides)
        const innerBlocks = useSelect(
            (select) => select('core/block-editor').getBlocks(clientId),
            [clientId]
        );

        // Clamp activeSlideIndex if necessary
        const clampedIndex = Math.min(activeSlideIndex, innerBlocks.length - 1);

        // Handle navigation clicks
        const goToSlide = (index) => {
            setAttributes({ activeSlideIndex: index });
        };

        return (
            <>
                <InspectorControls>
                    <PanelBody title={__('Styles')} initialOpen={true}>
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
                        </div>

                        {/* Border Controls */}
                        <ToggleControl
                            label={__('Use Individual Borders')}
                            checked={useIndividualBorders}
                            onChange={(val) => setAttributes({ useIndividualBorders: val })}
                            style={{ marginTop: '1em' }}
                        />

                        {!useIndividualBorders && (
                            <>
                                <ColorPickerCircle
                                    label={__('Tab Border Colour')}
                                    value={tabBorderColor}
                                    onChange={(value) => setAttributes({ tabBorderColor: value })}
                                />
                                <UnitInputControl
                                    label={__('Border Width')}
                                    value={tabBorderWidth}
                                    unit={tabBorderWidthUnit}
                                    onChangeValue={(val) => setAttributes({ tabBorderWidth: val })}
                                    onChangeUnit={(unit) => setAttributes({ tabBorderWidthUnit: unit })}
                                />
                            </>
                        )}

                        {useIndividualBorders && (
                            <>
                                <UnitInputControl
                                    label={__('Top Border Width')}
                                    value={tabBorderTopWidth}
                                    unit={tabBorderTopWidthUnit}
                                    onChangeValue={(val) => setAttributes({ tabBorderTopWidth: val })}
                                    onChangeUnit={(unit) => setAttributes({ tabBorderTopWidthUnit: unit })}
                                />
                                <ColorPickerCircle
                                    label={__('Top Border Colour')}
                                    value={tabBorderTopColor}
                                    onChange={(value) => setAttributes({ tabBorderTopColor: value })}
                                />

                                <UnitInputControl
                                    label={__('Right Border Width')}
                                    value={tabBorderRightWidth}
                                    unit={tabBorderRightWidthUnit}
                                    onChangeValue={(val) => setAttributes({ tabBorderRightWidth: val })}
                                    onChangeUnit={(unit) => setAttributes({ tabBorderRightWidthUnit: unit })}
                                />
                                <ColorPickerCircle
                                    label={__('Right Border Colour')}
                                    value={tabBorderRightColor}
                                    onChange={(value) => setAttributes({ tabBorderRightColor: value })}
                                />

                                <UnitInputControl
                                    label={__('Bottom Border Width')}
                                    value={tabBorderBottomWidth}
                                    unit={tabBorderBottomWidthUnit}
                                    onChangeValue={(val) => setAttributes({ tabBorderBottomWidth: val })}
                                    onChangeUnit={(unit) => setAttributes({ tabBorderBottomWidthUnit: unit })}
                                />
                                <ColorPickerCircle
                                    label={__('Bottom Border Colour')}
                                    value={tabBorderBottomColor}
                                    onChange={(value) => setAttributes({ tabBorderBottomColor: value })}
                                />

                                <UnitInputControl
                                    label={__('Left Border Width')}
                                    value={tabBorderLeftWidth}
                                    unit={tabBorderLeftWidthUnit}
                                    onChangeValue={(val) => setAttributes({ tabBorderLeftWidth: val })}
                                    onChangeUnit={(unit) => setAttributes({ tabBorderLeftWidthUnit: unit })}
                                />
                                <ColorPickerCircle
                                    label={__('Left Border Colour')}
                                    value={tabBorderLeftColor}
                                    onChange={(value) => setAttributes({ tabBorderLeftColor: value })}
                                />
                            </>
                        )}

                        {/* Border radius */}
                        <UnitInputControl
                            label={__('Border Radius')}
                            value={tabBorderRadius}
                            unit={tabBorderRadiusUnit}
                            onChangeValue={(val) => setAttributes({ tabBorderRadius: val })}
                            onChangeUnit={(unit) => setAttributes({ tabBorderRadiusUnit: unit })}
                        />

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

                    <PanelBody title={__('Typography')} initialOpen={false}>
                        <SelectControl
                            label={__('Tab Font Family')}
                            value={attributes.tabFontFamily}
                            options={[
                                { label: 'Body Font Family', value: 'body' },
                                { label: 'Heading Font Family', value: 'heading' },
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
                    <ToolbarGroup>
                        <ToolbarButton
                            icon="arrow-left-alt"
                            label="Previous Slide"
                            onClick={() => goToSlide(Math.max(clampedIndex - 1, 0))}
                            disabled={clampedIndex === 0}
                        />
                        <ToolbarButton
                            icon="arrow-right-alt"
                            label="Next Slide"
                            onClick={() => goToSlide(Math.min(clampedIndex + 1, innerBlocks.length - 1))}
                            disabled={clampedIndex === innerBlocks.length - 1}
                        />
                    </ToolbarGroup>
                </BlockControls>

                <div {...useBlockProps({ className: `timeline-slider-editor active-slide-${clampedIndex}` })}>
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
        const { innerContentWidth, blockId, clampedIndex } = attributes;

        const blockProps = useBlockProps.save({
            className: `timeline-slider ${blockId} active-slide-${clampedIndex}`,
            'data-slider': 'true',
        });

    const cssVars = Object.entries(getAllStyleVars(attributes))
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