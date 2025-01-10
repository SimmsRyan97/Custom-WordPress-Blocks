import { registerBlockType } from '@wordpress/blocks';
import { InspectorControls, RichText, MediaUpload } from '@wordpress/block-editor';
import { Button, PanelBody, PanelRow } from '@wordpress/components';


import './editor.scss';
import './style.scss';

registerBlockType('nettl/testimonial-carousel', {
    title: 'Testimonial Carousel',
    icon: 'format-quote',
    category: 'widgets',
    attributes: {
        testimonials: {
            type: 'array',
            default: [],
        },
    },
    edit: ({ attributes, setAttributes }) => {
        const { testimonials } = attributes;

        const addTestimonial = () => {
            const newTestimonial = { name: '', message: '', image: '' };
            setAttributes({ testimonials: [...testimonials, newTestimonial] });
        };

        const updateTestimonial = (index, key, value) => {
            const updatedTestimonials = [...testimonials];
            updatedTestimonials[index][key] = value;
            setAttributes({ testimonials: updatedTestimonials });
        };

        return (
            <div className="testimonial-carousel-editor">
                <InspectorControls>
                    <PanelBody title="Settings">
                        <PanelRow>
                            <Button isPrimary onClick={addTestimonial}>
                                Add Testimonial
                            </Button>
                        </PanelRow>
                    </PanelBody>
                </InspectorControls>
                <div>
                    {testimonials.map((testimonial, index) => (
                        <div key={index} className="testimonial-item">
                            <MediaUpload
                                onSelect={(media) =>
                                    updateTestimonial(index, 'image', media.url)
                                }
                                allowedTypes={['image']}
                                render={({ open }) => (
                                    <Button isSecondary onClick={open}>
                                        {testimonial.image ? (
                                            <img
                                                src={testimonial.image}
                                                alt={`Testimonial ${index}`}
                                                style={{ width: '100px' }}
                                            />
                                        ) : (
                                            'Select Image'
                                        )}
                                    </Button>
                                )}
                            />
                            <RichText
                                placeholder="Name"
                                value={testimonial.name}
                                onChange={(value) => updateTestimonial(index, 'name', value)}
                            />
                            <RichText
                                placeholder="Message"
                                value={testimonial.message}
                                onChange={(value) => updateTestimonial(index, 'message', value)}
                            />
                        </div>
                    ))}
                </div>
            </div>
        );
    },
    save: ({ attributes }) => {
        const { testimonials } = attributes;

        return (
            <div className="testimonial-carousel">
                {testimonials.map((testimonial, index) => (
                    <div key={index} className="testimonial-item">
                        {testimonial.image && (
                            <img
                                src={testimonial.image}
                                alt={`Testimonial ${index}`}
                                className="testimonial-image"
                            />
                        )}
                        <div className="testimonial-content">
                            <p className="testimonial-message">{testimonial.message}</p>
                            <p className="testimonial-name">- {testimonial.name}</p>
                        </div>
                    </div>
                ))}
            </div>
        );
    },
});