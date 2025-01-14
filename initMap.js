        //initMap.js
        // Keep track of which category is currently loaded, to avoid re-initializing
        let currentCategory = "";
        document.addEventListener("DOMContentLoaded", () => {
          // By default, let’s load the "Markers" map for restaurants/businesses
          currentCategory = "restaurants";
          initMarkersMap();
          // Listen on each category button
          document.querySelectorAll(".category-button").forEach((btn) => {
            btn.addEventListener("click", () => {
              const category = btn.dataset.category;
              // If we’re already on that category, do nothing
              if (category === currentCategory) return;
              currentCategory = category;
              if (category === "minyanim") {
                // Initialize the minyanim map
                initMinyanimMap();
              } else {
                // Restaurants/Businesses => use the markers map
                initMarkersMap();
              }
            });
          });
        });