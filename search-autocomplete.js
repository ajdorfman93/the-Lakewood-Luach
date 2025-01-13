// search-autocomplete.js
  let autocomplete;      // The single autocomplete instance
  let searchInput;       // The single search input element

  // We'll initialize this once, on DOMContentLoaded
  document.addEventListener("DOMContentLoaded", () => {
    searchInput = document.getElementById("search-input");
    if (!searchInput) return;

    // 1) Restore typed text from localStorage if you want
    const savedValue = localStorage.getItem("searchText") || "";
    searchInput.value = savedValue;

    // 2) Listen for any changes and store them
    searchInput.addEventListener("input", () => {
      localStorage.setItem("searchText", searchInput.value);
    });

    // 3) Create the single Autocomplete object
    autocomplete = new google.maps.places.Autocomplete(searchInput);

    // IMPORTANT: We will NOT bind to a specific map yet. 
    // We'll do that inside each map’s init function by calling:
    //    autocomplete.bindTo('bounds', someMapInstance);
  });
