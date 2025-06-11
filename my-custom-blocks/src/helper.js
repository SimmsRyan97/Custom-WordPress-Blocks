import {
  DropdownMenu,
  SelectControl,
  TextControl,
  ColorPalette,
} from '@wordpress/components';

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
    return (
        <div>
            <label style={{ fontWeight: '600', display: 'block', marginBottom: '0.5em', fontSize: '0.85rem' }}>{label}</label>
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

export {
  fontSizeMap,
  checkerboardStyle,
  ColorPickerCircle,
  UnitInputControl,
  formatValueWithUnit,
};