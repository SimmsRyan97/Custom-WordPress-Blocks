import {
  DropdownMenu,
  SelectControl,
  TextControl,
  ColorPalette,
  TabPanel,
  PanelBody,
} from '@wordpress/components';

import { useState, useEffect } from '@wordpress/element';

import { __ } from '@wordpress/i18n';

import { useSetting } from '@wordpress/block-editor';

import { blockDefault, brush, cog } from '@wordpress/icons';

// Using Kadence font map
const fontSizeMap = {
  sm: 'var(--global-kb-font-size-sm, var(--global-font-size-small))',
  md: 'var(--global-kb-font-size-md, var(--global-font-size-medium))',
  lg: 'var(--global-kb-font-size-lg, var(--global-font-size-large))',
  xl: 'var(--global-kb-font-size-xl, var(--global-font-size-larger))',
  '2xl': 'var(--global-kb-font-size-2xl, var(--global-font-size-xxlarge))',
  '3xl': 'var(--global-kb-font-size-xxxl, 4rem)',
};

// Checkerboard style for transparent colour
const checkerboardStyle = {
	background:
		'repeating-conic-gradient(#ccc 0% 25%, transparent 0% 50%) 50% / 10px 10px',
	borderRadius: '50%',
	width: '30px',
	height: '30px',
	border: '1px solid #ccc',
	cursor: 'pointer',
	display: 'inline-block',
};

// Blank style for no colour
const noColorStyle = {
	position: 'relative',
	width: '30px',
	height: '30px',
	borderRadius: '50%',
	border: '1px solid #ccc',
	backgroundColor: 'transparent',
	cursor: 'pointer',
	display: 'inline-block',
};

// Diagonal line on no colour
const diagonalLine = {
	content: '""',
	position: 'absolute',
	top: '50%',
	left: '0',
	width: '100%',
	height: '2px',
	background: '#777',
	transform: 'rotate(-45deg)',
	transformOrigin: 'center',
};

// HEX to RGBA Converter
const hexToRGBA = (hex, alpha) => {
	if (!hex) return 'transparent';
	let r = 0, g = 0, b = 0;

	// Expand shorthand form (#03F) to full form (#0033FF)
	if (hex.length === 4) {
		r = parseInt(hex[1] + hex[1], 16);
		g = parseInt(hex[2] + hex[2], 16);
		b = parseInt(hex[3] + hex[3], 16);
	} else if (hex.length === 7) {
		r = parseInt(hex.slice(1, 3), 16);
		g = parseInt(hex.slice(3, 5), 16);
		b = parseInt(hex.slice(5, 7), 16);
	}
	return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

// RGB to HEX Converter
const rgbToHex = (r, g, b) => {
	return (
		'#' +
		[r, g, b]
			.map((x) => {
				const hex = x.toString(16);
				return hex.length === 1 ? '0' + hex : hex;
			})
			.join('')
	);
};

// Variable to RGB Converter
const resolveCSSVarToRGB = (cssVar) => {
	if (!cssVar?.startsWith('var(')) return null;

	// Extract the CSS variable name, e.g., "--wp--preset--color--blue"
	const varName = cssVar.match(/var\((--[^)]+)\)/)?.[1];
	if (!varName) return null;

	// Create a temporary element to read computed style
	const temp = document.createElement('div');
	temp.style.display = 'none';
	temp.style.setProperty('--temp-color', `var(${varName})`);
	temp.style.color = 'var(--temp-color)';
	document.body.appendChild(temp);

	const rgb = getComputedStyle(temp).color;
	document.body.removeChild(temp);

	return rgb; // e.g. "rgb(52, 168, 83)"
};

