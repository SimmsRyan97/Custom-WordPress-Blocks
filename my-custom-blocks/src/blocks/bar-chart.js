import { registerBlockType } from "@wordpress/blocks";
import { useBlockProps, InspectorControls, ColorPalette } from "@wordpress/block-editor";
import {
  PanelBody,
  TextControl,
  ColorPicker,
  Button,
  TabPanel,
} from "@wordpress/components";

registerBlockType("my-custom/block", {
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

    // Toggle styling
    const toggleBold = () => setAttributes({ isBold: !isBold });
    const toggleItalic = () => setAttributes({ isItalic: !isItalic });
    const toggleUnderline = () =>
      setAttributes({ isUnderlined: !isUnderlined });

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

    const handleBarOneStartChange = (val) => {
      // Only allow numeric values, including decimals
      const regex = /^[0-9]*\.?[0-9]*$/;
      if (regex.test(val)) {
        setAttributes({ barOneStart: val });
      }
    };

    const handleBarOneEndChange = (val) => {
      // Only allow numeric values, including decimals
      const regex = /^[0-9]*\.?[0-9]*$/;
      if (regex.test(val)) {
        setAttributes({ barOneEnd: val });
      }
    };

    const handleBarTwoStartChange = (val) => {
      // Only allow numeric values, including decimals
      const regex = /^[0-9]*\.?[0-9]*$/;
      if (regex.test(val)) {
        setAttributes({ barTwoStart: val });
      }
    };

    const handleBarTwoEndChange = (val) => {
      // Only allow numeric values, including decimals
      const regex = /^[0-9]*\.?[0-9]*$/;
      if (regex.test(val)) {
        setAttributes({ barTwoEnd: val });
      }
    };

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
                        onChange={handleBarOneStartChange}
                      />
                      <TextControl
                        label="Bar One End Value"
                        value={barOneEnd}
                        onChange={handleBarOneEndChange}
                      />
                      <TextControl
                        label="Bar One Text"
                        value={barOneText}
                        onChange={(val) => setAttributes({ barOneText: val })}
                      />
                      <TextControl
                        label="Bar Two Start Value"
                        value={barTwoStart}
                        onChange={handleBarTwoStartChange}
                      />
                      <TextControl
                        label="Bar Two End Value"
                        value={barTwoEnd}
                        onChange={handleBarTwoEndChange}
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
                            onClick={toggleBold}
                            className={attributes.isBold ? "active" : ""}
                          >
                            B
                          </Button>
                          <Button
                            onClick={toggleItalic}
                            className={attributes.isItalic ? "active" : ""}
                          >
                            I
                          </Button>
                          <Button
                            onClick={toggleUnderline}
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
            <div className="bar" style={{ marginBottom: "20px" }}>
              <p className="wp-block-paragraph" style={textStyles}>
                {barOneText}
              </p>
              <div
                className="bar-fill"
                style={{
                  backgroundColor: dynamicBarOneColor,
                  width: `${adjustedBarOneWidth}%`,
                  transition: 'width 2s ease-in-out',
                }}
              ></div>
            </div>
            <div className="bar">
              <p className="wp-block-paragraph" style={textStyles}>
                {barTwoText}
              </p>
              <div
                className="bar-fill"
                style={{
                  backgroundColor: barTwoColour,
                  width: `${adjustedBarTwoWidth}%`,
                  transition: 'width 2s ease-in-out',
                }}
              ></div>
            </div>
            <div className="value-indicators">
              <span>
                {Math.min(parseFloat(barTwoStart), parseFloat(barOneStart))}
              </span>{" "}
              <span>
                {Math.max(parseFloat(barTwoEnd), parseFloat(barOneEnd))}
                {suffix}
              </span>
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
      htmlAnchor,
      extraClassNames,
    } = attributes;

    const blockProps = useBlockProps.save({
      id: htmlAnchor || undefined, // Use the anchor if defined
      className: extraClassNames || undefined, // Add extra class names if defined
    });

    // Apply styles conditionally
    const textStyles = {
      fontWeight: isBold ? "bold" : "normal",
      fontStyle: isItalic ? "italic" : "normal",
      textDecoration: isUnderlined ? "underline" : "none",
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

    return (
      <div {...blockProps}>
        <div className="bar-chart">
          <div className="bar">
            <p className="wp-block-paragraph" style={textStyles}>
              {barOneText}
            </p>
            <div
              className="bar-fill animating-bar"
              data-final-width={adjustedBarOneWidth}
              style={{
                backgroundColor: dynamicBarOneColor,
                width: `0%`,
              }}
            ></div>
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
                width: `0%`,
              }}
            ></div>
          </div>
          <div className="value-indicators">
            <span>
              {Math.min(parseFloat(barTwoStart), parseFloat(barOneStart))}
            </span>{" "}
            <span>
              {Math.max(parseFloat(barTwoEnd), parseFloat(barOneEnd))}
              {suffix}
            </span>
          </div>
        </div>
      </div>
    );
  },
});