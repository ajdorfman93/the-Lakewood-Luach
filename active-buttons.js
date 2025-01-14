//active-buttons.js
document.addEventListener('DOMContentLoaded', () => {
    /**
     * A helper function that enforces a single "active" button
     * among all buttons matching a given selector.
     */
    function setSingleActive(selector) {
      const buttons = document.querySelectorAll(selector);
  
      // Attach a click event to each button in this group
      buttons.forEach(button => {
        button.addEventListener('click', () => {
          // Remove "active" from all buttons in this group
          buttons.forEach(btn => btn.classList.remove('active'));
          // Add "active" to the clicked button
          button.classList.add('active');
        });
      });
    }
  
    // Enforce single-active behavior on each group of buttons:
    setSingleActive('.category-button');
    setSingleActive('.nusach-button'); 
    setSingleActive('.tefilah-button');
    setSingleActive('.rest-price');     
    setSingleActive('.rest-cuisine');  
    setSingleActive('.biz-subtype-cat');
    setSingleActive('.biz-primary-cat');     
  });