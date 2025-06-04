import { registerBlockType } from '@wordpress/blocks';
import { InnerBlocks, useBlockProps } from '@wordpress/block-editor';

import './editor.scss';
import './style.scss';

const ALLOWED_BLOCKS = ['my-custom-blocks/slide'];

registerBlockType('rs/timeline-slider', {
    title: 'Timeline Slider',
    icon: 'schedule',
    category: 'layout',
    edit() {
        const blockProps = useBlockProps();

        return (
            <div {...blockProps} className="timeline-slider-editor" data-slider="true">
                <InnerBlocks
                allowedBlocks={ALLOWED_BLOCKS}
                templateLock={false}
                renderAppender={() => <InnerBlocks.ButtonBlockAppender />}
                />
            </div>
        );
    },
    save() {
        return (
            <div className="timeline-slider" data-slider="true">
                <InnerBlocks.Content />
            </div>
        );
    },
});