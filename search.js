// search.js

let autocomplete = null;
let searchMap = null; // Points to the currently active Google Map
let searchMarker = null; // Red marker placed by the search

/**
 * Initialize the #search-input autocomplete (only called once).
 * The map is not set here yet, so we won't attach it to any map
 * until we call setSearchMap().
 */
function initSearchInput() {
  const input = document.getElementById("search-input");
  if (!input) {
    console.warn("No element found with ID #search-input. Skipping initSearchInput().");
    return;
  }
  autocomplete = new google.maps.places.Autocomplete(input);
  autocomplete.addListener("place_changed", onPlaceChanged);
}

/**
 * Called whenever the place in the #search-input changes.
 * We place a red marker on the currently-active map (searchMap).
 */
function onPlaceChanged() {
  if (!autocomplete || !searchMap) return;

  const place = autocomplete.getPlace();
  if (!place.geometry || !place.geometry.location) return;

  // Center & zoom on the new location
  searchMap.setCenter(place.geometry.location);
  searchMap.setZoom(14);

  // Clear out an old marker if present
  if (searchMarker) {
    searchMarker.setMap(null);
  }

  // Place a new red marker at the selected location
  searchMarker = new google.maps.Marker({
    position: place.geometry.location,
    map: searchMap,
    icon: "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
    title: "Searched Location",
  });
}

/**
 * Dynamically set which map the search input should control.
 * Whenever we switch categories/maps, we can call this to update
 * the search input to use the new map.
 * @param {google.maps.Map} map - The current map object
 */
function setSearchMap(map) {
  searchMap = map;
}

// Expose our functions in case we want to import them in a module-based setup
window.initSearchInput = initSearchInput;
window.setSearchMap = setSearchMap;
