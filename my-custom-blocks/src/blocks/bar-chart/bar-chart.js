import { registerBlockType } from "@wordpress/blocks";
import { useBlockProps, InspectorControls, ColorPalette } from "@wordpress/block-editor";
import {
  PanelBody,
  TextControl,
  ColorPicker,
  Button,
  TabPanel,
} from "@wordpress/components";

import './editor.scss';
import './style.scss';

registerBlockType("rs/bar-chart", {
  title: "Bar Chart Comparison",
  icon: "chart-bar",
  category: "design",
  attributes: {
    barOneStart: { type: "number", default: 0 },
    barOneEnd: { type: "number", default: 50 },
    barOneText: { type: "string", default: "Bar One" },
    barTwoStart: { type: "number", default: 0 },
    barTwoEnd: { type: "number", default: 50 },
    barTwoText: { type: "string", default: "Bar Two" },
    barTwoColour: { type: "string", default: "rgb(0, 0, 0)" },
    suffix: { type: "string", default: "%" },
    isBold: { type: "boolean", default: false },
    isItalic: { type: "boolean", default: false },
    isUnderlined: { type: "boolean", default: false },
    htmlAnchor: { type: "string", default: "" },
    extraClassNames: { type: "string", default: "" },
  },
  edit({ attributes, setAttributes }) {
    const {
      barOneStart,
      barOneEnd,
      barOneText,
      barTwoStart,
      barTwoEnd,
      barTwoText,
      barTwoColour,
      suffix,
      isBold,
      isItalic,
      isUnderlined,
    } = attributes;

    const blockProps = useBlockProps();

    // Debounced change handler for values
    const handleChange = (key, value) => {
      if (!isNaN(value)) {
        setAttributes({ [key]: parseFloat(value) });
      }
    };

    // Calculate dynamic color for the first bar (barOne)
    const dynamicBarOneColor =
      parseFloat(barOneEnd) > parseFloat(barTwoEnd)
        ? "rgb(1, 170, 41)" // Green if barOneEnd is greater
        : Math.abs(parseFloat(barOneEnd) - parseFloat(barTwoEnd)) <= 2
        ? "rgb(1, 170, 41)" // Green for small difference
        : Math.abs(parseFloat(barOneEnd) - parseFloat(barTwoEnd)) <= 5
        ? "rgb(231, 181, 0)" // Yellow
        : "rgb(240, 0, 0)"; // Red

    // Calculate total range for each bar
    const barTwoRange = parseFloat(barTwoEnd) - parseFloat(barTwoStart);
    const barOneRange = parseFloat(barOneEnd) - parseFloat(barOneStart);

    // Calculate widths for each bar based on its range
    const barTwoWidth =
      (barTwoRange / Math.max(barTwoRange, barOneRange)) * 100;
    const barOneWidth =
      (barOneRange / Math.max(barTwoRange, barOneRange)) * 100;

    // Ensure the width doesn't go beyond 100% or below 0%
    const adjustedBarTwoWidth = Math.min(100, Math.max(0, barTwoWidth));
    const adjustedBarOneWidth = Math.min(100, Math.max(0, barOneWidth));

    // Apply styles conditionally
    const textStyles = {
      fontWeight: isBold ? "bold" : "normal",
      fontStyle: isItalic ? "italic" : "normal",
      textDecoration: isUnderlined ? "underline" : "none",
    };

    return (
      <>
        <InspectorControls>
          <TabPanel
            className="my-custom-tabs"
            activeClass="active-tab"
            tabs={[
              {
                name: "general",
                title: (
                  <>
                    <span className="dashicons dashicons-block-default"></span>{" "}
                    General
                  </>
                ),
                className: "tab-general",
              },
              {
                name: "style",
                title: (
                  <>
                    <span className="dashicons dashicons-admin-customizer"></span>{" "}
                    Style
                  </>
                ),
                className: "tab-style",
              },
              {
                name: "advanced",
                title: (
                  <>
                    <span className="dashicons dashicons-ellipsis"></span>{" "}
                    Advanced
                  </>
                ),
                className: "tab-advanced",
              },
            ]}
          >
            {(tab) => {
              switch (tab.name) {
                case "general":
                  return (
                    <PanelBody title="General Settings">
                      <TextControl
                        label="Bar One Start Value"
                        value={barOneStart}
                        onChange={(val) => handleChange('barOneStart', val)}
                      />
                      <TextControl
                        label="Bar One End Value"
                        value={barOneEnd}
                        onChange={(val) => handleChange('barOneEnd', val)}
                      />
                      <TextControl
                        label="Bar One Text"
                        value={barOneText}
                        onChange={(val) => setAttributes({ barOneText: val })}
                      />
                      <TextControl
                        label="Bar Two Start Value"
                        value={barTwoStart}
                        onChange={(val) => handleChange('barTwoStart', val)}
                      />
                      <TextControl
                        label="Bar Two End Value"
                        value={barTwoEnd}
                        onChange={(val) => handleChange('barTwoEnd', val)}
                      />
                      <TextControl
                        label="Bar Two Text"
                        value={barTwoText}
                        onChange={(val) => setAttributes({ barTwoText: val })}
                      />
                      <TextControl
                        label="Value Suffix"
                        value={suffix}
                        onChange={(val) => setAttributes({ suffix: val })}
                      />
                    </PanelBody>
                  );

                case "style":
                  return (
                    <>
                      <PanelBody title="Bar Colour">
                          <ColorPalette
                              colors={wp.data.select("core/block-editor").getSettings().colors}
                              value={barTwoColour}
                              onChange={(val) => setAttributes({ barTwoColour: val })}
                          />
                          <ColorPicker
                              color={barTwoColour}
                              onChange={(val) => setAttributes({ barTwoColour: val })}
                          />
                      </PanelBody>

                      <PanelBody title="Text Styling">
                        <div className="text-styling-buttons">
                          <Button
                            onClick={() => setAttributes({ isBold: !isBold })}
                            className={attributes.isBold ? "active" : ""}
                          >
                            B
                          </Button>
                          <Button
                            onClick={() => setAttributes({ isItalic: !isItalic })}
                            className={attributes.isItalic ? "active" : ""}
                          >
                            I
                          </Button>
                          <Button
                            onClick={() => setAttributes({ isUnderlined: !isUnderlined })}
                            className={attributes.isUnderlined ? "active" : ""}
                          >
                            U
                          </Button>
                        </div>
                      </PanelBody>
                    </>
                  );

                case "advanced":
                  return (
                    <PanelBody title="Advanced Settings">
                      <TextControl
                        label="HTML Anchor"
                        help="Specify a unique ID for the block (e.g., 'my-block-id')."
                        value={attributes.htmlAnchor}
                        onChange={(val) => setAttributes({ htmlAnchor: val })}
                      />
                      <TextControl
                        label="Additional CSS Class(es)"
                        help="Add extra CSS class names for custom styling. Separate with spaces."
                        value={attributes.extraClassNames}
                        onChange={(val) =>
                          setAttributes({ extraClassNames: val })
                        }
                      />
                    </PanelBody>
                  );

                default:
                  return null;
              }
            }}
          </TabPanel>
        </InspectorControls>

        <div {...blockProps}>
          <div className="bar-chart">
            <div className="bar" key={`bar-one-${barOneEnd}`} style={{ marginBottom: "20px" }}>
              <p className="wp-block-paragraph" style={textStyles}>
                {barOneText}
              </p>
              <div
                className="bar-fill"
                style={{
                  backgroundColor: dynamicBarOneColor,
                  width: `${adjustedBarOneWidth}%`,
                }}
              />
              <div className="bar-value">
                {barOneEnd} {suffix}
              </div>
            </div>

            <div className="bar" key={`bar-two-${barTwoEnd}`} style={{ marginBottom: "20px" }}>
              <p className="wp-block-paragraph" style={textStyles}>
                {barTwoText}
              </p>
              <div
                className="bar-fill"
                style={{
                  backgroundColor: barTwoColour,
                  width: `${adjustedBarTwoWidth}%`,
                }}
              />
              <div className="bar-value">
                {barTwoEnd} {suffix}
              </div>
            </div>
          </div>
        </div>
      </>
    );
  },
  save({ attributes }) {
    const {
      barOneStart,
      barOneEnd,
      barOneText,
      barTwoStart,
      barTwoEnd,
      barTwoText,
      barTwoColour,
      suffix,
      isBold,
      isItalic,
      isUnderlined,
    } = attributes;

    const textStyles = {
      fontWeight: isBold ? "bold" : "normal",
      fontStyle: isItalic ? "italic" : "normal",
      textDecoration: isUnderlined ? "underline" : "none",
    };

    return (
      <div>
        <div className="bar-chart">
          <div className="bar">
            <p className="wp-block-paragraph" style={textStyles}>
              {barOneText}
            </p>
            <div
              className="bar-fill animating-bar"
              data-final-width={adjustedBarOneWidth}
              style={{
                backgroundColor: barOneEnd > barTwoEnd ? "rgb(1, 170, 41)" : "rgb(240, 0, 0)",
                width: `${(barOneEnd - barOneStart) / 100}%`,
              }}
            />
            <div className="bar-value">
              {barOneEnd} {suffix}
            </div>
          </div>

          <div className="bar">
            <p className="wp-block-paragraph" style={textStyles}>
              {barTwoText}
            </p>
            <div
              className="bar-fill animating-bar"
              data-final-width={adjustedBarTwoWidth}
              style={{
                backgroundColor: barTwoColour,
                width: `${(barTwoEnd - barTwoStart) / 100}%`,
              }}
            />
            <div className="bar-value">
              {barTwoEnd} {suffix}
            </div>
          </div>
        </div>
      </div>
    );
  },
});