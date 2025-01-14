// search-autocomplete.js
let autocomplete;      // The single autocomplete instance
let searchInput;       // The single search input element

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

  // IMPORTANT: We do NOT bind to a specific map here.
  // We'll do that in each map's init function (initMarkersMap or initMinyanimMap).
});
