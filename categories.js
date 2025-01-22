//categories.js
document.addEventListener("DOMContentLoaded", () => {
    const containerTemplates = {
      default: `
          <h2>Welcome</h2>
          <p>Please select a category above to see the corresponding locations.</p>
      `,

      minyanim: `
          <h2>Minyanim Locations</h2>
          <div class="container">
            <div class="md-12">
              <div id="locations-list">
              </div>
            </div>
          </div>
      `,

      restaurants: `
          <h2>Restaurants Locations</h2>
          <div class="container">
            <div class="md-12">
              <div id="locations-list">
              </div>
            </div>
          </div>
      `,

      businesses: `
          <h2>Businesses Locations</h2>
          <div class="containerBusinesses">
            <div class="md-12">
              <div class="row" style="margin-bottom: 2rem;">
          <div class="container column lg-8 md-12 border-left">
                  <div id="location-businesses-sponsored">
                  </div>
                </div>
          <div class="container column lg-4 md-12 border-left">
                  <div id="locations-list">
                  </div>
                </div>
              </div>
            </div>
          </div>
      `,
    };

    const categoryButtons = document.querySelectorAll(".category-button");
    const mainContainer = document.getElementById("mainContainer");

    // Initially load the default "welcome" content
    mainContainer.innerHTML = containerTemplates.default;

    // Attach click event to each category button
    categoryButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const category = button.getAttribute("data-category");
        loadCategory(category);
      });
    });

    function loadCategory(category) {
      // If we have a matching category snippet, load it; otherwise, load default
      if (containerTemplates[category]) {
        mainContainer.innerHTML = containerTemplates[category];
      } else {
        mainContainer.innerHTML = containerTemplates.default;
      }
    }
  });