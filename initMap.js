(function () {
  let currentCategory = "restaurants";

  function callInitMarkers(force = false) {
    if (!force && window.__mapInitialized) {
      return;
    }

    if (typeof window.initMarkersMap === "function") {
      window.initMarkersMap();
      window.__mapInitialized = true;
    } else if (typeof window.initMap === "function") {
      window.initMap();
      window.__mapInitialized = true;
    } else {
      console.warn("No marker map initializer found.");
    }
  }

  function callInitMinyanim() {
    if (typeof window.initMinyanimMap === "function") {
      window.initMinyanimMap();
    } else if (typeof window.refreshMapMarkers === "function") {
      window.refreshMapMarkers();
    } else {
      console.warn("No minyanim map initializer found.");
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    callInitMarkers(false);

    document.querySelectorAll(".category-button").forEach((btn) => {
      btn.addEventListener("click", () => {
        const category = btn.dataset.category;
        if (!category || category === currentCategory) {
          return;
        }

        currentCategory = category;
        if (category === "minyanim") {
          callInitMinyanim();
        } else {
          callInitMarkers(true);
        }
      });
    });
  });
})();
