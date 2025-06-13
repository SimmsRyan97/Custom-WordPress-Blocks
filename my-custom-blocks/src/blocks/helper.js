import {
  DropdownMenu,
  SelectControl,
  TextControl,
  ColorPalette,
  TabPanel,
} from '@wordpress/components';

import { __ } from '@wordpress/i18n';

import { useSetting } from '@wordpress/block-editor';

import { blockDefault, adminCustomizer, ellipsis } from '@wordpress/icons';

// Using Kadence font map
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

// Add value and unit
const formatValueWithUnit = (val, unit = 'px') => {
    if (val === undefined || val === '') return undefined;
    return `${val}${unit}`;
};

// Colour circle with fallback & clear support
const ColorPickerCircle = ({ value, onChange, label }) => {
    const themeColors = useSetting( 'color.palette.theme' );
    return (
        <div style={{ display: 'grid', gap: '1em', padding: '1em 0'}}>
            <label style={{ display: 'block', fontSize: '0.85rem' }}>{label}</label>
            <DropdownMenu
                icon={null}
                label={<strong>{label}</strong>}
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
                            colors={themeColors}
                            value={value}
                            onChange={onChange}
                            disableCustomColors={false}
                        />
                    </>
                )}
            </DropdownMenu>
        </div>
    );
};

// Unit + value input control
const UnitInputControl = ({ label, value, unit, onChangeValue, onChangeUnit }) => (
    <div style={{ display: 'grid', gap: '0.5em', marginBottom: '0.25em' }}>
        <label style={{ fontWeight: '600', display: 'block', marginBottom: '0.25em' }}>{label}</label>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5em' }}>
            <TextControl
                value={value}
                onChange={onChangeValue}
                type="number"
                style={{
                    width: '70px',
                    marginBottom: 0,
                }}
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
                style={{
                    width: '70px',
                    marginBottom: 0,
                }}
            />
        </div>
    </div>
);

const CustomTabPanel = ({
  className = '',
  generalContent = null,
  styleContent = null,
  advancedContent = null,
  attributes,
  setAttributes,
}) => (
  <TabPanel
    className={className}
    activeClass="active-tab"
    tabs={[
      {
        name: 'general',
        title: (
          <>
            {blockDefault} {__('General')}
          </>
        ),
        className: 'tab-general',
      },
      {
        name: 'style',
        title: (
          <>
            {adminCustomizer} {__('Style')}
          </>
        ),
        className: 'tab-style',
      },
      {
        name: 'advanced',
        title: (
          <>
            {ellipsis} {__('Advanced')}
          </>
        ),
        className: 'tab-advanced',
      },
    ]}
  >
    {(tab) => {
      switch (tab.name) {
        case 'general':
          return <PanelBody title={__('General Settings')}>{generalContent}</PanelBody>;

        case 'style':
          return <PanelBody title={__('Styles')}>{styleContent}</PanelBody>;

        case 'advanced':
          return (
            <PanelBody title={__('Advanced Settings')}>
              {advancedContent}
              <TextControl
                label={__('HTML Anchor')}
                help={__('Specify a unique ID for the block (e.g., "my-block-id").')}
                value={attributes?.htmlAnchor}
                onChange={(val) => setAttributes({ htmlAnchor: val })}
              />
              <TextControl
                label={__('Additional CSS Class(es)')}
                help={__('Add extra CSS class names for custom styling. Separate with spaces.')}
                value={attributes?.extraClassNames}
                onChange={(val) => setAttributes({ extraClassNames: val })}
              />
            </PanelBody>
          );

        default:
          return null;
      }
    }}
  </TabPanel>
);

export {
  fontSizeMap,
  checkerboardStyle,
  ColorPickerCircle,
  UnitInputControl,
  formatValueWithUnit,
  CustomTabPanel,
};