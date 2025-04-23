/**
 * Utility to remove any unwanted branding elements from the page
 */

export function removeBranding() {
  // Function to remove elements that match certain criteria
  const removeElements = () => {
    // Remove elements by class name, id, or attribute containing 'replit'
    const selectors = [
      '.replit-badge',
      '[data-replit-badge]',
      'iframe[src*="replit.com"]',
      '[class*="replit"]',
      '[id*="replit"]',
      // Target the specific badge element
      'a[href*="replit.com"]',
      // Target divs that might contain the badge
      'div[style*="position: fixed; bottom: 0px; right: 0px;"]'
    ];

    selectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(el => {
        el.remove();
      });
    });

    // Also clean up any <script> tags loading replit resources
    const scripts = document.querySelectorAll('script');
    scripts.forEach(script => {
      if (script.src && script.src.includes('replit')) {
        script.remove();
      }
    });
  };

  // Run on load and periodically check
  removeElements();

  // Add a MutationObserver to detect and remove elements as they appear
  const observer = new MutationObserver((mutations) => {
    mutations.forEach(() => {
      removeElements();
    });
  });

  // Start observing the document with the configured parameters
  observer.observe(document.body, { 
    childList: true, 
    subtree: true 
  });

  // Also run on a timer for any elements that might be added in ways that 
  // bypass the MutationObserver
  setInterval(removeElements, 1000);

  // Return the observer and interval for cleanup if needed
  return () => {
    observer.disconnect();
  };
}

export default removeBranding;