# DOM Element Cloner

This JavaScript snippet allows you to interactively highlight HTML elements on a webpage and download their HTML representation, including inline styles and relevant CSS rules. 

## Features

- **Highlight Elements**: Hover over elements to highlight them with a red dashed border.
- **Clone with Styles**: Click on an element to clone it along with its inline styles and relevant CSS rules.
- **Download HTML**: Download the cloned element as an HTML file, preserving its appearance.

## Usage Instructions

1. **Open Developer Tools**:
   - In your web browser, right-click anywhere on the page and select "Inspect" (or press `F12`).
   
2. **Navigate to the Console**:
   - Click on the "Console" tab in the Developer Tools panel.

3. **Paste the Script**:
   - Copy the following JavaScript code and paste it into the console:

   ```javascript
   (function () {
       let lastElement = null;
       let lastOutline = '';

       function getInlineStyles(element) {
           const style = window.getComputedStyle(element);
           let inlineStyles = '';
           for (let i = 0; i < style.length; i++) {
               inlineStyles += `${style[i]}: ${style.getPropertyValue(style[i])}; `;
           }
           return inlineStyles;
       }

       function cloneWithStyles(element) {
           const clone = element.cloneNode(true);
           applyStylesRecursively(clone, element);
           return clone;
       }

       function applyStylesRecursively(clone, original) {
           clone.style.cssText = getInlineStyles(original);
           const children = Array.from(clone.children);
           const originalChildren = Array.from(original.children);

           for (let i = 0; i < children.length; i++) {
               applyStylesRecursively(children[i], originalChildren[i]);
           }
       }

       function getCSSRulesForElement(element) {
           let cssRules = '';
           for (const sheet of document.styleSheets) {
               try {
                   if (!sheet.cssRules) continue;

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

       function highlightElement(e) {
           if (lastElement) {
               lastElement.style.outline = lastOutline;
           }
           lastElement = e.target;
           lastOutline = lastElement.style.outline;
           lastElement.style.outline = '2px dashed red';
       }

       function handleClick(e) {
           e.preventDefault();
           const element = e.target;
           lastElement.style.outline = lastOutline;

           const clonedElement = cloneWithStyles(element);
           clonedElement.style.outline = '';

           const externalCSS = getCSSRulesForElement(element);

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

           const downloadLink = document.createElement('a');
           downloadLink.href = url;
           downloadLink.download = 'element.html';
           downloadLink.click();

           URL.revokeObjectURL(url);
       }

       document.addEventListener('mouseover', highlightElement);
       document.addEventListener('click', handleClick);
   })();
   ```

4. **Interact with the Page**:
   - **Hover**: Move your mouse over any HTML element to see it highlighted with a red dashed border.
   - **Click**: Click on an element to download its HTML representation, which includes the element's inline styles and relevant CSS rules.
   


## Note

- This script is designed to work on most modern web browsers. Ensure you have permission to interact with the page's elements before using it.
- If you encounter any issues, check the console for any warnings or errors related to stylesheet access.

## License

This project is open-source and available for use, modification, and distribution under the MIT License.

## Contributing

Contributions are welcome! If you have suggestions, improvements, or bug fixes, feel free to reach out or submit a pull request.

## Contact

For questions or feedback, please contact [themrsami](mailto:usamanazir13@gmail.com).
