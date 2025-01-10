<?php
/*
Plugin Name: Nettl of Stockport Blocks
Description: Custom Gutenberg blocks.
Version: 1.0
Author: Ryan Simms
*/

// Enqueue block assets
function my_custom_block_register_block() {
    // Register block editor script
    wp_register_script(
        'my-custom-block-editor-script',
        plugins_url( 'build/index.js', __FILE__ ),
        array( 'wp-blocks', 'wp-element', 'wp-editor' ),
        filemtime( plugin_dir_path( __FILE__ ) . 'build/index.js' )
    );

    // Register block editor styles
    wp_register_style(
        'my-custom-block-editor-style',
        plugins_url( 'build/index.css', __FILE__ ),
        array( 'wp-edit-blocks' ),
        filemtime( plugin_dir_path( __FILE__ ) . 'build/index.css' )
    );

    // Register front-end styles
    wp_register_style(
        'my-custom-block-style',
        plugins_url( 'build/style-index.css', __FILE__ ),
        array(),
        filemtime( plugin_dir_path( __FILE__ ) . 'build/style-index.css' )
    );

    // Enqueue additional script for animation if needed
    wp_enqueue_script(
        'my-custom-block-js', 
        plugins_url( 'bar-animation.js', __FILE__ ),
        array( 'jquery' ),
        false,
        true
    );

    wp_enqueue_script(
        'remove-advanced-panel', 
        plugins_url( 'remove-advanced-panel.js', __FILE__ ),
        array( 'wp-blocks', 'wp-dom-ready', 'wp-edit-post' ),
        null,
        true
    );

    // Register the block
    register_block_type( 'my-custom/block', array(
        'editor_script' => 'my-custom-block-editor-script',
        'editor_style'  => 'my-custom-block-editor-style',
        'style'         => 'my-custom-block-style', // Enqueue for front end
    ) );
}

add_action( 'init', 'my_custom_block_register_block' );

function disable_advanced_panel( $settings ) {
    // Set 'show_in_block_settings' to false to remove the advanced tab panel.
    if (isset($settings['supports']['advanced'])) {
        $settings['supports']['advanced'] = false;
    }
    return $settings;
}
add_filter( 'block_editor_settings', 'disable_advanced_panel' );