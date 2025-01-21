//categories.js
document.addEventListener("DOMContentLoaded", () => {
    const containerTemplates = {
      default: `
        <div class="container">
          <h2 style="margin-left: 0px;">Welcome</h2>
          <p>Please select a category above to see the corresponding locations.</p>
        </div>
      `,

      minyanim: `
        <div id="minyanim-container">
          <h2 style="margin-left: 18px;">Minyanim Locations</h2>
          <div class="container">
            <div class="md-12">
              <div id="locations-list">
              </div>
            </div>
          </div>
        </div>
      `,

      restaurants: `
        <div id="restaurants-container">
          <h2 style="margin-left: 18px;">Restaurants Locations</h2>
          <div class="container">
            <div class="md-12">
              <div id="locations-list">
              </div>
            </div>
          </div>
        </div>
      `,

      businesses: `
        <div id="businesses-container">
          <h2 style="margin-left: 18px;">Businesses Locations</h2>
          <div class="container">
            <div class="md-12">
              <div class="row" style="margin-bottom: 2rem;">
                <div class="column lg-8 md-12 border-left">
                  <div id="location-businesses-sponsored">
                  </div>
                </div>
                <div class="column lg-4 md-12 border-left">
                  <div id="locations-list">
                  </div>
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