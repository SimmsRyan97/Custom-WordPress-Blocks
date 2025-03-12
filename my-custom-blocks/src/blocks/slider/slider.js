import { registerBlockType } from '@wordpress/blocks';
import { InspectorControls, RichText, MediaUpload } from '@wordpress/block-editor';
import { Button, PanelBody, PanelRow } from '@wordpress/components';

import './editor.scss';
import './style.scss';

registerBlockType('nettl/generic-slider', {
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

        const addSlide = () => {
            const newSlide = { text: '', image: '' };
            setAttributes({ slides: [...slides, newSlide] });
        };

        const updateSlide = (index, key, value) => {
            const updatedSlides = [...slides];
            updatedSlides[index][key] = value;
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
                <div>
                    {slides.map((slide, index) => (
                        <div key={index} className="slider-item">
                            <MediaUpload
                                onSelect={(media) =>
                                    updateSlide(index, 'image', media.url)
                                }
                                allowedTypes={['image']}
                                render={({ open }) => (
                                    <Button isSecondary onClick={open}>
                                        {slide.image ? (
                                            <img
                                                src={slide.image}
                                                alt={`Slide ${index}`}
                                                style={{ width: '100px' }}
                                            />
                                        ) : (
                                            'Select Image'
                                        )}
                                    </Button>
                                )}
                            />
                            <RichText
                                placeholder="Slide Text"
                                value={slide.text}
                                onChange={(value) => updateSlide(index, 'text', value)}
                            />
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
                        <div key={index} className="slider-entry">
                            {slide.image && <img src={slide.image} alt={`Slide ${index}`} />}
                            {slide.text && <p>{slide.text}</p>}
                        </div>
                    ))}
                </div>
                <div className="markers">
                    {slides.map((_, index) => (
                        <span key={index} className="marker" data-target={`#slide${index + 1}`} />
                    ))}
                </div>
            </div>
        );
    },
});