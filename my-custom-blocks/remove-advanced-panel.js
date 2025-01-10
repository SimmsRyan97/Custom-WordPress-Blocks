// Wait for the WordPress block editor to be ready
wp.domReady(function() {
    // Create a MutationObserver to monitor DOM changes
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            // Look for the "Advanced" panel in the block editor's inspector
            const advancedPanel = document.querySelector('.block-editor-block-inspector__advanced');
            
            if (advancedPanel) {
                // Remove the advanced panel once it appears
                advancedPanel.remove();

                // Stop observing after removing the panel (optional)
                observer.disconnect();
            }
        });
    });

    // Start observing the document for changes in child elements (i.e., the inspector panel)
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
});