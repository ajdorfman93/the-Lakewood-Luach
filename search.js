// search.js
(function () {
  let autocomplete = null;
  let searchMap = null; // Currently active Google Map instance
  let searchMarker = null; // Marker displayed for the searched location
  let isListenerAttached = false;

  function initSearchInput() {
    if (autocomplete) {
      return autocomplete;
    }

    const input = document.getElementById("search-input");
    if (!input) {
      console.warn("No element found with ID #search-input. Skipping initSearchInput().");
      return null;
    }

    if (!window.google || !google.maps || !google.maps.places) {
      console.warn("Google Maps places library is not available yet.");
      return null;
    }

    autocomplete = new google.maps.places.Autocomplete(input);
    attachPlaceChangedListener();
    return autocomplete;
  }

  function attachPlaceChangedListener() {
    if (!autocomplete || isListenerAttached) {
      return;
    }

    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      if (!place.geometry || !place.geometry.location) {
        return;
      }
      panMapToLocation(place.geometry.location);
    });

    isListenerAttached = true;
  }

  function panMapToLocation(location) {
    if (!searchMap || !location) {
      return;
    }

    searchMap.setCenter(location);
    searchMap.setZoom(14);

    if (searchMarker) {
      searchMarker.setMap(null);
    }

    searchMarker = new google.maps.Marker({
      position: location,
      map: searchMap,
      icon: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
      title: "Searched Location",
    });
  }

  function geocodeInitialSearchValue() {
    if (!searchMap || !window.google || !google.maps) {
      return;
    }

    const input = document.getElementById("search-input");
    if (!input) {
      return;
    }

    const searchValue = input.value.trim();
    if (!searchValue) {
      return;
    }

    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ address: searchValue }, (results, status) => {
      if (status === "OK" && results[0]) {
        panMapToLocation(results[0].geometry.location);
      } else if (status !== "ZERO_RESULTS" && status !== "INVALID_REQUEST") {
        console.warn("Geocode failed:", status);
      }
    });
  }

  function setSearchMap(map) {
    searchMap = map;
    initSearchInput();
    geocodeInitialSearchValue();
  }

  window.initSearchInput = initSearchInput;
  window.setSearchMap = setSearchMap;
  window.geocodeInitialSearchValue = geocodeInitialSearchValue;
})();
