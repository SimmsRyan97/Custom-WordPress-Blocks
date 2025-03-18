import { useEffect, useRef } from '@wordpress/element';
import { registerBlockType } from '@wordpress/blocks';
import { InspectorControls, RichText, MediaUpload } from '@wordpress/block-editor';
import { Button, PanelBody, PanelRow } from '@wordpress/components';
import { v4 as uuidv4 } from 'uuid'; // Ensure each slide has a unique ID

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
        const sliderRef = useRef(null); // Reference for scrolling to the last slide

        const addSlide = () => {
            const newSlide = { id: uuidv4(), text: '', image: '' };
            setAttributes({ slides: [...slides, newSlide] });

            // Allow time for state update, then scroll to the new slide
            setTimeout(() => {
                if (sliderRef.current) {
                    sliderRef.current.lastElementChild.scrollIntoView({ behavior: 'smooth' });
                }
            }, 100);
        };

        const removeSlide = (id) => {
            const updatedSlides = slides.filter((slide) => slide.id !== id);
            setAttributes({ slides: updatedSlides });
        };

        const updateSlide = (id, key, value) => {
            const updatedSlides = slides.map((slide) =>
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
                <div className="slider-preview" ref={sliderRef}>
                    {slides.map((slide, index) => (
                        <div key={slide.id} className="slider-item">
                            <MediaUpload
                                onSelect={(media) => updateSlide(slide.id, 'image', media.url)}
                                allowedTypes={['image']}
                                render={({ open }) => (
                                    <Button isSecondary onClick={open}>
                                        {slide.image ? (
                                            <img src={slide.image} alt={`Slide ${index}`} />
                                        ) : (
                                            'Select Image'
                                        )}
                                    </Button>
                                )}
                            />
                            <RichText
                                tagName="div"
                                placeholder="Slide Text"
                                value={slide.text}
                                onChange={(value) => updateSlide(slide.id, 'text', value)}
                                allowedFormats={['core/bold', 'core/italic']}
                                multiline="p" // Ensures paragraphs instead of <br>
                                keepPlaceholderOnFocus
                            />
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
                    {slides.map((slide, index) => (
                        <div key={slide.id} className="slider-entry" id={`slide${index + 1}`}>
                            {slide.image && (
                                <div className="image-container">
                                    <img src={slide.image} alt={`Slide ${index}`} />
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