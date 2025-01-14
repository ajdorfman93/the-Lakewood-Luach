//active-buttons-dynamic.js
document.addEventListener("DOMContentLoaded", function () {
    // Use a single event listener for the entire document:
    document.addEventListener("click", function (event) {
      // 1. If clicked element is a .biz-subtype-cat
      if (event.target.classList.contains("biz-subtype-cat")) {
        setSingleActiveWithinParent(event.target, ".biz-subtype-cat");
      }
  
      // 2. If clicked element is a .biz-primary-cat
      if (event.target.classList.contains("biz-primary-cat")) {
        setSingleActiveWithinParent(event.target, ".biz-primary-cat");
      }
  
      // 3. If clicked element is a .rest-service
      if (event.target.classList.contains("rest-service")) {
        setSingleActiveWithinParent(event.target, ".rest-service");
      }
    });
  });
  
  /**
   * Helper function:
   *  - Removes "active" from all siblings matching the same selector
   *  - Adds "active" to the clicked element.
   */
  function setSingleActiveWithinParent(clickedEl, selector) {
    // The parent container of the clicked button
    const parent = clickedEl.parentElement;
    if (!parent) return;
  
    // Remove 'active' from sibling buttons
    const siblings = parent.querySelectorAll(selector);
    siblings.forEach(btn => btn.classList.remove("active"));
  
    // Add 'active' to the clicked button
    clickedEl.classList.add("active");
  }
  