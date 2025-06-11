import { __ } from "@wordpress/i18n";
import { registerBlockType, createBlock } from "@wordpress/blocks";
import {
  useBlockProps,
  InnerBlocks,
  BlockControls,
  InspectorControls,
  insertBlocks,
} from "@wordpress/block-editor";
import {
  PanelBody,
  ToggleControl,
  ToolbarGroup,
  ToolbarButton,
  DropdownMenu,
  SelectControl,
} from "@wordpress/components";
import { plus, chevronDown } from "@wordpress/icons";
import { useSelect, dispatch } from "@wordpress/data";
import { useEffect, useRef } from "@wordpress/element";
import {
  fontSizeMap,
  ColorPickerCircle,
  UnitInputControl,
  formatValueWithUnit,
} from "../../helper.js";
import "./editor.scss";
import "./style.scss";

const VAR_PREFIX = "--rs-slider-";
const ALLOWED_BLOCKS = ["rs/timeline-slider-child"];

const buildStyleVars = (attributes) => ({
  [`${VAR_PREFIX}background`]: attributes.background || undefined,
  [`${VAR_PREFIX}tab-background`]: attributes.tabBackground || undefined,
  [`${VAR_PREFIX}tab-background-hover`]:
    attributes.tabBackgroundHover || undefined,
  [`${VAR_PREFIX}arrow-background`]: attributes.arrowBackground || undefined,
  [`${VAR_PREFIX}arrow-background-hover`]:
    attributes.arrowBackgroundHover || undefined,
  [`${VAR_PREFIX}arrow-text`]: attributes.arrowText || undefined,
  [`${VAR_PREFIX}arrow-text-hover`]: attributes.arrowTextHover || undefined,
  [`${VAR_PREFIX}tab-font-family`]:
    attributes.tabFontFamily === "heading"
      ? "var(--global-heading-font-family)"
      : "var(--global-body-font-family)",
  ...(attributes.useIndividualBorders
    ? {
        [`${VAR_PREFIX}tab-border-top-color`]:
          attributes.tabBorderTopColor || undefined,
        [`${VAR_PREFIX}tab-border-right-color`]:
          attributes.tabBorderRightColor || undefined,
        [`${VAR_PREFIX}tab-border-bottom-color`]:
          attributes.tabBorderBottomColor || undefined,
        [`${VAR_PREFIX}tab-border-left-color`]:
          attributes.tabBorderLeftColor || undefined,
        [`${VAR_PREFIX}tab-border-top-width`]: formatValueWithUnit(
          attributes.tabBorderTopWidth,
          attributes.tabBorderTopWidthUnit
        ),
        [`${VAR_PREFIX}tab-border-right-width`]: formatValueWithUnit(
          attributes.tabBorderRightWidth,
          attributes.tabBorderRightWidthUnit
        ),
        [`${VAR_PREFIX}tab-border-bottom-width`]: formatValueWithUnit(
          attributes.tabBorderBottomWidth,
          attributes.tabBorderBottomWidthUnit
        ),
        [`${VAR_PREFIX}tab-border-left-width`]: formatValueWithUnit(
          attributes.tabBorderLeftWidth,
          attributes.tabBorderLeftWidthUnit
        ),
      }
    : {
        [`${VAR_PREFIX}tab-border-color`]:
          attributes.tabBorderColor || undefined,
        [`${VAR_PREFIX}tab-border-width`]: formatValueWithUnit(
          attributes.tabBorderWidth,
          attributes.tabBorderWidthUnit
        ),
      }),
  [`${VAR_PREFIX}tab-border-radius`]: formatValueWithUnit(
    attributes.tabBorderRadius,
    attributes.tabBorderRadiusUnit
  ),
  [`${VAR_PREFIX}tab-font-size`]:
    fontSizeMap[attributes.tabFontSize] || undefined,
});