const applyAlphaToCSSVar = (cssVar, alpha) => {
	const rgb = resolveCSSVarToRGB(cssVar);
	if (!rgb) return cssVar;

	const match = rgb.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
	if (!match) return cssVar;

	const [r, g, b] = match.slice(1).map(Number);
	return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

// Add value and unit
const formatValueWithUnit = (val, unit = 'px') => {
    if (val === undefined || val === '') return undefined;
    return `${val}${unit}`;
};

// Colour circle with fallback & clear support
const ColorPickerCircle = ({ value, onChange, label }) => {
	const themeColors = useSetting('color.palette.theme');

	const [localColor, setLocalColor] = useState();
	const [alpha, setAlpha] = useState(100);
	const [selectedPaletteColor, setSelectedPaletteColor] = useState();

	useEffect(() => {
		if (!value || value === 'transparent') {
			setAlpha(0);
			setLocalColor(''); // clear colour to avoid false black
		} else if (value.startsWith('rgba')) {
			const match = value.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*(\d*\.?\d+)\)/);
			if (match) {
				const [r, g, b, a] = match.slice(1).map(Number);
				const hex = rgbToHex(r, g, b);
				setLocalColor(hex);
				setAlpha(Math.round(a * 100));
			}
		} else {
			setAlpha(100);
			setLocalColor(value);
		}
	}, [value]);

	const handleColorChange = (newColor) => {
		const isCSSVar = newColor?.startsWith('var(');
		setSelectedPaletteColor(newColor);

		const newAlpha = 100;
		setAlpha(newAlpha);

		if (isCSSVar) {
			setLocalColor('');
			onChange(newColor);
		} else {
			setLocalColor(newColor);
			const rgba = hexToRGBA(newColor, newAlpha / 100);
			onChange(rgba);
		}
	};

	const handleAlphaChange = (newAlpha) => {
		const clampedAlpha = Math.max(0, Math.min(100, newAlpha));
		setAlpha(clampedAlpha);

		if (value?.startsWith?.('var(')) {
			const rgba = applyAlphaToCSSVar(value, clampedAlpha / 100);
			onChange(rgba);
		} else {
			const rgba = hexToRGBA(localColor, clampedAlpha / 100);
			onChange(rgba);
		}
	};

	const renderToggle = () => {
		if (!value) {
			return (
				<span style={noColorStyle} aria-hidden="true">
					<span style={diagonalLine} />
				</span>
			);
		}

		if (!localColor || alpha === 0 || value === 'transparent') {
			return <span style={checkerboardStyle} aria-hidden="true" />;
		}

		return (
			<span
				style={{
					backgroundColor: value,
					borderRadius: '50%',
					width: '30px',
					height: '30px',
					border: '1px solid #ccc',
					cursor: 'pointer',
					display: 'inline-block',
				}}
				aria-hidden="true"
			/>
		);
	};

	return (
		<div style={{ display: 'grid', gap: '1em', padding: '1em 0' }}>
			<label style={{ display: 'block', fontSize: '0.85rem' }}>{label}</label>

		<DropdownMenu
		icon={null}
		toggleProps={{
			style: { padding: 0 },
			'aria-label': `${label} Colour Picker`,
			title: value
			? `Current colour: ${value}. Click to change.`
			: 'No colour set. Click to pick colour.',
			children: renderToggle(),
		}}
		popoverProps={{ placement: 'bottom-start', offset: [0, 4] }}
		>
				{() => (
					<div>
						<ColorPalette
							colors={themeColors}
							value={selectedPaletteColor}
							onChange={handleColorChange}
							disableCustomColors={false}
						/>

						<div>
							<label style={{ fontSize: '0.75rem', display: 'block', marginBottom: '0.25em' }}>
								Transparency ({100 - alpha}% transparent)
							</label>
							<input
								type="range"
								min={0}
								max={100}
								value={alpha}
								onChange={(e) => handleAlphaChange(Number(e.target.value))}
								style={{ width: '100%' }}
							/>
						</div>
					</div>
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

// Custom tabs
const CustomTabPanel = ({
  className = '',
  generalContent = null,
  styleContent = null,
  attributes,
  setAttributes,
}) => {

  const { htmlAnchor = '', extraClassNames = '' } = attributes || {};

  return (
    <TabPanel
      className={`custom-tabs ${className}`}
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
          name: 'styles',
          title: (
            <>
              {brush} {__('Styles')}
            </>
          ),
          className: 'tab-styles',
        },
        {
          name: 'advanced',
          title: (
            <>
              {cog} {__('Advanced')}
            </>
          ),
          className: 'tab-advanced',
        },
      ]}
    >
      {(tab) => {
        switch (tab.name) {
          case 'general':
            return generalContent;

          case 'styles':
            return styleContent;

          case 'advanced':
            return (
              <PanelBody className={ "rs-block-advanced-panel" } title={__('Advanced Settings')}>
                <TextControl
                  label={__('HTML Anchor')}
                  help={__('Specify a unique ID for the block (e.g., "my-block-id").')}
                  value={htmlAnchor}
                  onChange={(val) => setAttributes({ htmlAnchor: val })}
                />
                <TextControl
                  label={__('Additional CSS Class(es)')}
                  help={__('Add extra CSS class names for custom styling. Separate with spaces.')}
                  value={extraClassNames}
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
};

export {
  fontSizeMap,
  ColorPickerCircle,
  UnitInputControl,
  formatValueWithUnit,
  CustomTabPanel,
};