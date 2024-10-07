(function() {
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

    // Function to clone an element and apply inline styles recursively
    function cloneWithStyles(element) {
        const clone = element.cloneNode(true);  // Deep clone the element
        applyStylesRecursively(clone, element);
        return clone;
    }

    // Recursively apply inline styles to an element and its children
    function applyStylesRecursively(clone, original) {
        const computedStyle = window.getComputedStyle(original);
        clone.style.cssText = getInlineStyles(original);

        const children = Array.from(clone.children);
        const originalChildren = Array.from(original.children);

        for (let i = 0; i < children.length; i++) {
            applyStylesRecursively(children[i], originalChildren[i]);
        }
    }

    // Function to gather relevant CSS rules that apply to the element and its children
    function getCSSRulesForElement(element) {
        let cssRules = '';
        for (const sheet of document.styleSheets) {
            try {
                if (!sheet.cssRules) continue;  // Some external stylesheets might block access

                for (const rule of sheet.cssRules) {
                    if (element.matches(rule.selectorText)) {
                        cssRules += `${rule.cssText}\n`;
                    }
                }
            } catch (e) {
                // Handle CORS issue
                console.warn("Cannot access CSS stylesheet:", e);
            }
        }
        return cssRules;
    }

    // Function to highlight the element with a red dashed border
    function highlightElement(e) {
        if (lastElement) {
            lastElement.style.outline = lastOutline;  // Restore the last element's outline
        }
        lastElement = e.target;
        lastOutline = lastElement.style.outline;
        lastElement.style.outline = '2px dashed red';  // Set red dashed outline
    }

    // Function to handle the click event and download the HTML
    function handleClick(e) {
        e.preventDefault();
        const element = e.target;

        // Clone the element and capture inline styles
        const clonedElement = cloneWithStyles(element);

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
        document.removeEventListener('mouseover', highlightElement);
        document.removeEventListener('click', handleClick);
    }

    // Add event listeners for hover and click
    document.addEventListener('mouseover', highlightElement);
    document.addEventListener('click', handleClick);
})();
