/**
 * Loading Overlay Component
 * Shows a spinner on page load and fades out when content is ready
 */
(function () {
    'use strict';

    // Remove overlay with fade animation
    function removeOverlay() {
        const overlay = document.getElementById('loading-overlay');
        if (overlay && !overlay.classList.contains('fade-out')) {
            overlay.classList.add('fade-out');
            setTimeout(() => {
                if (overlay.parentNode) {
                    overlay.parentNode.removeChild(overlay);
                }
            }, 300);
        }
    }

    // Initialize - remove overlay when DOM is ready
    function init() {
        // Small delay to allow CSS/fonts to load
        setTimeout(removeOverlay, 150);
    }

    // Handle different loading states
    if (document.readyState === 'complete') {
        // Page already fully loaded
        init();
    } else if (document.readyState === 'interactive') {
        // DOM ready, resources still loading
        init();
    } else {
        // Still loading
        document.addEventListener('DOMContentLoaded', init);
    }

    // Backup: also remove on window load
    window.addEventListener('load', function () {
        setTimeout(removeOverlay, 100);
    });

    // Expose functions globally for manual use
    window.showLoadingOverlay = function () {
        let overlay = document.getElementById('loading-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'loading-overlay';
            overlay.className = 'loading-overlay';
            overlay.innerHTML = `
                <div class="loading-spinner-container">
                    <div class="loading-spinner-ring"></div>
                    <span class="loading-text">Loading...</span>
                </div>
            `;
            document.body.insertBefore(overlay, document.body.firstChild);
        }
        overlay.classList.remove('fade-out');
        return overlay;
    };

    window.hideLoadingOverlay = function () {
        removeOverlay();
    };
})();
