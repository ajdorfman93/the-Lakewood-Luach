// page-toggle.js
document.addEventListener("DOMContentLoaded", function () {
    const categoryButtons = document.querySelectorAll(".category-button");
  
    // A helper function to highlight the active category
    function highlightActiveCategory(category) {
      categoryButtons.forEach((btn) => {
        if (btn.dataset.category === category) {
          btn.classList.add("active");
        } else {
          btn.classList.remove("active");
        }
      });
    }
  
    // Check URL query params to see if there's an active category
    // e.g., ?category=minyanim
    const urlParams = new URLSearchParams(window.location.search);
    const currentCategory = urlParams.get("category");
    if (currentCategory) {
      highlightActiveCategory(currentCategory);
    }
  
    // Add click event to each category button
    categoryButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const category = button.getAttribute("data-category");
        
        // Redirect based on category
        if (category === "minyanim") {
          // Go to the Minyanim page
          window.location.href = `index-minyanim.html?category=${category}`;
        } else {
          // Go to the main index page (Restaurants or Businesses)
          window.location.href = `index.html?category=${category}`;
        }
      });
    });
  });
  