registerBlockType("rs/timeline-slider", {
  title: "Timeline Slider",
  icon: "schedule",
  category: "widgets",
  attributes: {
    activeSlideIndex: { type: "number", default: 1 },
    align: { type: "string" },
    innerContentWidth: { type: "boolean", default: false },
    background: { type: "string", default: "" },
    tabBackground: { type: "string", default: "" },
    tabBackgroundHover: { type: "string", default: "" },
    tabFontFamily: { type: "string", default: "heading" },
    tabFontSize: { type: "string", default: "md" },
    useIndividualBorders: { type: "boolean", default: false },
    tabBorderTopWidth: { type: "string", default: "" },
    tabBorderRightWidth: { type: "string", default: "" },
    tabBorderBottomWidth: { type: "string", default: "" },
    tabBorderLeftWidth: { type: "string", default: "" },
    tabBorderTopWidthUnit: { type: "string", default: "px" },
    tabBorderRightWidthUnit: { type: "string", default: "px" },
    tabBorderBottomWidthUnit: { type: "string", default: "px" },
    tabBorderLeftWidthUnit: { type: "string", default: "px" },
    tabBorderTopColor: { type: "string", default: "" },
    tabBorderRightColor: { type: "string", default: "" },
    tabBorderBottomColor: { type: "string", default: "" },
    tabBorderLeftColor: { type: "string", default: "" },
    tabBorderColor: { type: "string", default: "" },
    tabBorderWidth: { type: "string", default: "" },
    tabBorderWidthUnit: { type: "string", default: "px" },
    tabBorderRadius: { type: "string", default: "" },
    tabBorderRadiusUnit: { type: "string", default: "px" },
    arrowBackground: { type: "string", default: "" },
    arrowBackgroundHover: { type: "string", default: "" },
    arrowText: { type: "string", default: "" },
    arrowTextHover: { type: "string", default: "" },
    blockId: { type: "string" },
  },
  supports: {
    align: ["wide", "full", "center"],
    anchor: true,
    spacing: { margin: true, padding: true },
    __experimentalLayout: true,
    __experimentalVerticalAlignment: true,
  },

  edit({ attributes, setAttributes, clientId }) {
    const {
      activeSlideIndex,
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
      tabBackground,
      tabBackgroundHover,
      tabFontSize,
      tabFontFamily,
      arrowBackground,
      arrowBackgroundHover,
      arrowText,
      arrowTextHover,
      background,
    } = attributes;

    // Select inner blocks for slides
    const innerBlocks = useSelect(
      (select) => select("core/block-editor").getBlocks(clientId),
      [clientId]
    );

    const hasInsertedInitialBlock = useRef(false);

    // Ensure activeSlideIndex within bounds
    const clampedIndex = Math.min(activeSlideIndex, innerBlocks.length - 1);

    const blockProps = useBlockProps({
      className: `timeline-slider-editor ${attributes.blockId || ""}`,
      style: {
        [`${VAR_PREFIX}tab-background`]: tabBackground || "#eee",
        [`${VAR_PREFIX}tab-background-hover`]: tabBackgroundHover || "#ddd",
        [`${VAR_PREFIX}tab-font-size`]: fontSizeMap[tabFontSize] || "1rem",
        [`${VAR_PREFIX}tab-font-family`]:
          tabFontFamily === "heading"
            ? "var(--global-heading-font-family)"
            : "var(--global-body-font-family)",
        [`${VAR_PREFIX}tab-border-width`]:
          formatValueWithUnit(tabBorderWidth, tabBorderWidthUnit) || "0px",
        [`${VAR_PREFIX}tab-border-color`]: tabBorderColor || "transparent",
        [`${VAR_PREFIX}tab-border-radius`]:
          formatValueWithUnit(tabBorderRadius, tabBorderRadiusUnit) || "0px",
        [`${VAR_PREFIX}arrow-background`]: arrowBackground || "#eee",
        [`${VAR_PREFIX}arrow-background-hover`]: arrowBackgroundHover || "#ddd",
        [`${VAR_PREFIX}arrow-text`]: arrowText || "#333",
        [`${VAR_PREFIX}arrow-text-hover`]: arrowTextHover || "#000",
        [`${VAR_PREFIX}background`]: background || "transparent",
        [`${VAR_PREFIX}active-slide`]: activeSlideIndex || 1,
      },
      "data-active-slide": activeSlideIndex || 1,
    });

    // Set blockId once on mount
    useEffect(() => {
      if (!attributes.blockId) {
        setAttributes({ blockId: `slider-${clientId}` });
      }
    }, [attributes.blockId, clientId, setAttributes]);

    // Dynamic CSS variables style tag management
    useEffect(() => {
      if (!attributes.blockId) return;

      const styleId = `rs-timeline-slider-vars-${attributes.blockId}`;
      let styleTag = document.getElementById(styleId);

      const getAllStyleVars = (attrs) => {
        const baseVars = buildStyleVars(attrs);
        const borderVars = attrs.useIndividualBorders
          ? {
              [`${VAR_PREFIX}tab-border-top-width`]: formatValueWithUnit(
                attrs.tabBorderTopWidth,
                attrs.tabBorderTopWidthUnit
              ),
              [`${VAR_PREFIX}tab-border-right-width`]: formatValueWithUnit(
                attrs.tabBorderRightWidth,
                attrs.tabBorderRightWidthUnit
              ),
              [`${VAR_PREFIX}tab-border-bottom-width`]: formatValueWithUnit(
                attrs.tabBorderBottomWidth,
                attrs.tabBorderBottomWidthUnit
              ),
              [`${VAR_PREFIX}tab-border-left-width`]: formatValueWithUnit(
                attrs.tabBorderLeftWidth,
                attrs.tabBorderLeftWidthUnit
              ),
            }
          : {
              [`${VAR_PREFIX}tab-border-width`]: formatValueWithUnit(
                attrs.tabBorderWidth,
                attrs.tabBorderWidthUnit
              ),
            };

        return {
          ...baseVars,
          ...borderVars,
          [`${VAR_PREFIX}tab-border-radius`]: formatValueWithUnit(
            attrs.tabBorderRadius,
            attrs.tabBorderRadiusUnit
          ),
        };
      };

      const cssVars = Object.entries(getAllStyleVars(attributes))
        .filter(([, val]) => val !== undefined && val !== "")
        .map(([key, val]) => `${key}: ${val};`)
        .join("\n");

      const safeBlockId = attributes.blockId.replace(/[^a-zA-Z0-9_-]/g, "");
      const css = `.${safeBlockId} {\n${cssVars}\n}`;

      if (!styleTag) {
        styleTag = document.createElement("style");
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
      tabBorderTopWidth,
      tabBorderTopWidthUnit,
      tabBorderRightWidth,
      tabBorderRightWidthUnit,
      tabBorderBottomWidth,
      tabBorderBottomWidthUnit,
      tabBorderLeftWidth,
      tabBorderLeftWidthUnit,
      tabBorderWidth,
      tabBorderWidthUnit,
      tabBorderRadius,
      tabBorderRadiusUnit,
    ]);

    // Auto add first child slide if none exist
    useEffect(() => {
      if (
        clientId &&
        innerBlocks.length === 0 &&
        !hasInsertedInitialBlock.current
      ) {
        setTimeout(() => {
          const firstChild = createBlock("rs/timeline-slider-child");
          dispatch("core/block-editor").insertBlocks(firstChild, 0, clientId);
          hasInsertedInitialBlock.current = true;
        }, 0);
      }
    }, [clientId, innerBlocks.length]);

    const goToSlide = (index) => {
      setAttributes({ activeSlideIndex: index });
    };

    return (
      <>
        <InspectorControls>
          <PanelBody
            title={__("Styles")}
            initialOpen={true}
            style={{ display: "grid", gap: "1em" }}
          >
            <ColorPickerCircle
              label={__("Block Background")}
              value={background}
              onChange={(value) => setAttributes({ background: value })}
            />
            <div>
              <label>{__("Tab Background")}</label>
              <div style={{ display: "flex", gap: "20px" }}>
                <ColorPickerCircle
                  label={__("Normal")}
                  value={tabBackground}
                  onChange={(value) => setAttributes({ tabBackground: value })}
                />
                <ColorPickerCircle
                  label={__("Hover")}
                  value={tabBackgroundHover}
                  onChange={(value) =>
                    setAttributes({ tabBackgroundHover: value })
                  }
                />
              </div>
            </div>

            <ToggleControl
              label={__("Use Individual Borders")}
              checked={useIndividualBorders}
              onChange={(val) => setAttributes({ useIndividualBorders: val })}
            />

            {!useIndividualBorders && (
              <>
                <ColorPickerCircle
                  label={__("Tab Border Colour")}
                  value={tabBorderColor}
                  onChange={(value) => setAttributes({ tabBorderColor: value })}
                />
                <UnitInputControl
                  label={__("Border Width")}
                  value={tabBorderWidth}
                  unit={tabBorderWidthUnit}
                  onChangeValue={(val) =>
                    setAttributes({ tabBorderWidth: val })
                  }
                  onChangeUnit={(unit) =>
                    setAttributes({ tabBorderWidthUnit: unit })
                  }
                />
              </>
            )}

            {useIndividualBorders && (
              <>
                <UnitInputControl
                  label={__("Top Border Width")}
                  value={tabBorderTopWidth}
                  unit={tabBorderTopWidthUnit}
                  onChangeValue={(val) =>
                    setAttributes({ tabBorderTopWidth: val })
                  }
                  onChangeUnit={(unit) =>
                    setAttributes({ tabBorderTopWidthUnit: unit })
                  }
                />
                <ColorPickerCircle
                  label={__("Top Border Colour")}
                  value={tabBorderTopColor}
                  onChange={(value) =>
                    setAttributes({ tabBorderTopColor: value })
                  }
                />

                <UnitInputControl
                  label={__("Right Border Width")}
                  value={tabBorderRightWidth}
                  unit={tabBorderRightWidthUnit}
                  onChangeValue={(val) =>
                    setAttributes({ tabBorderRightWidth: val })
                  }
                  onChangeUnit={(unit) =>
                    setAttributes({ tabBorderRightWidthUnit: unit })
                  }
                />
                <ColorPickerCircle
                  label={__("Right Border Colour")}
                  value={tabBorderRightColor}
                  onChange={(value) =>
                    setAttributes({ tabBorderRightColor: value })
                  }
                />

                <UnitInputControl
                  label={__("Bottom Border Width")}
                  value={tabBorderBottomWidth}
                  unit={tabBorderBottomWidthUnit}
                  onChangeValue={(val) =>
                    setAttributes({ tabBorderBottomWidth: val })
                  }
                  onChangeUnit={(unit) =>
                    setAttributes({ tabBorderBottomWidthUnit: unit })
                  }
                />
                <ColorPickerCircle
                  label={__("Bottom Border Colour")}
                  value={tabBorderBottomColor}
                  onChange={(value) =>
                    setAttributes({ tabBorderBottomColor: value })
                  }
                />

                <UnitInputControl
                  label={__("Left Border Width")}
                  value={tabBorderLeftWidth}
                  unit={tabBorderLeftWidthUnit}
                  onChangeValue={(val) =>
                    setAttributes({ tabBorderLeftWidth: val })
                  }
                  onChangeUnit={(unit) =>
                    setAttributes({ tabBorderLeftWidthUnit: unit })
                  }
                />
                <ColorPickerCircle
                  label={__("Left Border Colour")}
                  value={tabBorderLeftColor}
                  onChange={(value) =>
                    setAttributes({ tabBorderLeftColor: value })
                  }
                />
              </>
            )}

            <UnitInputControl
              label={__("Border Radius")}
              value={tabBorderRadius}
              unit={tabBorderRadiusUnit}
              onChangeValue={(val) => setAttributes({ tabBorderRadius: val })}
              onChangeUnit={(unit) =>
                setAttributes({ tabBorderRadiusUnit: unit })
              }
            />

            <div>
              <label>{__("Arrow Background")}</label>
              <div style={{ display: "flex", gap: "20px" }}>
                <ColorPickerCircle
                  label={__("Normal")}
                  value={arrowBackground}
                  onChange={(value) =>
                    setAttributes({ arrowBackground: value })
                  }
                />
                <ColorPickerCircle
                  label={__("Hover")}
                  value={arrowBackgroundHover}
                  onChange={(value) =>
                    setAttributes({ arrowBackgroundHover: value })
                  }
                />
              </div>
            </div>

            <div>
              <label>{__("Arrow Text")}</label>
              <div style={{ display: "flex", gap: "20px" }}>
                <ColorPickerCircle
                  label={__("Normal")}
                  value={arrowText}
                  onChange={(value) => setAttributes({ arrowText: value })}
                />
                <ColorPickerCircle
                  label={__("Hover")}
                  value={arrowTextHover}
                  onChange={(value) => setAttributes({ arrowTextHover: value })}
                />
              </div>
            </div>
          </PanelBody>

          <PanelBody title={__("Typography")} initialOpen={false}>
            <SelectControl
              label={__("Tab Font Family")}
              value={tabFontFamily}
              options={[
                { label: "Body Font Family", value: "body" },
                { label: "Heading Font Family", value: "heading" },
              ]}
              onChange={(value) => setAttributes({ tabFontFamily: value })}
            />
            <SelectControl
              label={__("Tab Font Size")}
              value={tabFontSize}
              options={[
                { label: "Small", value: "sm" },
                { label: "Medium", value: "md" },
                { label: "Large", value: "lg" },
                { label: "XL", value: "xl" },
                { label: "2XL", value: "2xl" },
                { label: "3XL", value: "3xl" },
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
                const newBlock = createBlock("rs/timeline-slider-child");
                dispatch("core/block-editor").insertBlocks(
                  newBlock,
                  undefined,
                  clientId
                );
              }}
              aria-label="Add a timeline slide"
            />
            <DropdownMenu
              icon={chevronDown}
              label={__("Timeline Slider Options")}
              popoverProps={{ placement: "bottom-start", offset: [0, 4] }}
            >
              {() => (
                <div
                  style={{
                    padding: "10px",
                    display: "flex",
                    minWidth: "205px",
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
              onClick={() =>
                goToSlide(Math.min(clampedIndex + 1, innerBlocks.length - 1))
              }
              disabled={clampedIndex === innerBlocks.length - 1}
            />
          </ToolbarGroup>
        </BlockControls>

        <div {...blockProps} className="timeline-slider-editor">
          {innerBlocks.map((childBlock, index) => (
            <div
              key={childBlock.clientId}
              className={`rs-timeline-slider-child slide-${index}`}
              style={{ display: index === activeSlideIndex ? "block" : "none" }}
            >
              <InnerBlocks
                templateLock={false}
                template={[["rs/timeline-slider-child", {}]]}
                renderAppender={() => null}
                allowedBlocks={ALLOWED_BLOCKS}
                __experimentalKeepTemplateProps
                templateInsertUpdatesSelection={false}
                rootClientId={childBlock.clientId}
              />
            </div>
          ))}
          {!innerBlocks.length && (
            <div style={{ textAlign: "center", color: "#999" }}>
              {__("Add timeline slides using the toolbar button above")}
            </div>
          )}
        </div>
      </>
    );
  },
  save() {
    return (
      <div {...useBlockProps.save()}>
        <InnerBlocks.Content />
      </div>
    );
  },
});