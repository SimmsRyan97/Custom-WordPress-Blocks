import { registerBlockType } from '@wordpress/blocks';
import { InspectorControls, RichText, MediaUpload } from '@wordpress/block-editor';
import { Button, PanelBody, PanelRow } from '@wordpress/components';
import { v4 as uuidv4 } from 'uuid';

import './editor.scss';
import './style.scss';

registerBlockType('rs/generic-slider', {
    title: 'Generic Slider',
    icon: 'images-alt2',
    category: 'widgets',
    attributes: {
        slides: {
            type: 'array',
            default: [],
        },
    },

    edit: ({ attributes, setAttributes }) => {
        const { slides } = attributes;

        // Add a new slide with a unique id
        const addSlide = () => {
            const newSlide = { id: uuidv4(), text: '', image: '' };
            setAttributes({ slides: [...slides, newSlide] });
        };

        // Remove a slide based on its unique id
        const removeSlide = (id) => {
            const updatedSlides = slides.filter(slide => slide.id !== id);
            setAttributes({ slides: updatedSlides });
        };

        // Update a slide by id
        const updateSlide = (id, key, value) => {
            const updatedSlides = slides.map(slide =>
                slide.id === id ? { ...slide, [key]: value } : slide
            );
            setAttributes({ slides: updatedSlides });
        };

        return (
            <div className="generic-slider-editor">
                <InspectorControls>
                    <PanelBody title="Settings">
                        <PanelRow>
                            <Button isPrimary onClick={addSlide}>
                                Add Slide
                            </Button>
                        </PanelRow>
                    </PanelBody>
                </InspectorControls>
                <div className="slider-preview">
                    {slides.map((slide) => (
                        <div key={slide.id} className="slider-item">
                            <MediaUpload
                                onSelect={(media) => updateSlide(slide.id, 'image', media.url)}
                                allowedTypes={['image']}
                                render={({ open }) => (
                                    <Button isSecondary onClick={open}>
                                        {slide.image ? (
                                            <img src={slide.image} alt="Slide" />
                                        ) : (
                                            'Select Image'
                                        )}
                                    </Button>
                                )}
                            />
                            <div className="text-container">
                                <RichText
                                    tagName="div"
                                    placeholder="Slide Text"
                                    value={slide.text}
                                    onChange={(value) => updateSlide(slide.id, 'text', value)}
                                    multiline="p"
                                />
                            </div>
                            <Button isDestructive onClick={() => removeSlide(slide.id)}>
                                Remove
                            </Button>
                        </div>
                    ))}
                </div>
            </div>
        );
    },

    save: ({ attributes }) => {
        const { slides } = attributes;

        return (
            <div className="carousel">
                <div className="entries">
                    {slides.map((slide) => (
                        <div key={slide.id} className="slider-entry">
                            {slide.image && (
                                <div className="image-container">
                                    <img src={slide.image} alt="Slide" />
                                </div>
                            )}
                            {slide.text && (
                                <RichText.Content tagName="div" value={slide.text} />
                            )}
                        </div>
                    ))}
                </div>
                <div className="markers">
                    {slides.map((_, index) => (
                        <button key={index} className="marker" data-slide={index + 1}></button>
                    ))}
                </div>
            </div>
        );
    },
});