import { __ } from "@wordpress/i18n";
import { registerBlockType, createBlock } from "@wordpress/blocks";
import { useBlockProps, InnerBlocks, BlockControls, InspectorControls, store as blockEditorStore, RichText } from "@wordpress/block-editor";
import { PanelBody, ToggleControl, ToolbarGroup, ToolbarButton, DropdownMenu, SelectControl, TextControl } from "@wordpress/components";
import { plus, chevronDown } from "@wordpress/icons";
import { useSelect, useDispatch } from "@wordpress/data";
import { useEffect, useMemo, useCallback } from "@wordpress/element";
import { fontSizeMap, ColorPickerCircle, UnitInputControl, formatValueWithUnit, CustomTabPanel } from "../helper.js";
import "./editor.scss";
import "./style.scss";

const VAR_PREFIX = "--rs-timeline-slider-";
const ALLOWED_BLOCKS = ["rs/timeline-slider-child"];

// Memorised style variables builder
const buildStyleVars = (attributes) => {
	const baseVars = {
		[`${VAR_PREFIX}background`]: attributes.background || undefined,
		[`${VAR_PREFIX}title-color`]: attributes.titleColor || undefined,
		[`${VAR_PREFIX}tab-background`]: attributes.tabBackground || undefined,
		[`${VAR_PREFIX}tab-background-hover`]: attributes.tabBackgroundHover || undefined,
		[`${VAR_PREFIX}tab-color`]: attributes.tabColor || undefined,
		[`${VAR_PREFIX}tab-color-hover`]: attributes.tabColorHover || undefined,
		[`${VAR_PREFIX}arrow-background`]: attributes.arrowBackground || undefined,
		[`${VAR_PREFIX}arrow-background-hover`]: attributes.arrowBackgroundHover || undefined,
		[`${VAR_PREFIX}arrow-text`]: attributes.arrowText || undefined,
		[`${VAR_PREFIX}arrow-text-hover`]: attributes.arrowTextHover || undefined,
		[`${VAR_PREFIX}tab-font-family`]: attributes.tabFontFamily === "heading" ? "var(--global-heading-font-family)" : "var(--global-body-font-family)",
		[`${VAR_PREFIX}tab-border-radius`]: formatValueWithUnit(attributes.tabBorderRadius, attributes.tabBorderRadiusUnit),
		[`${VAR_PREFIX}tab-font-size`]: fontSizeMap[attributes.tabFontSize] || undefined,
	};

	const borderVars = attributes.useIndividualBorders
		? {
				[`${VAR_PREFIX}tab-border-top-color`]: attributes.tabBorderTopColor || undefined,
				[`${VAR_PREFIX}tab-border-right-color`]: attributes.tabBorderRightColor || undefined,
				[`${VAR_PREFIX}tab-border-bottom-color`]: attributes.tabBorderBottomColor || undefined,
				[`${VAR_PREFIX}tab-border-left-color`]: attributes.tabBorderLeftColor || undefined,
				[`${VAR_PREFIX}tab-border-top-width`]: formatValueWithUnit(attributes.tabBorderTopWidth, attributes.tabBorderTopWidthUnit),
				[`${VAR_PREFIX}tab-border-right-width`]: formatValueWithUnit(attributes.tabBorderRightWidth, attributes.tabBorderRightWidthUnit),
				[`${VAR_PREFIX}tab-border-bottom-width`]: formatValueWithUnit(attributes.tabBorderBottomWidth, attributes.tabBorderBottomWidthUnit),
				[`${VAR_PREFIX}tab-border-left-width`]: formatValueWithUnit(attributes.tabBorderLeftWidth, attributes.tabBorderLeftWidthUnit),
			}
		: {
				[`${VAR_PREFIX}tab-border-color`]: attributes.tabBorderColor || undefined,
				[`${VAR_PREFIX}tab-border-width`]: formatValueWithUnit(attributes.tabBorderWidth, attributes.tabBorderWidthUnit),
			};

  const paddingVars = attributes.useCustomPadding
    ? attributes.isLinkedPadding
      ? {
          [`${VAR_PREFIX}padding`]: formatValueWithUnit(attributes.paddingAll, attributes.paddingUnit),
        }
      : {
          [`${VAR_PREFIX}padding-top`]: formatValueWithUnit(attributes.paddingTop, attributes.paddingTopUnit),
          [`${VAR_PREFIX}padding-right`]: formatValueWithUnit(attributes.paddingRight, attributes.paddingRightUnit),
          [`${VAR_PREFIX}padding-bottom`]: formatValueWithUnit(attributes.paddingBottom, attributes.paddingBottomUnit),
          [`${VAR_PREFIX}padding-left`]: formatValueWithUnit(attributes.paddingLeft, attributes.paddingLeftUnit),
        }
    : attributes.isLinkedPadding
      ? {
          [`${VAR_PREFIX}padding`]: attributes.paddingAll || undefined,
        }
      : {
          [`${VAR_PREFIX}padding-top`]: attributes.paddingTop || undefined,
          [`${VAR_PREFIX}padding-right`]: attributes.paddingRight || undefined,
          [`${VAR_PREFIX}padding-bottom`]: attributes.paddingBottom || undefined,
          [`${VAR_PREFIX}padding-left`]: attributes.paddingLeft || undefined,
        };

  const marginVars = attributes.useCustomMargin
    ? attributes.isLinkedMargin
      ? {
          [`${VAR_PREFIX}margin`]: formatValueWithUnit(attributes.marginAll, attributes.marginUnit),
        }
      : {
          [`${VAR_PREFIX}margin-top`]: formatValueWithUnit(attributes.marginTop, attributes.marginTopUnit),
          [`${VAR_PREFIX}margin-right`]: formatValueWithUnit(attributes.marginRight, attributes.marginRightUnit),
          [`${VAR_PREFIX}margin-bottom`]: formatValueWithUnit(attributes.marginBottom, attributes.marginBottomUnit),
          [`${VAR_PREFIX}margin-left`]: formatValueWithUnit(attributes.marginLeft, attributes.marginLeftUnit),
        }
    : attributes.isLinkedMargin
      ? {
          [`${VAR_PREFIX}margin`]: attributes.marginAll || undefined,
        }
      : {
          [`${VAR_PREFIX}margin-top`]: attributes.marginTop || undefined,
          [`${VAR_PREFIX}margin-right`]: attributes.marginRight || undefined,
          [`${VAR_PREFIX}margin-bottom`]: attributes.marginBottom || undefined,
          [`${VAR_PREFIX}margin-left`]: attributes.marginLeft || undefined,
        };

	return { ...baseVars, ...borderVars, ...paddingVars, ...marginVars };
};

