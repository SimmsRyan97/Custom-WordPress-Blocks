<?php
/*
Plugin Name: Nettl of Stockport Blocks
Description: Custom Gutenberg blocks.
Version: 1.0
Author: Ryan Simms
*/

// Enqueue block assets
function nettl_blocks_register_block() {
    // Register block editor script (shared script for multiple blocks)
    wp_register_script(
        'nettl-blocks-editor-script',
        plugins_url( 'build/index.js', __FILE__ ),
        array( 'wp-blocks', 'wp-element', 'wp-editor' ),
        filemtime( plugin_dir_path( __FILE__ ) . 'build/index.js' )
    );

    // Register block editor styles
    wp_register_style(
        'nettl-blocks-editor-style',
        plugins_url( 'build/index.css', __FILE__ ),
        array( 'wp-edit-blocks' ),
        filemtime( plugin_dir_path( __FILE__ ) . 'build/index.css' )
    );

    // Register front-end styles
    wp_register_style(
        'nettl-blocks-style',
        plugins_url( 'build/style-index.css', __FILE__ ),
        array(),
        filemtime( plugin_dir_path( __FILE__ ) . 'build/style-index.css' )
    );

    // List of blocks to register
    $blocks = array( 'bar-chart', 'new-block', 'testimonials' );

    // Dynamically register blocks
    foreach ( $blocks as $block ) {
        register_block_type(
            "nettl/{$block}",
            array(
                'editor_script' => 'nettl-blocks-editor-script',
                'editor_style'  => 'nettl-blocks-editor-style',
                'style'         => 'nettl-blocks-style',
            )
        );
    }

    // Additional scripts for functionality
    wp_enqueue_script(
        'bar-animation-script',
        plugins_url( 'bar-animation.js', __FILE__ ),
        array( 'jquery' ),
        false,
        true
    );

    wp_enqueue_script(
        'remove-advanced-panel-script',
        plugins_url( 'remove-advanced-panel.js', __FILE__ ),
        array( 'wp-blocks', 'wp-dom-ready', 'wp-edit-post' ),
        null,
        true
    );
}

add_action( 'init', 'nettl_blocks_register_block' );