import { __ } from "@wordpress/i18n";
import { registerBlockType, createBlock } from "@wordpress/blocks";
import {
  useBlockProps,
  InnerBlocks,
  BlockControls,
  InspectorControls,
  store as blockEditorStore,
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
import { useSelect, useDispatch } from "@wordpress/data";
import { useEffect, useMemo, useCallback } from "@wordpress/element";
import {
  fontSizeMap,
  ColorPickerCircle,
  UnitInputControl,
  formatValueWithUnit,
} from "../helper.js";
import "./editor.scss";
import "./style.scss";

const VAR_PREFIX = "--rs-slider-";
const ALLOWED_BLOCKS = ["rs/timeline-slider-child"];

// Memoized style variables builder
const buildStyleVars = (attributes) => {
  const baseVars = {
    [`${VAR_PREFIX}background`]: attributes.background || undefined,
    [`${VAR_PREFIX}tab-background`]: attributes.tabBackground || undefined,
    [`${VAR_PREFIX}tab-background-hover`]: attributes.tabBackgroundHover || undefined,
    [`${VAR_PREFIX}arrow-background`]: attributes.arrowBackground || undefined,
    [`${VAR_PREFIX}arrow-background-hover`]: attributes.arrowBackgroundHover || undefined,
    [`${VAR_PREFIX}arrow-text`]: attributes.arrowText || undefined,
    [`${VAR_PREFIX}arrow-text-hover`]: attributes.arrowTextHover || undefined,
    [`${VAR_PREFIX}tab-font-family`]: 
      attributes.tabFontFamily === "heading" 
        ? "var(--global-heading-font-family)" 
        : "var(--global-body-font-family)",
    [`${VAR_PREFIX}tab-border-radius`]: formatValueWithUnit(
      attributes.tabBorderRadius,
      attributes.tabBorderRadiusUnit
    ),
    [`${VAR_PREFIX}tab-font-size`]: fontSizeMap[attributes.tabFontSize] || undefined,
  };

  const borderVars = attributes.useIndividualBorders
    ? {
        [`${VAR_PREFIX}tab-border-top-color`]: attributes.tabBorderTopColor || undefined,
        [`${VAR_PREFIX}tab-border-right-color`]: attributes.tabBorderRightColor || undefined,
        [`${VAR_PREFIX}tab-border-bottom-color`]: attributes.tabBorderBottomColor || undefined,
        [`${VAR_PREFIX}tab-border-left-color`]: attributes.tabBorderLeftColor || undefined,
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
        [`${VAR_PREFIX}tab-border-color`]: attributes.tabBorderColor || undefined,
        [`${VAR_PREFIX}tab-border-width`]: formatValueWithUnit(
          attributes.tabBorderWidth,
          attributes.tabBorderWidthUnit
        ),
      };

  return { ...baseVars, ...borderVars };
};

// Custom hook for managing editor styles
const useEditorStyles = (blockId, activeSlideIndex, lastSelectedSlide) => {
  const editorStyleId = `rs-timeline-editor-style-${blockId}`;
  
  useEffect(() => {
    if (!blockId) return;

    const visibleIndex = activeSlideIndex ?? lastSelectedSlide;
    const selector = `.wp-block-rs-timeline-slider.${blockId} > .block-editor-inner-blocks > .block-editor-block-list__layout > *`;
    
    const css = visibleIndex !== null 
      ? `
          ${selector} { display: none; }
          ${selector}:nth-child(${visibleIndex + 1}) { display: block; }
        `
      : `${selector} { display: none; }`;

    // Use a style element that's managed by React
    const styleElement = document.getElementById(editorStyleId);
    if (styleElement) {
      styleElement.textContent = css;
    } else {
      const newStyle = document.createElement("style");
      newStyle.id = editorStyleId;
      newStyle.textContent = css;
      document.head.appendChild(newStyle);
    }

    return () => {
      const element = document.getElementById(editorStyleId);
      if (element) {
        element.remove();
      }
    };
  }, [blockId, activeSlideIndex, lastSelectedSlide, editorStyleId]);
};

registerBlockType("rs/timeline-slider", {
  title: "Timeline Slider",
  icon: "schedule",
  category: "layout",
  attributes: {
    activeSlideIndex: { type: "number", default: 1 },
    lastSelectedSlide: { type: "number", default: 1 },
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
    inserter: true,
  },
  
  edit({ attributes, setAttributes, clientId }) {
    const {
      activeSlideIndex,
      lastSelectedSlide,
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
      blockId,
    } = attributes;

    const { insertBlocks } = useDispatch("core/block-editor");
    
    const innerBlocks = useSelect(
      (select) => select("core/block-editor").getBlocks(clientId),
      [clientId]
    );

    const selectedBlockId = useSelect(
      (select) => select(blockEditorStore).getSelectedBlockClientId(),
      []
    );

    // Initialize block ID
    useEffect(() => {
      const newBlockId = `slider-${clientId}`;
      if (!blockId || blockId !== newBlockId) {
        setAttributes({ blockId: newBlockId });
      }
    }, [blockId, clientId, setAttributes]);

    // Initialize with first child block
    useEffect(() => {
      if (innerBlocks.length === 0) {
        const newBlock = createBlock("rs/timeline-slider-child");
        insertBlocks(newBlock, 0, clientId);
      }
    }, [innerBlocks.length, clientId, insertBlocks]);

    // Track selected child block
    useEffect(() => {
      if (!selectedBlockId || !blockId) return;

      const block = wp.data.select("core/block-editor").getBlock(selectedBlockId);
      if (!block || block.name !== "rs/timeline-slider-child") return;

      const parentId = wp.data.select("core/block-editor").getBlockParents(selectedBlockId)[0];
      const isChildOfThisBlock = parentId === clientId;

      if (isChildOfThisBlock) {
        const parentBlock = wp.data.select("core/block-editor").getBlock(clientId);
        const index = parentBlock.innerBlocks.findIndex(
          (inner) => inner.clientId === selectedBlockId
        );
        if (index !== -1 && index !== lastSelectedSlide) {
          setAttributes({ lastSelectedSlide: index });
        }
      }
    }, [selectedBlockId, blockId, clientId, lastSelectedSlide, setAttributes]);

    // Use custom hook for editor styles
    useEditorStyles(blockId, activeSlideIndex, lastSelectedSlide);

    // Memoized style calculations
    const editorStyles = useMemo(() => {
      return {
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
      };
    }, [
      tabBackground, tabBackgroundHover, tabFontSize, tabFontFamily,
      tabBorderWidth, tabBorderWidthUnit, tabBorderColor,
      tabBorderRadius, tabBorderRadiusUnit, arrowBackground,
      arrowBackgroundHover, arrowText, arrowTextHover, background, activeSlideIndex
    ]);

    const clampedIndex = Math.max(0, Math.min(activeSlideIndex ?? 0, innerBlocks.length - 1));

    const blockProps = useBlockProps({
      className: `timeline-slider-editor ${blockId || ""}`,
      style: editorStyles,
      "data-active-slide": activeSlideIndex || 1,
      "data-slider": true,
    });

    // Memoized callback functions
    const goToSlide = useCallback((index) => {
      setAttributes({
        activeSlideIndex: index,
        lastSelectedSlide: index,
      });
    }, [setAttributes]);

    const addNewSlide = useCallback(() => {
      const newBlock = createBlock("rs/timeline-slider-child");
      insertBlocks(newBlock, undefined, clientId);
    }, [insertBlocks, clientId]);

    const goToPreviousSlide = useCallback(() => {
      goToSlide(Math.max(clampedIndex - 1, 0));
    }, [goToSlide, clampedIndex]);

    const goToNextSlide = useCallback(() => {
      goToSlide(Math.min(clampedIndex + 1, innerBlocks.length - 1));
    }, [goToSlide, clampedIndex, innerBlocks.length]);

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
                  onChange={(value) => setAttributes({ tabBackgroundHover: value })}
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
                  onChangeValue={(val) => setAttributes({ tabBorderWidth: val })}
                  onChangeUnit={(unit) => setAttributes({ tabBorderWidthUnit: unit })}
                />
              </>
            )}

            {useIndividualBorders && (
              <>
                <UnitInputControl
                  label={__("Top Border Width")}
                  value={tabBorderTopWidth}
                  unit={tabBorderTopWidthUnit}
                  onChangeValue={(val) => setAttributes({ tabBorderTopWidth: val })}
                  onChangeUnit={(unit) => setAttributes({ tabBorderTopWidthUnit: unit })}
                />
                <ColorPickerCircle
                  label={__("Top Border Colour")}
                  value={tabBorderTopColor}
                  onChange={(value) => setAttributes({ tabBorderTopColor: value })}
                />
                <UnitInputControl
                  label={__("Right Border Width")}
                  value={tabBorderRightWidth}
                  unit={tabBorderRightWidthUnit}
                  onChangeValue={(val) => setAttributes({ tabBorderRightWidth: val })}
                  onChangeUnit={(unit) => setAttributes({ tabBorderRightWidthUnit: unit })}
                />
                <ColorPickerCircle
                  label={__("Right Border Colour")}
                  value={tabBorderRightColor}
                  onChange={(value) => setAttributes({ tabBorderRightColor: value })}
                />
                <UnitInputControl
                  label={__("Bottom Border Width")}
                  value={tabBorderBottomWidth}
                  unit={tabBorderBottomWidthUnit}
                  onChangeValue={(val) => setAttributes({ tabBorderBottomWidth: val })}
                  onChangeUnit={(unit) => setAttributes({ tabBorderBottomWidthUnit: unit })}
                />
                <ColorPickerCircle
                  label={__("Bottom Border Colour")}
                  value={tabBorderBottomColor}
                  onChange={(value) => setAttributes({ tabBorderBottomColor: value })}
                />
                <UnitInputControl
                  label={__("Left Border Width")}
                  value={tabBorderLeftWidth}
                  unit={tabBorderLeftWidthUnit}
                  onChangeValue={(val) => setAttributes({ tabBorderLeftWidth: val })}
                  onChangeUnit={(unit) => setAttributes({ tabBorderLeftWidthUnit: unit })}
                />
                <ColorPickerCircle
                  label={__("Left Border Colour")}
                  value={tabBorderLeftColor}
                  onChange={(value) => setAttributes({ tabBorderLeftColor: value })}
                />
              </>
            )}

            <UnitInputControl
              label={__("Border Radius")}
              value={tabBorderRadius}
              unit={tabBorderRadiusUnit}
              onChangeValue={(val) => setAttributes({ tabBorderRadius: val })}
              onChangeUnit={(unit) => setAttributes({ tabBorderRadiusUnit: unit })}
            />

            <div>
              <label>{__("Arrow Background")}</label>
              <div style={{ display: "flex", gap: "20px" }}>
                <ColorPickerCircle
                  label={__("Normal")}
                  value={arrowBackground}
                  onChange={(value) => setAttributes({ arrowBackground: value })}
                />
                <ColorPickerCircle
                  label={__("Hover")}
                  value={arrowBackgroundHover}
                  onChange={(value) => setAttributes({ arrowBackgroundHover: value })}
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
              onClick={addNewSlide}
              aria-label="Add a timeline slide"
            />
            <DropdownMenu
              icon={chevronDown}
              label={__("Timeline Slider Options")}
              popoverProps={{ placement: "bottom-start", offset: [0, 4] }}
            >
              {() => (
                <div style={{ padding: "10px", display: "flex", minWidth: "205px" }}>
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
              onClick={goToPreviousSlide}
              disabled={clampedIndex === 0}
            />
            <ToolbarButton
              icon="arrow-right-alt"
              label="Next Slide"
              onClick={goToNextSlide}
              disabled={clampedIndex === innerBlocks.length - 1}
            />
          </ToolbarGroup>
        </BlockControls>

        <div {...blockProps}>
          <div className={`timeline-slider-wrapper ${innerContentWidth ? "kb-theme-content-width" : ""}`}>
            <InnerBlocks
              templateLock={false}
              template={[["rs/timeline-slider-child", {}]]}
              allowedBlocks={ALLOWED_BLOCKS}
              templateInsertUpdatesSelection={false}
              renderAppender={false}
            />
            {!innerBlocks.length && (
              <div style={{ textAlign: "center", color: "#999" }}>
                {__("Add timeline slides using the toolbar button above")}
              </div>
            )}
          </div>
        </div>
      </>
    );
  },

  save({ attributes }) {
    const blockProps = useBlockProps.save();
    const styleVars = buildStyleVars(attributes);
    
    const cssVars = Object.entries(styleVars)
      .filter(([_, val]) => val !== undefined && val !== "")
      .map(([key, val]) => `${key}: ${val};`)
      .join(" ");

    return (
      <>
        <style>
          {`.timeline-slider[data-slider="true"] { ${cssVars} }`}
        </style>
        <div
          {...blockProps}
          data-slider={true}
          data-active-slide={attributes.activeSlideIndex ?? attributes.lastSelectedSlide ?? 1}
        >
          <div className={`timeline-slider-wrapper ${attributes.innerContentWidth ? "kb-theme-content-width" : ""}`}>
            <InnerBlocks.Content />
          </div>
        </div>
      </>
    );
  },
});