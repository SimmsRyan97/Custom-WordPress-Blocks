import { __ } from "@wordpress/i18n";
import { registerBlockType } from "@wordpress/blocks";
import {
  InnerBlocks,
  InspectorControls,
  useBlockProps,
} from "@wordpress/block-editor";
import { PanelBody, TextControl } from "@wordpress/components";
import { useEffect } from "@wordpress/element";

import "./editor.scss";
import "./style.scss";

registerBlockType("rs/timeline-slider-child", {
  title: "Timeline Slider Child",
  icon: "text",
  category: "layout",
  parent: ["rs/timeline-slider"],
  attributes: {
    title: {
      type: "string",
      default: "",
    },
    slideId: {
      type: "string",
    },
    slideIndex: {
      type: "number",
    },
  },
  
  edit({ attributes, setAttributes, clientId }) {
    const blockProps = useBlockProps();

    // Initialize slideId when component mounts
    useEffect(() => {
      if (clientId && !attributes.slideId) {
        const id = `slide-${clientId.slice(0, 8)}`;
        setAttributes({ slideId: id });
      }
    }, [clientId, attributes.slideId, setAttributes]);

    return (
      <>
        <InspectorControls>
          <PanelBody title={__("Slide Settings")}>
            <TextControl
              label={__("Slide Title")}
              value={attributes.title}
              onChange={(title) => setAttributes({ title })}
              help={__("This title will be used for navigation and accessibility")}
            />
            {/* Additional controls for styling can go here */}
          </PanelBody>
        </InspectorControls>
        
        <div
          {...blockProps}
          data-slide-id={attributes.slideId}
          className={`slide-editor slide-${attributes.slideIndex || 0}`}
          role="group"
          aria-label={attributes.title || `Slide ${attributes.slideIndex + 1 || 1}`}
        >
          <InnerBlocks />
        </div>
      </>
    );
  },

  save({ attributes }) {
    const blockProps = useBlockProps.save();
    
    return (
      <div
        {...blockProps}
        data-slide-id={attributes.slideId}
        data-title={attributes.title || ""}
        className={`slide slide-${attributes.slideIndex || 0}`}
        role="group"
        aria-label={attributes.title || `Slide ${attributes.slideIndex + 1 || 1}`}
      >
        <InnerBlocks.Content />
      </div>
    );
  },
});