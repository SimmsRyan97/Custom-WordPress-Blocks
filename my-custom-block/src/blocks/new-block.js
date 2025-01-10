// src/blocks/my-new-block.js
import { registerBlockType } from '@wordpress/blocks';
import { BlockControls, AlignmentToolbar } from '@wordpress/block-editor';

registerBlockType('my-custom/my-new-block', {
    title: 'My New Block',
    icon: 'smiley',
    category: 'common',
    attributes: {
        text: {
            type: 'string',
            default: 'Hello, World!',
        },
        alignment: {
            type: 'string',
            default: 'center',
        },
    },

    edit({ attributes, setAttributes }) {
        const { text, alignment } = attributes;

        return (
            <div style={{ textAlign: alignment }}>
                <BlockControls>
                    <AlignmentToolbar
                        value={alignment}
                        onChange={(newAlignment) => setAttributes({ alignment: newAlignment })}
                    />
                </BlockControls>
                <input
                    type="text"
                    value={text}
                    onChange={(e) => setAttributes({ text: e.target.value })}
                />
            </div>
        );
    },

    save({ attributes }) {
        return <div style={{ textAlign: attributes.alignment }}>{attributes.text}</div>;
    },
});