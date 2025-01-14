// markers.js
let mapMarkers, infoWindowMarkers, autocompleteMarkers;

function initMarkersMap() {
  // Create the map
  mapMarkers = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 40.095, lng: -74.222 },
    zoom: 12,
    disableDefaultUI: true,
  });

  infoWindowMarkers = new google.maps.InfoWindow();

  // Setup Autocomplete
  const input = document.getElementById("search-input");
  if (input) {
    autocompleteMarkers = new google.maps.places.Autocomplete(input);
    autocompleteMarkers.addListener("place_changed", () => {
      const place = autocompleteMarkers.getPlace();
      if (place.geometry?.location) {
        mapMarkers.setCenter(place.geometry.location);
        mapMarkers.setZoom(14);
      }
    });
  }
}
function drawMarkers(finalItems) {
  // Clear old data
  mapMarkers.data.forEach((f) => mapMarkers.data.remove(f));

  // Convert finalItems to GeoJSON
  const features = finalItems.map((item) => {
    return {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [
          Number(item.lng) || 0,
          Number(item.lat) || 0,
        ],
      },
      properties: {
        html: item.html || "(No details)",
      },
    };
  });

  const geojson = {
    type: "FeatureCollection",
    features,
  };

  // Add new data
  mapMarkers.data.addGeoJson(geojson);
  mapMarkers.data.setStyle({
    icon: { url: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png" },
  });

  mapMarkers.data.addListener("click", (event) => {
    const content = event.feature.getProperty("html");
    infoWindowMarkers.setContent(content);
    infoWindowMarkers.setPosition(event.latLng);
    infoWindowMarkers.open(mapMarkers);
  });

  // ====== DYNAMICALLY POPULATE knownLocations ======
  // This ensures knownLocations is updated whenever we draw markers for restaurants, businesses, etc.
  window.knownLocations = [];
  finalItems.forEach((item) => {
    window.knownLocations.push({
      name: item.html || "(No details)",
      lat: Number(item.lat) || 0,
      lng: Number(item.lng) || 0,
      details: item,
    });
  });

  // Update the UI
  displayKnownLocations();


  console.log("knownLocations updated from finalItems:", window.knownLocations);
}
