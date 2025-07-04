<?php
/*
Plugin Name: Ryan Simms Custom Blocks
Description: This plugin contains a timeline slider block. It is built primarily for Kadence but will fallback to theme variables if Kadence isn't used.
Version: 1.1.44
Author: Ryan Simms
*/

// Enqueue block assets
function rs_blocks_register_block() {
    // Register block editor script (shared script for multiple blocks)
    wp_register_script(
        'rs-blocks-editor-script',
        plugins_url( 'build/index.js', __FILE__ ),
        array( 'wp-blocks', 'wp-element', 'wp-editor' ),
        filemtime( plugin_dir_path( __FILE__ ) . 'build/index.js' )
    );

    // Register block editor styles
    wp_register_style(
        'rs-blocks-editor-style',
        plugins_url( 'build/index.css', __FILE__ ),
        array( 'wp-edit-blocks' ),
        filemtime( plugin_dir_path( __FILE__ ) . 'build/index.css' )
    );

    // Register front-end styles
    wp_register_style(
        'rs-blocks-style',
        plugins_url( 'build/style-index.css', __FILE__ ),
        array(),
        filemtime( plugin_dir_path( __FILE__ ) . 'build/style-index.css' )
    );

    // List of blocks to register
    $blocks = array( 'bar-chart', 'timeline-slider', 'timeline-slider-child' );

    // Dynamically register blocks
    foreach ( $blocks as $block ) {
        register_block_type(
            "rs/{$block}",
            array(
                'editor_script' => 'rs-blocks-editor-script',
                'editor_style'  => 'rs-blocks-editor-style',
                'style'         => 'rs-blocks-style',
            )
        );
    }   
}

add_action( 'init', 'rs_blocks_register_block' );

// Efficiently enqueue frontend scripts
function rs_enqueue_frontend_scripts() {
    global $post;
    if (!$post) return;

    $content = $post->post_content;

    if (has_block('rs/bar-chart', $content)) {
        wp_enqueue_script(
            'bar-animation',
            plugin_dir_url(__FILE__) . 'bar-animation.js',
            array(),
            filemtime(plugin_dir_path(__FILE__) . 'bar-animation.js'),
            true
        );
    }

    if (has_block('rs/generic-slider', $content)) {
        wp_enqueue_script(
            'slider-nav',
            plugin_dir_url(__FILE__) . 'slider-navigation.js',
            array(),
            filemtime(plugin_dir_path(__FILE__) . 'slider-navigation.js'),
            true
        );
    }

    if (has_block('rs/timeline-slider', $content)) {
        wp_enqueue_script(
            'timeline-slider-nav',
            plugin_dir_url(__FILE__) . 'timeline-slider-functions.js',
            array(),
            filemtime(plugin_dir_path(__FILE__) . 'timeline-slider-functions.js'),
            true
        );
    }
}
add_action('wp_enqueue_scripts', 'rs_enqueue_frontend_scripts');