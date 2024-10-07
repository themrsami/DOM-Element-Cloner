(function () {
    let lastElement = null;
    let lastOutline = '';

    // Function to capture inline styles of an element and its children
    function getInlineStyles(element) {
        const style = window.getComputedStyle(element);
        let inlineStyles = '';
        for (let i = 0; i < style.length; i++) {
            inlineStyles += `${style[i]}: ${style.getPropertyValue(style[i])}; `;
        }
        return inlineStyles;
    }

    // Function to convert relative URLs to absolute URLs
    function convertRelativePaths(clone) {
        const baseUrl = window.location.origin;

        // Convert relevant attributes to absolute paths
        const attributesToConvert = ['src', 'href', 'data-src', 'data-href']; // Add more as necessary
        attributesToConvert.forEach(attr => {
            if (clone.hasAttribute(attr)) {
                const value = clone.getAttribute(attr);
                if (value.startsWith('/')) {
                    // Convert root-relative paths
                    clone.setAttribute(attr, baseUrl + value);
                } else if (!value.startsWith('http') && !value.startsWith('https')) {
                    // Convert relative paths
                    clone.setAttribute(attr, new URL(value, baseUrl).href);
                }
            }
        });

        // Specifically handle <img> tags to ensure their src attributes are absolute
        if (clone.tagName.toLowerCase() === 'img') {
            const src = clone.getAttribute('src');
            if (src && (src.startsWith('/') || !src.startsWith('http'))) {
                clone.setAttribute('src', new URL(src, baseUrl).href);
            }
        }

        // Recursively check all children for <img> tags
        Array.from(clone.children).forEach(child => convertRelativePaths(child));
    }

    // Function to clone an element and apply inline styles recursively
    function cloneWithStyles(element) {
        const clone = element.cloneNode(true); // Deep clone the element
        applyStylesRecursively(clone, element);
        convertRelativePaths(clone); // Convert relative paths after cloning
        return clone;
    }

    // Recursively apply inline styles to an element and its children
    function applyStylesRecursively(clone, original) {
        clone.style.cssText = getInlineStyles(original);
        const children = Array.from(clone.children);
        const originalChildren = Array.from(original.children);

        for (let i = 0; i < children.length; i++) {
            applyStylesRecursively(children[i], originalChildren[i]);
        }
    }

    // Function to gather relevant CSS rules that apply to the element
    function getCSSRulesForElement(element) {
        let cssRules = '';
        for (const sheet of document.styleSheets) {
            try {
                if (!sheet.cssRules) continue; // Some stylesheets might block access

                for (const rule of sheet.cssRules) {
                    if (element.matches(rule.selectorText)) {
                        cssRules += `${rule.cssText}\n`;
                    }
                }
            } catch (e) {
                console.warn("Cannot access CSS stylesheet:", e);
            }
        }
        return cssRules;
    }

    // Function to highlight the element with a red dashed border
    function highlightElement(e) {
        if (lastElement) {
            lastElement.style.outline = lastOutline; // Restore the last element's outline
        }
        lastElement = e.target;
        lastOutline = lastElement.style.outline;
        lastElement.style.outline = '2px dashed red'; // Set red dashed outline
    }

    // Function to handle the click event and download the HTML
    function handleClick(e) {
        e.preventDefault();
        const element = e.target;

        // Remove the red outline before cloning the element for download
        lastElement.style.outline = lastOutline; 

        // Clone the element and capture inline styles, but remove the outline
        const clonedElement = cloneWithStyles(element);
        clonedElement.style.outline = ''; // Remove the red dashed outline from the downloaded element

        // Capture external CSS styles
        const externalCSS = getCSSRulesForElement(element);

        // Create a blob for the HTML content
        const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>${externalCSS}</style>
            </head>
            <body>
                ${clonedElement.outerHTML}
            </body>
            </html>
        `;

        const blob = new Blob([htmlContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);

        // Create a link element to trigger the download
        const downloadLink = document.createElement('a');
        downloadLink.href = url;
        downloadLink.download = 'element.html';
        downloadLink.click();

        // Clean up
        URL.revokeObjectURL(url);
    }

    // Add event listeners for hover and click
    document.addEventListener('mouseover', highlightElement);
    document.addEventListener('click', handleClick);

})();