// Custom hook for managing editor styles
const useEditorStyles = (blockId) => {
	const editorStyleId = `rs-timeline-editor-style-${blockId}`;

	useEffect(() => {
		if (!blockId) return;

		const visibleIndex = blockId ?? 1;
		const selector = `.wp-block-rs-timeline-slider.${blockId} > .block-editor-inner-blocks > .block-editor-block-list__layout > *`;

		const css =
			visibleIndex !== null
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
	}, [blockId, editorStyleId]);
};

registerBlockType("rs/timeline-slider", {
	title: "Timeline Slider",
	icon: "slides",
	category: "layout",
	attributes: {
		blockTitle: { type: "string", default: "" },
    titleAlign: { type: "string", default: "center" },
		innerContentWidth: { type: "boolean", default: false },
		background: { type: "string", default: "" },
		titleColor: { type: "string", default: "" },
		tabBackground: { type: "string", default: "" },
		tabBackgroundHover: { type: "string", default: "" },
		tabColor: { type: "string", default: "" },
		tabColorHover: { type: "string", default: "" },
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
		align: { type: "string" },
		htmlAnchor: { type: "string", default: "" },
		extraClassNames: { type: "string", default: "" },
		isLinkedPadding: { type: "boolean", default: true },
		isLinkedMargin: { type: "boolean", default: true },
		useCustomPadding: { type: "boolean", default: false },
		useCustomMargin: { type: "boolean", default: false },
		paddingAll: { type: "string" },
		paddingTop: { type: "string" },
		paddingRight: { type: "string" },
		paddingBottom: { type: "string" },
		paddingLeft: { type: "string" },
		paddingTopUnit: { type: "string", default: "px" },
		paddingRightUnit: { type: "string", default: "px" },
		paddingBottomUnit: { type: "string", default: "px" },
		paddingLeftUnit: { type: "string", default: "px" },
		paddingUnit: { type: "string", default: "px" },
		marginAll: { type: "string" },
		marginTop: { type: "string" },
		marginRight: { type: "string" },
		marginBottom: { type: "string" },
		marginLeft: { type: "string" },
		marginTopUnit: { type: "string", default: "px" },
		marginRightUnit: { type: "string", default: "px" },
		marginBottomUnit: { type: "string", default: "px" },
		marginLeftUnit: { type: "string", default: "px" },
		marginUnit: { type: "string", default: "px" },
	},
	supports: {
		align: ["wide", "full", "center"],
		typography: false,
		color: false,
		spacing: false,
		border: false,
		dimensions: false,
		style: false,
		anchor: false,
		customClassName: false,
		__experimentalLayout: true,
		__experimentalVerticalAlignment: true,
		inserter: true,
	},

	edit({ attributes, setAttributes, clientId }) {
		const {
			blockTitle,
      titleAlign,
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
			tabColor,
			tabColorHover,
			arrowBackground,
			arrowBackgroundHover,
			arrowText,
			arrowTextHover,
			background,
			titleColor,
			blockId,
			htmlAnchor,
			extraClassNames,
		} = attributes;

		const { insertBlocks } = useDispatch("core/block-editor");

		const innerBlocks = useSelect((select) => select("core/block-editor").getBlocks(clientId), [clientId]);

		const selectedBlockId = useSelect((select) => select(blockEditorStore).getSelectedBlockClientId(), []);

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
				const index = parentBlock.innerBlocks.findIndex((inner) => inner.clientId === selectedBlockId);
			}
		}, [selectedBlockId, blockId, clientId, setAttributes]);

		// Use custom hook for editor styles
		useEditorStyles(blockId);

		// Memorised style calculations
		const editorStyles = useMemo(() => {
			return {
				[`${VAR_PREFIX}tab-background`]: tabBackground || "#eee",
				[`${VAR_PREFIX}tab-background-hover`]: tabBackgroundHover || "#ddd",
				[`${VAR_PREFIX}tab-color`]: tabColor || "#000",
				[`${VAR_PREFIX}tab-color-hover`]: tabColorHover || "#000",
				[`${VAR_PREFIX}tab-font-size`]: fontSizeMap[tabFontSize] || "1rem",
				[`${VAR_PREFIX}tab-font-family`]: tabFontFamily === "heading" ? "var(--global-heading-font-family)" : "var(--global-body-font-family)",
				[`${VAR_PREFIX}tab-border-width`]: formatValueWithUnit(tabBorderWidth, tabBorderWidthUnit) || "0px",
				[`${VAR_PREFIX}tab-border-color`]: tabBorderColor || "transparent",
				[`${VAR_PREFIX}tab-border-radius`]: formatValueWithUnit(tabBorderRadius, tabBorderRadiusUnit) || "0px",
				[`${VAR_PREFIX}arrow-background`]: arrowBackground || "#eee",
				[`${VAR_PREFIX}arrow-background-hover`]: arrowBackgroundHover || "#ddd",
				[`${VAR_PREFIX}arrow-text`]: arrowText || "#333",
				[`${VAR_PREFIX}arrow-text-hover`]: arrowTextHover || "#000",
				[`${VAR_PREFIX}background`]: background || "transparent",
				[`${VAR_PREFIX}title-color`]: titleColor || "black",
			};
		}, [
			tabBackground,
			tabBackgroundHover,
			tabFontSize,
			tabFontFamily,
			tabColor,
			tabColorHover,
			tabBorderWidth,
			tabBorderWidthUnit,
			tabBorderColor,
			tabBorderRadius,
			tabBorderRadiusUnit,
			arrowBackground,
			arrowBackgroundHover,
			arrowText,
			arrowTextHover,
			background,
			titleColor,
		]);

		const blockProps = useBlockProps({
			id: htmlAnchor || "",
			className: ["timeline-slider-editor", blockId || "", extraClassNames || ""].filter(Boolean).join(" "),
			style: editorStyles,
			"data-slider": true,
		});

		const addNewSlide = useCallback(() => {
			const newBlock = createBlock("rs/timeline-slider-child");
			insertBlocks(newBlock, undefined, clientId);
		}, [insertBlocks, clientId]);

		return (
			<>
				<InspectorControls>
					<CustomTabPanel
						className="rs-timeline-slider-tabs"
						attributes={attributes}
						setAttributes={setAttributes}
						generalContent={
							<>
								<PanelBody className={"rs-timeline-general"} title={__("Title")} initialOpen={true}>
									<TextControl label="Timeline Title" value={blockTitle} onChange={(val) => setAttributes({ blockTitle: val })} />
									<SelectControl
										label="Title Alignment"
										value={titleAlign}
										options={[
										{ label: 'Left', value: 'left' },
										{ label: 'Center', value: 'center' },
										{ label: 'Right', value: 'right' },
										]}
										onChange={(value) => setAttributes({ titleAlign: value })}
									/>
								</PanelBody>
							</>
						}
						styleContent={
							<>
								<PanelBody className={"rs-timeline-slider-styles"} title={__("Styles")} initialOpen={true}>
									<ColorPickerCircle label={__("Timeline Block Background")} value={background} onChange={(value) => setAttributes({ background: value })} />

									<ColorPickerCircle label={__("Timeline Title Colour")} value={titleColor} onChange={(value) => setAttributes({ titleColor: value })} />

									<div>
										<label>
											<strong>{__("Slide Title Background")}</strong>
										</label>
										<div style={{ display: "flex", gap: "20px" }}>
											<ColorPickerCircle label={__("Normal")} value={tabBackground} onChange={(value) => setAttributes({ tabBackground: value })} />
											<ColorPickerCircle label={__("Hover")} value={tabBackgroundHover} onChange={(value) => setAttributes({ tabBackgroundHover: value })} />
										</div>
									</div>

									<div>
										<label>
											<strong>{__("Slide Title Colour")}</strong>
										</label>
										<div style={{ display: "flex", gap: "20px" }}>
											<ColorPickerCircle label={__("Normal")} value={tabColor} onChange={(value) => setAttributes({ tabColor: value })} />
											<ColorPickerCircle label={__("Hover")} value={tabColorHover} onChange={(value) => setAttributes({ tabColorHover: value })} />
										</div>
									</div>

									<ToggleControl
										label={__("Use Individual Borders")}
										checked={useIndividualBorders}
										onChange={(val) => setAttributes({ useIndividualBorders: val })}
									/>

									{!useIndividualBorders && (
										<>
											<ColorPickerCircle label={__("Slide Title Border Colour")} value={tabBorderColor} onChange={(value) => setAttributes({ tabBorderColor: value })} />
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
										<label>
											<strong>{__("Arrow Background")}</strong>
										</label>
										<div style={{ display: "flex", gap: "20px" }}>
											<ColorPickerCircle label={__("Normal")} value={arrowBackground} onChange={(value) => setAttributes({ arrowBackground: value })} />
											<ColorPickerCircle label={__("Hover")} value={arrowBackgroundHover} onChange={(value) => setAttributes({ arrowBackgroundHover: value })} />
										</div>
									</div>

									<div>
										<label>
											<strong>{__("Arrow Text")}</strong>
										</label>
										<div style={{ display: "flex", gap: "20px" }}>
											<ColorPickerCircle label={__("Normal")} value={arrowText} onChange={(value) => setAttributes({ arrowText: value })} />
											<ColorPickerCircle label={__("Hover")} value={arrowTextHover} onChange={(value) => setAttributes({ arrowTextHover: value })} />
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
							</>
						}
					/>
				</InspectorControls>

				<BlockControls>
					<ToolbarGroup>
						<ToolbarButton icon={plus} label={__("Add Timeline Slide")} onClick={addNewSlide} aria-label="Add a timeline slide" />
						<DropdownMenu icon={chevronDown} label={__("Timeline Slider Options")} popoverProps={{ placement: "bottom-start", offset: [0, 4] }}>
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
				</BlockControls>

				<div {...blockProps}>
					<div className={`timeline-slider-wrapper ${innerContentWidth ? "use-theme-content-width" : ""}`}>
						<RichText
						tagName="h2"
						value={blockTitle}
						onChange={(value) => setAttributes({ blockTitle: value })}
						placeholder={__("Timeline Title")}
						className="timeline-title"
						style={{ textAlign: titleAlign }}
						/>
						<InnerBlocks
							templateLock={false}
							template={[["rs/timeline-slider-child", {}]]}
							allowedBlocks={ALLOWED_BLOCKS}
							templateInsertUpdatesSelection={false}
							renderAppender={false}
						/>
						{!innerBlocks.length && <div style={{ textAlign: "center", color: "#999" }}>{__("Add timeline slides using the toolbar button above")}</div>}
					</div>
				</div>
			</>
		);
	},

	save({ attributes }) {
		const { htmlAnchor, extraClassNames, blockTitle, innerContentWidth, blockId, titleAlign } = attributes;

		const styleVars = buildStyleVars(attributes);
		const cssVars = Object.entries(styleVars)
			.filter(([_, val]) => val !== undefined && val !== "")
			.map(([key, val]) => `${key}: ${val};`)
			.join(" ");

		const blockProps = useBlockProps.save({
			id: htmlAnchor || "",
			className: [blockId || "", extraClassNames || ""].filter(Boolean).join(" "),
			"data-slider": true,
		});

		return (
			<>
				{blockId && <style>{`.wp-block-rs-timeline-slider.${blockId} { ${cssVars} }`}</style>}
				<div {...blockProps}>
					<div className={`timeline-slider-wrapper ${innerContentWidth ? "use-theme-content-width" : ""}`}>
						<RichText.Content
						tagName="h2"
						value={blockTitle}
						className="timeline-title"
						style={{ textAlign: titleAlign }}
						/>
						<InnerBlocks.Content />
					</div>
				</div>
			</>
		);
	},
});